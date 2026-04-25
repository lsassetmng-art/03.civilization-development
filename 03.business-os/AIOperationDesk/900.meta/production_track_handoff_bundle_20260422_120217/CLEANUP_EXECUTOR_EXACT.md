# ============================================================
# AI OPERATION DESK CLEANUP EXECUTOR EXACT
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the cleanup executor skeleton for production-track follow-on work.

scope:
- notification_event cleanup candidates
- audit_trace cleanup candidates
- summary_batch cleanup candidates

non_scope:
- canonical business truth deletion
- work_order deletion
- approval / review deletion
- destructive cleanup without explicit policy gate

modes:
- dry_run
- guarded_live

dry_run:
- load cleanup candidates
- summarize counts
- do not delete anything

guarded_live:
- load cleanup candidates
- still no destructive delete in current phase
- return guarded-no-delete result until explicit cleanup execution is approved

rules:
- cleanup executor must remain additive in current phase
- destructive cleanup is intentionally disabled here
- retention review remains primary, executor is follow-on preparation
