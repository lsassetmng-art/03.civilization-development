# Next plan

## Current result expected

AICM user-company v2 tables exist:

- business.aicm_user_company
- business.aicm_user_company_department
- business.aicm_user_company_section
- business.aicm_user_company_worker_placement
- business.aicm_user_company_worker_placement_event

## Next phase

Do not migrate localStorage yet.

Next should be read-only/API design:

1. Define dashboard company context API for v2.
2. Define localStorage -> v2 migration proposal.
3. Keep dashboard-only read rule.
4. Do not enable save until payload validation is complete.

## Still stopped

- data migration
- API save
- RLS apply
- delete
