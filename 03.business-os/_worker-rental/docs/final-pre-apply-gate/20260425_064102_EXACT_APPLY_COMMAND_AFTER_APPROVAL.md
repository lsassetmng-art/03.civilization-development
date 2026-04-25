# Exact Apply Command After Approval

status: waiting-for-approval
generated_at: 20260425_064102

## 1. Do Not Run Yet

Do not run this command until:

- Boss explicitly approves DB apply
- 佐藤（DB担当） gives GO
- final pre-apply gate has no FAIL
- STOP conditions are clear

## 2. Apply Command

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 3. Verify Only Command

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 4. Environment

Required:

- PERSONA_DATABASE_URL

Forbidden for this apply:

- DATABASE_URL
- ERP-side DB apply

## 5. Notes

The apply script itself uses:

psql "$PERSONA_DATABASE_URL"

This command is intentionally not executed by this package.

