# ============================================================
# ACCESS GOVERNED APPLY BATCH PREPARATION NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- prepare governed apply batch from latest governed apply queue
- store apply skeleton SQL per item
- record dry-run attempt log before real runtime apply

policy:
- additive only
- no schema drop
- no runtime grant apply in this step
- prepared_sql_text is skeleton only
- final apply requires governed approval and execution path
