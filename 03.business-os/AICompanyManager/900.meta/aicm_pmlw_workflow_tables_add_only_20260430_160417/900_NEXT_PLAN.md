# Next plan

1. Review table split:
   President方針 → Manager大項目 → Leader中項目 → Leader成果物 → Worker作業

2. Confirm WBS future policy:
   AICM uses aicm_* physical tables.
   Future WBS app uses wbs_* physical tables.
   Same design shape, separate app-specific canonical tables.

3. Next DB/API step:
   Add clean v2 API for:
   - President policy create
   - Manager major item create/update/archive
   - Leader middle item create
   - Deliverable requirement create
   - Worker work unit create

4. Next UI step:
   Update 部門別タスク台帳 to show Manager大項目 table, not old task_ledger list.

5. Existing table remains untouched:
   - business.aicm_user_company_department_task_ledger
