\pset pager off
\echo ============================================================
\echo Compare AICM company source tables readonly
\echo ============================================================

begin read only;

\echo ------------------------------------------------------------
\echo business.aicm_company rows
\echo ------------------------------------------------------------
select
  'business.aicm_company' as source_table,
  company_id,
  company_name,
  business_domain,
  company_status
from business.aicm_company
order by company_name, company_id;

\echo ------------------------------------------------------------
\echo business.ai_company_manager_company rows
\echo ------------------------------------------------------------
select
  'business.ai_company_manager_company' as source_table,
  company_id,
  company_name
from business.ai_company_manager_company
order by company_id;

rollback;
