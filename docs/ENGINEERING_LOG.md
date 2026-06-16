# AutomateXion CRM/ERP — Engineering Log & Troubleshooting Playbook

> **Purpose:** A living document for developers maintaining and extending the AutomateXion CRM/ERP platform. As this becomes a multi-client product, this log preserves hard-won debugging knowledge, recurring gotchas, architectural decisions, and a chronological change history. **Append to this file; do not let knowledge live only in chat sessions.**
>
> **Location:** `/docs/ENGINEERING_LOG.md` (committed to the repo, version-controlled, diff-friendly).
> **Last updated:** 15 June 2026 (Stock Costing, Consumables, ERD/Architecture refresh)

---

## PART A — TROUBLESHOOTING PLAYBOOK (Recurring Gotchas & Fixes)

These are patterns that have bitten us more than once. Check here FIRST when debugging.

### A1. Local DB vs Render DB — verify the RIGHT database
**Symptom:** Code change works, a save returns HTTP 200, but querying the database shows no change / stale `updated_at`.
**Cause:** The live site (`*.onrender.com`) writes to the **Render PostgreSQL**, NOT the local Docker `crm_postgres_core`. They are two separate databases that drift apart.
**Fix / Rule:**
- To verify **production** data, always query the Render DB:
  ```
  docker run --rm --network host --dns 8.8.8.8 postgres:16 psql "postgresql://erp_xion:...@dpg-...frankfurt-postgres.render.com/crm_core" -c "SELECT ..."
  ```
- The local DB (`docker exec crm_postgres_core psql -U crm_user -d crm_core`) only reflects local Docker testing.
- **Schema migrations (raw SQL) MUST be run on BOTH databases** — there is no migration framework.
**Cost when missed:** Spent multiple debugging rounds (15 Jun) querying local DB while the live edits were correctly saving to Render. Always confirm which DB before concluding "it's not saving."

### A2. UUID vs VARCHAR tenant_id / id type mismatch
**Symptom:** `operator does not exist: uuid = character varying` (HTTP 500 on reports/queries).
**Cause:** `tenant_id` is **UUID** in core tables (accounts, contacts, warehouses, warehouse_locations, products' some FKs) but **VARCHAR** in sales-service tables (invoices, stock_movements, products.tenant_id, PM tables). Similarly `product_id` is UUID in `products` but VARCHAR in `stock_movements`.
**Fix / Rule:** When joining or filtering across the boundary, cast with `::text`:
  ```sql
  WHERE p.tenant_id::text = $1
  JOIN ... ON wl.location_id::text = sm.warehouse_id::text
  ```
- When in doubt, cast both sides to `::text` for comparison.

### A3. AntD Tabs with `items` API drop field values on unmounted tabs
**Symptom:** A form with tabs displays values correctly, save returns 200, but fields on **non-active tabs** are not persisted. No PUT fires, or PUT omits those fields.
**Cause:** `<Tabs items={...} />` destroys/never-mounts inactive tab panels by default. `Form.Item`s on an unmounted tab never register, so they are excluded from the submitted values.
**Fix:** Add `forceRender: true` to EACH tab item object (not just on `<Tabs>`):
  ```js
  const formTabs = [{ key: 'basic', label: 'Basic Info', forceRender: true, children: (...) }, ...];
  ```
**Reference commit:** `626bc050`. Also added `onFinishFailed` handler to surface silent validation blocks.

### A4. Documents not linking to accounts (credit control / unblock failing)
**Symptom:** Auto credit-block/unblock not firing; reports show wrong customer aggregation.
**Cause:** Invoices/DNs/Receipts saved with `account_id = NULL` because the frontend form never set `accountId` (only `customerName`).
**Fix / Rule:** When a customer is selected on any sales document, set a hidden `accountId` field from the selected account. Provide a **name-based fallback** in backend logic (`customer_name ILIKE`) for legacy rows where `account_id` is NULL.
**Reference commits:** `e7162826`, `61824aed`, `31eb9594`, `d4d9c614`.

### A5. NestJS `throw new Error()` becomes generic 500
**Symptom:** Backend validation rejects an action but the user sees "Internal server error" instead of the real message.
**Cause:** A plain `throw new Error('msg')` is treated as an unhandled 500 by NestJS; the message is hidden.
**Fix:** Throw `BadRequestException('msg')` (import from `@nestjs/common`) so the message reaches the frontend. In try/catch guards, re-throw if `e instanceof BadRequestException`.
**Reference commit:** `e76a8de2`.

### A6. Frontend/backend field-name casing mismatch (snake_case vs camelCase)
**Symptom:** Table columns render blank ("—") and numbers show "NaN" even though data exists.
**Cause:** A raw SQL query returns snake_case columns (`product_code`, `qty_on_hand`) but the frontend column `dataIndex` expects camelCase (`productCode`, `qtyOnHand`).
**Fix:** Alias columns in the SQL to camelCase: `SELECT p.product_code as "productCode", p.stock_qty as "qtyOnHand"`. Keep all API responses camelCase for consistency.
**Reference commit:** `771c052b`.

### A7. `product_warehouse_stock` ledger must be maintained, not assumed
**Symptom:** Stock by Location report empty or products stuck in "Unassigned" despite having stock.
**Cause:** The location-stock ledger table was never written to. Stock flows only updated `stock_movements` + `products.stock_qty`.
**Fix / Rule:** `adjustStock()` is the single chokepoint — it now upserts the ledger (ADD at received/default location on IN; deduct in hierarchy order on OUT). Assigning a default location on the product master also auto-seeds the ledger via `syncProductLocationStock()` (only when ledger is empty, to avoid clobbering location-tracked stock).
**Reference commits:** `11a349a2`, `454ba320`.

### A8. Stock allocation / deduction order
**Rule (business logic):** When issuing stock, deduct from the product's **default location first**, then overflow to other locations in hierarchy order: **Zone → Rack → Shelf → Bin** (ascending). Never split randomly across locations.
**Implementation:** `deductLocationStock()` orders by `CASE WHEN location = default THEN 0 ELSE 1 END, zone, rack, shelf, bin`.

### A9. Role checks use `groupCode`, not `role`
**Symptom:** Admin-only UI not showing for an admin user.
**Cause:** The user object in localStorage has `groupCode` (e.g. `'TENANT_ADMIN'`), not a `role` field.
**Fix:** `const isAdmin = JSON.parse(localStorage.getItem('user')||'{}').groupCode === 'TENANT_ADMIN'`.
**Reference commit:** `b92d09ce`.

### A10. Two `contacts.entity.ts` files in crm-core
**Gotcha:** There is an old minimal `crm-core/src/contacts.entity.ts` AND the canonical `crm-core/src/contacts/contacts.entity.ts` (with AccountEntity, ContactEntity, LeadEntity). **Edit the one in the `/contacts/` folder** for new fields. Credit fields belong on `AccountEntity` (the `accounts` table), not contacts.

### A11. Heredoc / pasted multi-line commands get mangled in the terminal
**Symptom:** `d: command not found`, `ho: command not found`, syntax errors near unexpected tokens.
**Cause:** Multi-line commands pasted into the shell sometimes break across lines incorrectly.
**Fix:** Run build/commit/push as a single line, or save Python edit scripts to a file and run them. Verify a `python3 << 'PYEOF'` block prints its expected "OK"/"MISS" confirmation.

### A12. Verify edits actually land in the built file
**Symptom:** A code edit reported "OK" by the replacement script, the build succeeds, but the feature doesn't appear live — and a later grep shows the change is NOT in the file.
**Cause:** In a long session, an edit can be applied then inadvertently reverted/overwritten before the build captures it; or the exact-match replacement silently MISSed due to whitespace/blank-line differences that aren't visible in normal output.
**Fix / Rule:** After any edit, `grep` the file to confirm the change is present BEFORE building. For whitespace-fragile blocks, use span-replacement (find start + end markers and splice) rather than matching the whole block char-for-char. Confirm with `git show HEAD:<path> | grep ...` that the committed file (what Render builds from) actually contains the change. Use `cat -A` to reveal hidden whitespace when a match keeps failing.
**Reference commit:** `61804f3c` (costing-method dropdown had to be re-added after it went missing from an earlier build).

### A13. Consumables are NOT business inventory
**Rule (accounting decision):** Consumables are expensed on purchase — the GRN for a consumable does NOT debit 1140 Inventory and does NOT create cost layers. The `consumable_stock` table is an **operational quantity tracker only**, fully separate from `product_warehouse_stock` and the FIFO/AVCO costing engine. Issuing a consumable (Consumable Issue Voucher / CIV) decrements `consumable_stock` and records a row in `consumable_transactions`, but posts **NO GL entry** and does not affect business stock-in-hand or COGS. Never route consumables through inventory valuation. Product `product_type` distinguishes STOCK (valued, costed) from CONSUMABLE (tracked only) from FIXED_ASSET (creates draft assets) from SERVICE (no stock).
**Reference commits:** `5d3af1ba`, `750e5f6d`.

---

## PART B — STANDARD OPERATING PROCEDURES

### B1. Build & Deploy commands
**Frontend (React):**
```
cd ~/crm-platform/crm-frontend && docker run --rm -v $(pwd):/app -w /app node:20-alpine sh -c "npm run build" 2>&1 | tail -3
cd ~/crm-platform && git add -A && git commit -m "msg" && git push origin main
```
**Sales service (backend):**
```
cd ~/crm-platform && docker compose build --progress=plain sales-service 2>&1 | tail -3 && docker compose up -d sales-service && sleep 5 && docker logs crm_sales_api --tail 3
git add -A && git commit -m "msg" && git push origin main
```
**Core / PM service:** same pattern, swap `sales-service`/`crm_sales_api` for `crm-core`/`crm_core_api` or `pm-service`/`crm_pm_api`.
Render auto-deploys each service on push to `main`.

### B2. Schema change checklist
1. Run the `ALTER`/`CREATE` SQL on the **local** DB.
2. Run the SAME SQL on the **Render** DB.
3. Add/update the TypeORM entity (correct file — see A10).
4. Register entity in the service's `app.module.ts` (both the entities array AND `forFeature`).
5. Build, commit, push.

### B3. Pattern for editing source via script
Claude has no direct access to the user's machine. All edits are delivered as `python3 << 'PYEOF'` scripts (or `cat >` for new files) that the user runs locally, pasting back the printed "OK"/"MISS" confirmation. Always verify before building.

### B4. Reusable PDF export pattern
Client-side `window.open()` + inline-styled HTML + `window.print()`. Used for Feasibility, Project Report, Portfolio Report, Stock Valuation. No new dependency; branded header, KPI cards, tables, CONFIDENTIAL footer.

### B5. Stock costing engine (FIFO / Weighted Average)
- Tenant-level method in `tenants.costing_method` ('FIFO' | 'WEIGHTED_AVG'), set via Company Settings; default WEIGHTED_AVG. LIFO is excluded (not IFRS-compliant for GCC).
- `stock_cost_layers` table records each receipt as a layer (original_qty, remaining_qty, unit_cost, received_at). `products.avg_cost` holds the moving average.
- `adjustStock()` is the single chokepoint: on IN it captures unit cost, creates a layer, and recomputes the average; on OUT it calls `computeIssueCost()` which consumes oldest layers (FIFO) or uses the average (AVCO), returning the COGS.
- Delivery auto-posts the COGS journal `Dr 5001 COGS / Cr 1140 Inventory` at computed cost via `createAutoJournalEntry`.
- Opening layers for pre-existing stock must be seeded once (stock_qty × cost_price) — they don't build retroactively.

---

## PART C — CHANGE LOG (chronological, newest first)

### 15 June 2026 — Session: Stock Costing & Consumables
| Commit | Summary |
|---|---|
| 750e5f6d | Consumables: multi-item Issue Voucher (issue to dept/employee/project), no GL impact |
| 5d3af1ba | Consumable issue backend: multi-item support + issue-to type + voucher number (CIV) |
| 61804f3c | **Fix:** re-add Inventory Costing Method dropdown to Company Settings (was missing from earlier build) |
| 3d519235 | Stock Valuation report page: value by costing method, KPIs, PDF export, nav entry |
| 634e5fac | Stock Valuation report endpoint: FIFO layers / AVCO avg cost |
| fbce0925 | Costing method setting: `tenant.costingMethod` (FIFO/AVCO) entity + DTO + Company Settings dropdown |
| 04298b4e | Stock costing engine: FIFO + Weighted Avg cost layers, compute issue cost on OUT, capture unit cost on GRN IN, auto-post COGS journal (Dr 5001 / Cr 1140) on delivery |
| 3d519235 (FE) | PO line: auto-select product default location (editable); Products list: Warehouse/Location column |

### 15 June 2026 — Session: Feasibility, Reports, Stock by Location, Product form fixes
| Commit | Summary |
|---|---|
| 454ba320 | Auto-seed `product_warehouse_stock` when a product is assigned a location with existing stock (no manual SQL needed) |
| 92e5db2e | Debug instrumentation: product save logging + `onFinishFailed` validation handler |
| 626bc050 | **Fix:** product form — `forceRender` all tabs so warehouse/location (and other inactive-tab fields) persist on save |
| 771c052b | **Fix:** Stock by Location unassigned section — alias query to camelCase (was blank code/name + NaN qty) |
| d11b6497 | Product master: filter Default Location by selected warehouse, clear on change, show zone/rack/shelf/bin path |
| 74c7b63f | Stock by Location report UI: opening stock, reserved, available qty columns + shelf in hierarchy path |
| 11a349a2 | Stock by Location: maintain `product_warehouse_stock` ledger in `adjustStock` (add on IN, hierarchy-order deduct on OUT); rewrite report to read from ledger |
| c3e5bace | PM Reports: project-wise status report PDF + consolidated portfolio report PDF |
| faa32fb7 | PM Feasibility tab: NPV/IRR/ROI/Payback/PI inputs, live calc, cumulative cashflow chart, scenarios, PDF export |
| f7cafa03 | PM Feasibility: investment appraisal engine + entity + controller |

### 14 June 2026 — Session: Credit control, PDC, navigation, meeting minutes
| Commit | Summary |
|---|---|
| 48ef4bbc | Structured meeting minutes: attendees, agenda/decisions, action items with owner+due date, auto-create tasks, MoM view |
| 77e83154 | Restructure navigation: Sales/Purchase/Banking/Accounting/Inventory/Assets/Reports groups; add Received Cheques (PDC); eliminate Extended group |
| 9c62bbf0 | PDC cheque management: PDC holding account (GL 1119), list/deposit endpoints, due-count |
| e76a8de2 | **Fix:** credit guard uses `BadRequestException` so error message reaches frontend |
| 2165e349 | Stricter credit control: block when outstanding + new document value exceeds limit |
| 32b6473b | Server-side credit enforcement on DN/Invoice creation (cannot be bypassed) |
| af22f3d6 | **Fix:** credit risk report — correct field names, include credit limit from accounts |
| 53457c8a | Credit Risk page: "Run Credit Check" button for bulk auto-block/unblock |
| d4d9c614 | Credit control: name-based fallback, bulk re-check endpoint, proper auto-block/unblock |
| 31eb9594 | Receipts: pass accountId to enable auto credit unblock after payment |
| e86f350c | DN: hard block on save for credit blocked customers |
| 61824aed | Invoice/DN: set accountId on customer select for credit block check |
| e7162826 | DN: add accountId hidden field + credit block check on customer select |
| b92d09ce | **Fix:** isAdmin check uses `groupCode` not `role` |
| d59e7f5e | Add credit block fields to AccountEntity |

### Earlier (pre-log) — see prior session summaries
Credit control foundation, Bank Account Management (bank accounts, cheque books/leaves), PO→GRN→stock location flow, architecture document + interactive ERD, multi-page PDF templates, and more. Refer to the Architecture Document and ERD for the full system baseline.

---

## PART D — KNOWN PENDING ITEMS / BACKLOG
- **Gantt / Timeline view** (PM) — last item of the PM enhancement roadmap (Feasibility → Reports → Gantt). Largest UI build.
- **Daily PDC deposit reminder** on the notification bell (Received Cheques page itself is complete).
- **Consumable Issue Voucher PDF** — printable CIV like other vouchers (offered, not yet built).
- **Duplicate COGS accounts** — both 5001 and 5100 exist as "Cost of Goods Sold". The system uses **5001**; 5100 should be cleaned up.
- **Sales return values inventory at selling price** — the return path currently uses `dto.subtotal` (selling value) as the inventory/COGS-reversal amount. Now that the costing engine exists, this should be corrected to use computed cost for consistency with the sale side.
- Several report routes still hidden as "·soon" until built.

### Completed this period (previously pending)
- ✅ Credit control, PDC management, navigation restructure, structured meeting minutes, PM feasibility — done.
- ✅ `product_warehouse_stock` ledger + Stock by Location report — done.
- ✅ Stock costing (FIFO/AVCO) + COGS posting + valuation report — done.
- ✅ Consumables issue workflow — done.
- ✅ Architecture Document + ERD — refreshed (this session).

---

## PART E — MULTI-CLIENT / PRODUCT NOTES
As this becomes a sellable multi-industry product:
- Keep features **configurable, not hard-coded** to AutomateXion's assumptions (e.g. Feasibility discount rate is tenant-default + per-record override; currency from tenant settings).
- Financial math (NPV/IRR/ROI/Payback/PI) is textbook-standard so it holds across industries.
- Multi-tenant isolation via `tenant_id` on every table — never query without it.
- Frame generic engines (e.g. Investment Appraisal) so they can be reused beyond their first use case.
