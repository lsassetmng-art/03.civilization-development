\pset pager off
\echo ============================================================
\echo AICompanyManager exact company source readonly check
\echo ============================================================

begin read only;

\echo ------------------------------------------------------------
\echo 1. canonical candidate existence
\echo ------------------------------------------------------------
select
  to_regclass('business.aicm_company') as aicm_company,
  to_regclass('business.ai_company_manager_company') as ai_company_manager_company;

\echo ------------------------------------------------------------
\echo 2. business.aicm_company total/status counts
\echo ------------------------------------------------------------
select
  count(*) as total_rows,
  count(*) filter (where company_status = 'active') as active_rows,
  count(*) filter (where company_status is null) as null_status_rows,
  count(*) filter (where company_status <> 'active') as non_active_rows
from business.aicm_company;

\echo ------------------------------------------------------------
\echo 3. business.aicm_company rows
\echo ------------------------------------------------------------
select
  company_id,
  company_name,
  business_domain,
  company_status,
  left(coalesce(company_common_rules_text, ''), 80) as company_common_rules_text_head
from business.aicm_company
order by company_name, company_id;

\echo ------------------------------------------------------------
\echo 4. legacy/parallel table count
\echo ------------------------------------------------------------
select
  count(*) as ai_company_manager_company_rows
from business.ai_company_manager_company;

\echo ------------------------------------------------------------
\echo 5. legacy/parallel table rows
\echo ------------------------------------------------------------
select
  company_id,
  company_name
from business.ai_company_manager_company
order by company_name, company_id;

rollback;
