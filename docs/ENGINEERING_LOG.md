# Envoiso CRM/ERP — Engineering Log & Troubleshooting Playbook

> **Purpose:** A living document for developers maintaining and extending the Envoiso CRM/ERP platform (operated by AutomateXion Trading and Services). As this becomes a multi-client product, this log preserves hard-won debugging knowledge, recurring gotchas, architectural decisions, and a chronological change history. **Append to this file; do not let knowledge live only in chat sessions.**
>
> **Location:** `/docs/ENGINEERING_LOG.md` (committed to the repo, version-controlled, diff-friendly).
> **Last updated:** 23 June 2026 (Opening-Balance Migration Engine, Recurring Expenses, Reorder→PO Conversion, Account Recovery, AI Invoice Extraction parked)

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

### A14. PostgreSQL `date` columns hydrate as JS `Date` objects — string comparison silently fails
**Symptom:** A "find due items" query that works perfectly in raw SQL returns **0 rows** when the same logic runs in JS/TypeScript. No error — it just silently finds nothing.
**Cause:** A PG `date` column comes back to Node as a JavaScript `Date` object, not a string. Comparing `dateObj <= "2026-06-30"` (Date vs string) does not behave like the SQL `<=` — the coercion produces wrong/false results.
**Fix / Rule:** Normalize any `date` value to a `YYYY-MM-DD` string **before** comparing it in JS. Use a small helper: `const toDateStr = (d) => new Date(d).toISOString().slice(0,10);` then compare strings to strings. Better still, do date filtering in SQL (`WHERE next_due_date <= $1`) and pass a `YYYY-MM-DD` string parameter.
**Cost when missed:** The recurring-expenses "generate due" engine found 0 items despite due schedules existing — the cron silently did nothing. **Reference commit:** `a68228a2`.

### A15. In-memory caches that store DB row IDs are dangerous across deletes/restarts
**Symptom:** A foreign-key violation (`insert or update ... violates foreign key constraint`) when creating a document that references a supplier/customer — even though the lookup "succeeded."
**Cause:** A `findOrCreate` helper cached the resolved supplier/customer **id** in an in-memory `Record<string,string>`. When that row was later deleted (or the service restarted with a stale map across a different data state), the cache returned an id that no longer exists, and the insert referencing it failed the FK check.
**Fix / Rule:** Do **not** cache DB primary keys in process memory for find-or-create. Query the DB every time — it is a cheap indexed lookup. A cache that outlives the lifetime/validity of the thing it caches is a latent bug, especially for multi-tenant data that other instances can mutate.
**Cost when missed:** Recurring "bill" generation hit FK violations after test data was cleaned. Removed `_ocCustomerCache` / `_ocSupplierCache`. **Reference commit:** `cf81e16d`.

### A16. The audit-log DTO (`AuditLogInput`) has a fixed field set — `description` is NOT one of them
**Symptom:** Build fails: `error TS2353: Object literal may only specify known properties, and 'description' does not exist in type 'AuditLogInput'.`
**Cause:** `auditService.log({...})` accepts only: `tenantId`, `userId`, `userName`, `module`, `action`, `entityType`, `entityId`. There is no free-text `description` field. Adding one breaks the TypeScript build.
**Fix / Rule:** Match the existing audit calls exactly — copy the field set from a known-good call (e.g. users.service `resetPassword`). `entityType` is lowercase by convention (`'user'`, not `'User'`). Put any descriptive nuance into `action` or leave it out. **Reference:** account-unlock audit call.

### A17. crm-core auth is PER-ROUTE, not a global guard — public endpoints just omit the guard
**Symptom:** Need an endpoint reachable without a token (e.g. login, forgot-password, reset-password for a locked-out user) and unsure how to make it "public."
**Cause/Fact:** crm-core does **not** register a global `APP_GUARD`. Each protected route carries its own `@UseGuards(JwtAuthGuard)`. There is **no `@Public()` decorator** in the codebase (don't look for one).
**Fix / Rule:** To make an endpoint public, simply **do not add `JwtAuthGuard`**. For login-adjacent public endpoints, add `@UseGuards(ThrottlerGuard)` for rate-limiting (mirrors the `login` endpoint). This is exactly what password-recovery endpoints need, since a locked-out/forgotten user cannot authenticate. **Reference commits:** `4bd20bd2`, `8f9ae5ed`.

### A18. Email uniqueness is PER-TENANT, not global
**Symptom:** Designing "forgot password" by email alone is ambiguous.
**Cause/Fact:** Login is `tenantCode + email + password`; the user lookup is `WHERE email = ? AND tenant_id = ?`. The same email address can therefore exist in multiple tenants as distinct users.
**Fix / Rule:** Any flow that resolves a user from an email **must also take the tenant/company code** (forgot-password takes `{ tenantCode, email }`, matching the login form). Never assume an email maps to exactly one user system-wide.

### A19. Base64 file delivery — the stale-file download trap
**Symptom:** A freshly-generated file is "delivered," decoded on the local machine, built, and committed — but the change doesn't appear, and `git commit` reports a suspiciously small diff (e.g. "1 file changed, 1 insertion"). A later `wc -l` shows the **old** file content.
**Cause:** When an updated file is re-presented under the **same name**, the browser may not re-download it (it already has that filename in Downloads), so decoding reads the **previous** version. The decode "succeeds" but writes stale content.
**Fix / Rule:** (1) Present updated files under a **new name** (`_v2`) to force a fresh download. (2) **Always verify the decode**: `base64 -d file.b64 | wc -l` and `grep -c <new-marker>` **before** building/committing. (3) Treat a tiny `git commit` summary as a red flag that the decode didn't land.
**Cost when missed:** The reorder→PO frontend appeared to deploy but was the old 260-line file; only after re-presenting as `ReorderReport_v2` did the real 292-line version land. **Reference commit:** `bceda601`.

### A20. Render free-tier services cold-start (~45–60s) after ~15 min idle — NOT a bug
**Symptom:** A page (e.g. Project Management) "hangs" / doesn't load for ~45 seconds after the app has been idle, then works instantly afterwards.
**Cause:** Render **free** instances spin down after ~15 minutes of no traffic. The next request must wait for a full cold-start (a NestJS service + DB connect is ~45–60s). Confirmed via timed curl: first hit `46s`, second hit `0.4s`.
**Fix / Rule:** Not a code bug. Options: (a) upgrade customer-facing services to Render **Starter** (~$7/mo each) to stay always-on — do this for **crm-core** and any demo-facing service before customer demos; (b) warm the services by hitting each endpoint a minute before a demo; (c) tolerate it during solo development. A 46s wait in front of a client reads as "broken," so warm or upgrade before any demo.

---

### A14. PostgreSQL `date` columns hydrate as JS `Date` objects — string comparison silently fails
**Symptom:** A query that works perfectly in raw SQL returns zero matches in JS. E.g. the recurring "generate due" engine found 0 due schedules even though due rows clearly existed.
**Cause:** A PG `date`/`timestamp` column comes back into Node as a JavaScript `Date` object, not a string. Comparing `row.next_due_date <= "2026-06-23"` (Date vs string) does **not** behave like the SQL comparison — it coerces in surprising ways and silently yields false.
**Fix / Rule:** Normalize to a `YYYY-MM-DD` string before any JS-side date comparison:
```js
const toDateStr = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10));
if (toDateStr(row.next_due_date) <= todayStr) { ... }
```
Prefer doing date filtering in SQL (`WHERE next_due_date <= $1`) where possible; only compare in JS after normalizing.
**Reference commit:** `a68228a2`.

### A15. In-memory caches that store DB row IDs are dangerous across deletes/restarts
**Symptom:** A foreign-key violation inserting a child row (e.g. a recurring BILL referencing a supplier) even though "the supplier exists" — or did a moment ago.
**Cause:** A `findOrCreate` helper cached the resolved supplier/customer **id** in an in-memory object (`_ocSupplierCache`). When that row was later deleted (or the cache survived a restart while the row didn't), the stale id was reused, producing an FK violation. Caching DB primary keys in process memory assumes the DB never changes underneath you — it does.
**Fix / Rule:** Do **not** cache DB row ids in memory for correctness-critical lookups. Query the DB every time (an indexed lookup is cheap). Reserve in-memory caches for immutable/derived data, never for "does this row still exist."
**Reference commit:** `cf81e16d`.

### A16. `AuditLogInput` has a fixed field set — `description` is NOT one of them
**Symptom:** Build fails: `error TS2353: Object literal may only specify known properties, and 'description' does not exist in type 'AuditLogInput'`.
**Cause:** `this.auditService.log({...})` accepts only: `tenantId, userId, userName, module, action, entityType, entityId`. There is no free-text `description` field. `entityType` is lowercase by convention (`'user'`, not `'User'`).
**Fix / Rule:** Match the existing audit calls exactly — no `description`. If you need detail, encode it in `action`/`entityType`. Copy a nearby working `auditService.log(...)` call rather than inventing fields.
**Reference commit:** `8f9ae5ed` (account-recovery build; removed the invalid `description`).

### A17. crm-core auth is PER-ROUTE — there is no global guard and no `@Public` decorator
**Symptom:** Need a public (unauthenticated) endpoint — e.g. forgot/reset-password for a locked-out user who has no token.
**Cause/Reality:** crm-core does **not** register a global `APP_GUARD`. Each protected route carries its own `@UseGuards(JwtAuthGuard)`. There is **no** `@Public()` decorator in the codebase (don't look for one).
**Fix / Rule:** To make an endpoint public, simply **omit** `@UseGuards(JwtAuthGuard)`. Add `@UseGuards(ThrottlerGuard)` for rate-limiting (the pattern `login` uses). To make one protected, add the JWT guard.
**Reference:** `auth.controller.ts` — `login`, `forgot-password`, `reset-password` are guard-free (ThrottlerGuard only); `me`, `2fa/*`, `logout` use `JwtAuthGuard`.

### A18. Email/login identity is per-TENANT, not global
**Symptom:** Designing forgot-password by email alone is ambiguous.
**Cause:** Login is `tenantCode + email + password`; the user lookup is `WHERE email = $1 AND tenant_id = $2`. The same email can exist in multiple tenants. Email is **unique per tenant**, not globally.
**Fix / Rule:** Any cross-tenant identity flow (forgot-password, invites) must include the **company/tenant code** to disambiguate. The forgot-password form asks for company code + email, mirroring login.

### A19. base64 file delivery — the stale-download trap
**Symptom:** You decode a re-sent `file.b64`, the build is clean, but the change isn't live; a later `wc -l`/`grep` shows the OLD file content.
**Cause:** Re-presenting an updated `*.b64` under the **same filename** doesn't always re-download — the browser/Downloads keeps the previous version, so `base64 -d` silently writes stale content. Hit twice (ReorderManagementReport 260 vs 292 lines).
**Fix / Rule:** Present updated files under a **new name** (`_v2`) to force a fresh download, and **always verify the decoded result** before trusting it:
```bash
base64 -d ".../File_v2.tsx.b64" | wc -l        # confirm expected line count
base64 -d ".../File_v2.tsx.b64" | grep -c NEW   # confirm new content present
```
A `git commit` reporting "1 file changed, 1 insertion(+)" when you expected a big change is the same tell — the decode didn't land.

### A20. Render free tier cold-start (~46s) is NOT a bug
**Symptom:** A page (e.g. PM) "hangs" / doesn't load for ~30-60s after a period of inactivity, then works instantly.
**Cause:** Render **free** instances spin down after ~15 min idle; the next request pays a cold-start (measured ~46s for a NestJS service to boot + connect). Subsequent requests are fast (<1s).
**Fix / Rule:** Not a code issue. For demos/production, upgrade the customer-facing services (at minimum **crm-core** + the demo target) to a paid Starter instance (always-on), or warm the services by hitting them right before a demo. Confirm cold-start vs. real error with `time curl -s -o /dev/null -w "%{http_code}" <service-root>` — a slow first call then a fast second call = cold-start, not a crash.

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

### B6. Opening-balance migration engine (AR / AP / Assets / GL / Stock)
- Purpose: load a new tenant's opening balances at go-live so AR, AP, inventory and the GL start reconciled.
- AR/AP loaders use **find-or-create** master helpers: `findOrCreateCustomer(tenantId, name, rich)` (matches `accounts` by `account_name ILIKE` where `is_customer=true`; creates with email/phone/address/city) and `findOrCreateSupplier(tenantId, name, rich)` (the `suppliers` table, auto-code `SUP-NNNN`, with trn/email/phone/address/city/country/paymentTerms). Both return `{ id, created }` and are **cache-free** (see A15) — they query the DB every call.
- **Control-account model (important):** ALL customers roll up to AR control **1130**; ALL suppliers to AP control **2110**. Customers/suppliers are name/id-keyed **sub-ledgers**; `accounts.account_code` is unused (NOT a COA link). So an opening AR/AP posting is the grand total to 1130/2110 with the contra to **3900 Opening Balance Equity (OBE)** — this is accounting-correct.
- Phase B "rich field" loaders store contact/address detail on the created masters. GL and Stock rich-field loaders were deliberately **not** built (low value vs. touching the shared posting core / cost-layer fiddliness — documented won't-do).

### B7. Recurring expenses engine (scheduled journals & bills)
- Tables: `recurring_expenses` (the schedule) + `recurring_expense_log` with **`UNIQUE(recurring_id, period_date)`** as the idempotency guard.
- Engine `generateDueRecurringItems(tenantId?)`: **no arg = all tenants** (the cron path); **arg = one tenant** (manual button). Finds active due schedules, runs a **catch-up while-loop** (guard < 60 iterations) so a schedule that missed periods generates each missed period once.
- Idempotency: claims a period by `INSERT INTO recurring_expense_log ... ON CONFLICT DO NOTHING RETURNING` — if no row returns, the period was already done and is skipped. **Caveat:** a permanently-FAILED period keeps its log slot and will not auto-retry; clearing the FAILED log row lets it retry. (v1 accepted; a max-retry/disable refinement is backlogged.)
- Generates either a **JOURNAL** (Dr expense account / Cr credit account, +VAT to 1160 if vat>0) or a **BILL** (a draft `purchase_invoice` reusing `findOrCreateSupplier`), at `status` per the schedule's `post_mode` (DRAFT default). `advanceDate` moves `next_due_date` by frequency×interval with day-of-month clamping. A **FAILED period does not advance** (so it retries next run).
- Daily `@Cron('0 2 * * *')` via `@nestjs/schedule` (`ScheduleModule.forRoot()` + a `RecurringScheduler` provider) calls the engine for all tenants; a manual `POST /sales/recurring-expenses/generate-due` is the backstop.
- **Multi-tenancy:** all CRUD is tenant-scoped; the cron threads each schedule's own `tenant_id` (`tid = sc.tenant_id`) through **every** write (log, supplier, bill, journal, COA lookup) — no cross-tenant leak. Two internal engine UPDATEs scope by `recurring_id` (UUID PK) only — safe today; adding `AND tenant_id` is a backlogged defense-in-depth nicety.
- **Reference commits:** `7829530f` (engine+cron+CRUD), `a68228a2` (date fix, see A14), `5dc396c5` (frontend), `b065a4ff` (COA dropdown endpoint fix), `cf81e16d` (cache fix, see A15).

### B8. Account recovery (admin unlock + self-service password reset)
- **Lockout policy:** 5 failed logins → 30-minute lock (`failed_login_count` + `locked_until` on `users`, set in `auth.service handleFailedLogin`). A successful login and any password reset clear both.
- **Admin unlock (Part A):** `unlockUser(tenantId, userId, unlockedBy)` clears the lock without changing the password; endpoint `PATCH /users/:id/unlock`. The users-list `select` now returns `lockedUntil`/`failedLoginCount`; the Users page shows a red **Locked** badge and a conditional **Unlock** button. (Admin reset-password already existed and also clears the lock.)
- **Self-service (Part C):** table `password_reset_tokens` (token, user_id, tenant_id, expires_at, used_at). Public endpoints (no `JwtAuthGuard`, with `ThrottlerGuard` — see A17): `POST /auth/forgot-password` `{ tenantCode, email, resetBaseUrl? }` issues a 96-char crypto token (1-hour expiry), invalidates prior unused tokens, emails a reset link via the tenant's `settings.emailConfig` (nodemailer, reused from tenants.service), and **always returns a generic success** (no account enumeration). `POST /auth/reset-password` `{ token, newPassword }` validates (exists / not used / not expired), bcrypt-hashes, clears lockout, marks the token used.
- Frontend: a "Forgot your password?" modal on the login page (company code + email), and a public `/reset-password?token=…` page.
- **Security properties:** single-use expiring tokens, no enumeration, rate-limited, lockout cleared on reset. Use **`bcryptjs`** (the file's existing import) — not native `bcrypt`.
- **Reference commits:** `4bd20bd2` (Part A+B), `8f9ae5ed` (Part C).

---

### B6. Opening-balance migration engine (AR / AP / GL / Stock)
- Loads a tenant's opening balances at go-live. AR/AP loaders create real, selectable master records via `findOrCreateCustomer` / `findOrCreateSupplier` (match by name ILIKE within tenant; create with rich fields; auto supplier code SUP-NNNN). All customers roll up to **AR control 1130**, all suppliers to **AP control 2110** (fixed control accounts — `accounts.account_code` is unused, NOT a COA link), with the contra to **3900 Opening Balance Equity (OBE)**. So a grand-total AR/AP posting to the control account + OBE is accounting-correct.
- Phase B adds rich-field capture (email/phone/address/city/TRN/payment terms) on the created masters. GL and Stock rich-field loaders were deliberately **not** built (low value vs. risk of touching the shared posting core; stock cost layers are already correct).
- **Do not cache** the resolved master ids (see A15).

### B7. Recurring expenses (schedule → journal/bill, cron, idempotent catch-up)
- Tables: `recurring_expenses` (schedule) + `recurring_expense_log` with **`UNIQUE(recurring_id, period_date)`** as the idempotency guard.
- Engine `generateDueRecurringItems(tenantId?)`: no arg = all tenants (cron path), arg = one tenant (manual button). Finds active due schedules, runs a catch-up while-loop (guard <60), **claims each period via `INSERT ... ON CONFLICT DO NOTHING RETURNING`** (idempotent), then creates a JOURNAL (Dr expense / Cr credit account, +VAT 1160 if any) or a draft BILL (reusing `findOrCreateSupplier`) at status per the schedule's `post_mode` (DRAFT default), advances `next_due_date`, and logs the outcome. A failed period does **not** advance — it retries next run.
- Daily `@Cron('0 2 * * *')` via `@nestjs/schedule` (added `ScheduleModule.forRoot()` + a `RecurringScheduler` provider). Manual trigger `POST /sales/recurring-expenses/generate-due` is the backstop.
- **Idempotency caveat:** a FAILED log row still occupies the unique slot, so a retry is skipped until that row is cleared. To force a retry of a genuinely-failed period: `DELETE FROM recurring_expense_log WHERE status='FAILED' AND ...`. (v1 behaviour; a self-clearing-on-failure refinement is backlogged.)
- Multi-tenant audited: every CRUD query is tenant-scoped; the cron threads each schedule's own `tenant_id` (`tid = sc.tenant_id`) through every write — no cross-tenant leak. Two internal engine UPDATEs scope by `recurring_id` (UUID PK) only — safe, with `AND tenant_id` as a backlogged defense-in-depth.

### B8. Account recovery (admin unlock + self-service reset)
- **Lockout:** 5 failed logins → 30-min lock (`failed_login_count`, `locked_until` on `users`). A successful login, an admin reset, or an admin unlock clears both.
- **Admin unlock:** `unlockUser()` + `PATCH /users/:id/unlock` (clears count + lock, audit-logged). Users list select must include `lockedUntil`/`failedLoginCount` for the UI "Locked" badge + Unlock button.
- **Self-service:** table `password_reset_tokens` (token, user, expires_at, used_at). Public endpoints (no JwtAuthGuard, ThrottlerGuard): `POST /auth/forgot-password` {tenantCode, email} → 96-char crypto token, 1-hr expiry, prior unused tokens invalidated, reset link emailed via the tenant's `settings.emailConfig` (nodemailer); **always returns a generic success (no account enumeration)**. `POST /auth/reset-password` {token, newPassword} → validates (exists/unused/unexpired), bcrypt-hashes, clears lockout, marks token used (single-use). All proven end-to-end on AWAK.

### B9. AI invoice extraction (BUILT, PARKED — needs API key + UI)
- Backend `extractInvoice(tenantId, fileBase64, mediaType)` calls the Anthropic Messages API via native fetch (model `claude-haiku-4-5`, ~\$0.007/invoice), strict-JSON extraction prompt, matches supplier (suggestion only), returns a purchase-invoice prefill + confidence. Endpoint `POST /sales/extract-invoice`. Reads `process.env.ANTHROPIC_API_KEY`.
- **To resume:** add `ANTHROPIC_API_KEY` to the sales-service env (docker-compose + Render dashboard), test with a real invoice, then build the upload/review UI (pre-fills the PO/invoice form, low-confidence flagged, human confirms & posts). Safety boundary: AI drafts, a human always posts.

## PART C — CHANGE LOG (chronological, newest first)

### 23 June 2026 — Session: Account Recovery (unlock + self-service reset)
| Commit | Summary |
|---|---|
| 8f9ae5ed | Account recovery Part C: self-service forgot/reset password — `password_reset_tokens` table, public `/auth/forgot-password` + `/auth/reset-password` (single-use 96-char tokens, 1-hr expiry, no account enumeration, rate-limited, lockout cleared on reset, email via tenant SMTP), forgot-password modal on login + `/reset-password` page |
| 4bd20bd2 | Account recovery Part A+B: admin unlock (`/users/:id/unlock`, Locked badge + Unlock button), lock fields in users list, clearer lockout message pointing to reset/admin |

### 22 June 2026 — Session: Reorder→PO conversion, Recurring Expenses, Opening Balances
| Commit | Summary |
|---|---|
| bceda601 | Reorder→PO frontend: per-line warehouse delivery (each item to its own location, pre-filled from product default, "deliver all to" convenience) + computed PO header totals |
| e90b493d | Reorder→PO: backend location field on reorder rows; fix PO header totals (subtotal/total were 0 — `createPurchaseOrder` doesn't auto-sum) |
| 0d1b2f3c | Reorder Management: select items → create draft PO (supplier + warehouse picker, editable qty/price) |
| cf81e16d | **Fix:** remove in-memory cache returning stale supplier/customer ids after deletes (FK violation in recurring bills) — query DB every time (see A15) |
| b065a4ff | **Fix:** recurring account dropdowns load COA from `salesApi /sales/chart-of-accounts` (was wrong endpoint → "No data") |
| 5dc396c5 | Recurring Expenses frontend: admin page (list/create/edit schedules, generate-due, due badge, history) + route + nav + `recurringApi` |
| a68228a2 | **Fix:** recurring engine normalize PG date columns to `YYYY-MM-DD` before JS comparison (date-vs-string bug → found 0 due; see A14) |
| 7829530f | Recurring expenses engine: schedule → journal/bill, draft, idempotent catch-up + daily `@Cron` via `@nestjs/schedule` + manual trigger + due-count + full CRUD |
| 7c0e6ac9 | AI invoice extraction backend (PARKED): `extractInvoice` via Anthropic Messages API (`claude-haiku-4-5`), strict-JSON, supplier match, purchase-invoice prefill — awaiting API key + UI |
| 4f2aac81 | Opening balances: customer/supplier master find-or-create + linkage (real selectable masters, dedup, rich fields, auto SUP-NNNN); AR→control 1130 / AP→control 2110 / contra OBE 3900 |


### 23 June 2026 — Session: Account Recovery (admin unlock + self-service reset)
| Commit | Summary |
|---|---|
| 8f9ae5ed | Account recovery Part C: self-service forgot/reset password — `password_reset_tokens` table, public `/auth/forgot-password` + `/auth/reset-password` (single-use 96-char token, 1hr expiry, no enumeration, rate-limited, lockout cleared on reset), email via tenant SMTP, forgot-password modal on login + `/reset-password` page. Full token lifecycle tested. |
| 4bd20bd2 | Account recovery Part A+B: admin unlock action (Locked badge + Unlock button on Users page) + `PATCH /users/:id/unlock` clearing failed-count/lock; clearer lockout message pointing to reset/admin. |

### 22 June 2026 — Session: Reorder→PO conversion, Recurring Expenses, Opening Balances
| Commit | Summary |
|---|---|
| bceda601 | Reorder→PO frontend (the real 292-line landing after a stale-file retry, see A19): per-line warehouse delivery (each item to its own location, pre-filled from product default, + "deliver all to" convenience) and computed PO header totals. |
| e90b493d | Reorder→PO backend: add product default `locationId`/`warehouseId` to reorder report rows (fixes header total = 0 by computing/sending subtotal/total). |
| 0d1b2f3c | Reorder Management: select items → convert to draft Purchase Order (supplier + warehouse picker, editable qty/price). |
| cf81e16d | **Fix:** remove in-memory find-or-create cache returning stale supplier/customer ids after deletes (FK violation in recurring bills) — see A15. |
| b065a4ff | **Fix:** recurring-expenses account dropdowns load COA from `salesApi /sales/chart-of-accounts` (was hitting the wrong endpoint → "No data"). |
| 5dc396c5 | Recurring Expenses frontend: admin page (list/create/edit schedules, generate-due button, due badge, history) + route + nav + recurringApi helper. |
| a68228a2 | **Fix:** recurring engine normalizes PG `date` to `YYYY-MM-DD` strings before JS comparison (Date-vs-string bug → 0 due items) — see A14. |
| 7829530f | Recurring expenses: schedule engine (journal/bill, draft, idempotent catch-up) + daily `@Cron` via `@nestjs/schedule` + manual trigger + due-count + full CRUD. |
| 7c0e6ac9 | AI invoice extraction backend (PARKED — needs `ANTHROPIC_API_KEY` + frontend UI): `extractInvoice` calls Anthropic `claude-haiku-4-5` via native fetch, strict-JSON extraction, supplier-match suggestion, maps to purchase-invoice prefill. Human confirms/posts. |
| 4f2aac81 | Opening-balance AR/AP loaders wired to find-or-create customer/supplier masters (real selectable records + created counts). |



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
- **AI invoice extraction (PARKED — resume when ready):** backend is built and pushed (`7c0e6ac9`). To finish: (1) get an Anthropic API key from console.anthropic.com (~$5 credit; `claude-haiku-4-5` ≈ $0.007/invoice); (2) add `ANTHROPIC_API_KEY` to docker-compose sales-service env **and** the Render dashboard (sales-service → Environment); (3) test with a real invoice; (4) build the frontend upload+review UI that pre-fills the purchase-invoice form (low-confidence fields flagged; a human confirms and posts). Safety boundary: AI drafts, human posts.
- **Multi-tenancy defense-in-depth (minor):** two recurring-engine UPDATEs scope by `recurring_id` (UUID PK) only. Safe today; add `AND tenant_id = …` as belt-and-suspenders.
- **Recurring v1 caveat:** a permanently-FAILED period retries forever (its log row never advances). Acceptable for v1; add a max-retry → auto-disable later.
- **Render free-tier cold-start:** upgrade crm-core + demo-facing services to Starter (~$7/mo) before customer demos (see A20).
- **Gantt / Timeline view** (PM) — last item of the PM enhancement roadmap. Largest UI build.
- **Daily PDC deposit reminder** on the notification bell.
- **Consumable Issue Voucher PDF** — printable CIV like other vouchers.
- **Duplicate COGS accounts** — both 5001 and 5100 exist; standardise on 5001, clean up 5100.
- **Sales return values inventory at selling price** — should use computed cost now that the costing engine exists.
- **Credit block columns on contacts table** — accidentally added; belong only on accounts.
- **Bank Statement Upload (Phase 3)** — CSV/PDF upload + auto-reconciliation.
- **Receipts bounced-cheque workflow** — no auto-block on bounce yet.
- Several report routes still hidden as "·soon" until built.
- **Pre-launch financial items** (from the Financial Integrity Audit): clean opening balances on go-live (now supported by the opening-balance engine — see B6), input validation (required invoice date + sanity threshold), separate trade vs asset payables (2115), historical COGS backfill.

### Completed since last log (previously pending or new)
- ✅ **Account recovery** — admin unlock + self-service forgot/reset password (all proven). Closes the lockout production gap.
- ✅ **Recurring expenses** — schedule engine + cron + CRUD + UI (proven, multi-tenant audited).
- ✅ **Reorder→PO conversion** — per-line warehouse + correct totals (proven).
- ✅ **Opening-balance migration** — AR/AP loaders with customer/supplier master linkage.
- ⏸️ **AI invoice extraction** — backend built, PARKED pending Anthropic API key + review UI (see B9).

### New backlog items
- **Recurring engine multi-tenancy defense-in-depth** — two internal UPDATEs scope by `recurring_id` (UUID PK) only; add `AND tenant_id` (belt-and-suspenders; safe today).
- **Recurring FAILED-period retry** — a permanently-failing period retries forever and a FAILED log row blocks retry until manually cleared; add max-retries → auto-disable, and/or self-clear the log row on failure.
- **Render free-tier cold-start** — upgrade crm-core + demo-facing services to paid Starter before any customer demo (see A20).
- **Separate trade vs asset payables (2115)**, **historical COGS backfill**, **duplicate COGS 5001/5100 cleanup**, **input validation (required invoice date + sanity threshold)** — pre-launch financial items (see Financial Integrity Audit).

### Completed this period (previously pending)
- ✅ **Account recovery** — admin unlock + clearer lockout message + self-service forgot/reset password (all three parts), tested end-to-end.
- ✅ **Recurring expenses** — engine + daily cron + manual trigger + full CRUD + UI; multi-tenancy audited.
- ✅ **Reorder → PO conversion** — select items → draft PO with per-line warehouse + correct totals.
- ✅ **Opening-balance migration engine** — AR/AP/Assets with find-or-create masters; OBE contra.
- ✅ Credit control, PDC management, navigation restructure, structured meeting minutes, PM feasibility — done.
- ✅ `product_warehouse_stock` ledger + Stock by Location report — done.
- ✅ Stock costing (FIFO/AVCO) + COGS posting + valuation report — done.
- ✅ Consumables issue workflow — done.
- ✅ Architecture Document + ERD — refreshed (23 Jun: + recurring/reset tables, account-recovery flow, rebranding).

---

## PART E — MULTI-CLIENT / PRODUCT NOTES
As this becomes a sellable multi-industry product:
- Keep features **configurable, not hard-coded** to AutomateXion's assumptions (e.g. Feasibility discount rate is tenant-default + per-record override; currency from tenant settings).
- Financial math (NPV/IRR/ROI/Payback/PI) is textbook-standard so it holds across industries.
- Multi-tenant isolation via `tenant_id` on every table — never query without it.
- Frame generic engines (e.g. Investment Appraisal) so they can be reused beyond their first use case.
