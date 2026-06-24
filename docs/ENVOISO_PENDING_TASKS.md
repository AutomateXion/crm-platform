# Envoiso — Pending Tasks / Backlog

## Auth & Security (NEW — flagged this session)
- [ ] **Account unlock / password reset flow for administrators**
      - When a user is locked out (failed_login_count threshold → locked_until set),
        there is currently NO self-service or admin-driven way to unlock/reset.
      - Today the only fix is a manual SQL update (UPDATE users SET failed_login_count=0,
        locked_until=NULL WHERE email=...). Not acceptable for production / customers.
      - Build:
        (a) Super Admin / tenant-admin "Unlock account" action in the admin portal
            (lists locked users, one-click unlock).
        (b) "Forgot password" self-service reset (email link / OTP).
        (c) Lockout message should surface a reset path, not just "try again in N minutes".
        (d) Optionally: log lockout events for admin visibility/audit.
      - Context: lockout uses users.failed_login_count + users.locked_until.
        Password hashing = bcrypt $2b$ (10 rounds).

## Recurring Expenses (in progress this session)
- [ ] Frontend "Recurring Expenses" admin page (list/create/edit, next-due, Generate-due button, due badge)
- [ ] Full-cycle test on AWAK (create → generate → verify draft → idempotency → catch-up)
- [ ] v1 caveat: failed periods retry forever each run if account permanently deleted
      (acceptable v1; add "max retries → disable" later)

## AI Invoice Extraction (parked — awaiting API key)
- [ ] Apply patch_extract_invoice.py (already applied per controller anchor), build, push
- [ ] Add ANTHROPIC_API_KEY to docker-compose + Render dashboard (sales-service)
- [ ] Get key from console.anthropic.com (~$5 credit)
- [ ] Test extraction with real invoice; build frontend upload+review UI

## Phase B — documented won't-do (deliberate)
- GL cost-center/reference rich fields (would touch postOpeningBalanceJournal core — not worth it)
- Stock warehouse/batch/expiry rich fields (fiddly, cost layers already correct)

## Minor known backlog (none urgent)
- ProductsPage "Type" column cosmetic bug
- Product fetch limit:100 truncation risk
- OBE residual reclass workflow
- Audit other native bcrypt imports
- CRM architecture & ERD docs need updating to reflect completed credit-control enforcement
