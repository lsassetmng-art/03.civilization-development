select 'business.aicm_department_task_ledger' as object_name, count(*)::text as row_count from business.aicm_department_task_ledger union all
select 'business.aicm_manager_major_work_item' as object_name, count(*)::text as row_count from business.aicm_manager_major_work_item union all
select 'business.aicm_task_file_metadata' as object_name, count(*)::text as row_count from business.aicm_task_file_metadata union all
select 'business.aicm_task_ledger_csv_import_batch' as object_name, count(*)::text as row_count from business.aicm_task_ledger_csv_import_batch union all
select 'business.aicm_task_ledger_csv_import_row' as object_name, count(*)::text as row_count from business.aicm_task_ledger_csv_import_row union all
select 'business.aicm_user_company_department_task_ledger' as object_name, count(*)::text as row_count from business.aicm_user_company_department_task_ledger union all
select 'business.robot_pool_sync_ledger' as object_name, count(*)::text as row_count from business.robot_pool_sync_ledger union all
select 'business.task' as object_name, count(*)::text as row_count from business.task union all
select 'business.vw_aicm_pmlw_deliverable_requirement_display' as object_name, count(*)::text as row_count from business.vw_aicm_pmlw_deliverable_requirement_display union all
select 'business.vw_aicm_pmlw_leader_middle_display' as object_name, count(*)::text as row_count from business.vw_aicm_pmlw_leader_middle_display union all
select 'business.vw_aicm_pmlw_major_work_display' as object_name, count(*)::text as row_count from business.vw_aicm_pmlw_major_work_display union all
select 'business.vw_aicm_pmlw_president_policy_display' as object_name, count(*)::text as row_count from business.vw_aicm_pmlw_president_policy_display union all
select 'business.vw_aicm_pmlw_worker_work_unit_display' as object_name, count(*)::text as row_count from business.vw_aicm_pmlw_worker_work_unit_display union all
select 'business.vw_aicm_pmlw_workflow_tree' as object_name, count(*)::text as row_count from business.vw_aicm_pmlw_workflow_tree union all
select 'business.vw_aicm_user_company_department_task_ledger_display' as object_name, count(*)::text as row_count from business.vw_aicm_user_company_department_task_ledger_display
