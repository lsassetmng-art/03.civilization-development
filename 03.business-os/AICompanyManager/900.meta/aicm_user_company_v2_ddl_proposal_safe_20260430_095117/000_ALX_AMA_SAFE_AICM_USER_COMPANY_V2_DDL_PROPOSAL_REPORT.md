# AICompanyManager Phase ALX-AMA SAFE
# AICM user-company v2 table design / add-only DDL proposal

generated_at: 2026-04-30 09:51:18 +0900

PASS_COUNT=6
WARN_COUNT=0
FAIL_COUNT=0
FINAL_STATUS=AICM_USER_COMPANY_V2_DDL_PROPOSAL_DONE_REVIEW_REQUIRED

SCOPE=DESIGN_AND_DDL_PROPOSAL_ONLY
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=NOT_EXECUTED
DB_READ=READ_ONLY
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

Generated:
- DESIGN_DOC=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/aicm_user_company_v2_ddl_proposal_safe_20260430_095117/100_AICM_USER_COMPANY_V2_TABLE_DESIGN.md
- DDL_PROPOSAL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/aicm_user_company_v2_ddl_proposal_safe_20260430_095117/110_PROPOSED_AICM_USER_COMPANY_V2_ADD_ONLY_DDL.sql
- MIGRATION_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/aicm_user_company_v2_ddl_proposal_safe_20260430_095117/120_MIGRATION_COMPATIBILITY_NOTE.md
- DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/aicm_user_company_v2_ddl_proposal_safe_20260430_095117/020_readonly_existing_aicm_tables.txt
- NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/aicm_user_company_v2_ddl_proposal_safe_20260430_095117/300_NEXT_PLAN.md

Main decision:
- BusinessOS ownership root is owner_civilization_id.
- AICompanyManager company is app-registered user company, not ERP company.
- Add-only v2 tables separate user-owned company hierarchy from robot entitlement and ERP company concepts.
