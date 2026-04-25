# ============================================================
# AI OPERATION DESK RETENTION CLEANUP REPLAY POLICY
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the retention, cleanup, and replay policy skeleton for notification
and runtime follow-on artifacts.

policy_domains:
- notification_event
- runtime audit follow-on evidence
- summary batch cleanup candidates
- retry / replay candidate review

retention_principles:
- canonical business truth is not deleted by this policy
- cleanup targets operational follow-on surfaces first
- retention review must happen before destructive cleanup implementation
- replay must target notification/provider follow-on, not canonical business write replay

notification_event_policy:
- sent:
  - review for archival / cleanup candidate later
- failed:
  - candidate for retry/backoff review
- cancelled:
  - candidate for archival / cleanup review
- pending:
  - candidate for status refresh / replay review

runtime_audit_policy:
- operational runtime audit evidence may be archived later
- canonical audit_trace remains the stronger source than runtime-only transient notes

replay_policy:
- replay target is provider dispatch / notification follow-on only
- replay must not recreate canonical business mutation
- replay candidate requires identifiable notification_event_id
- replay candidate requires delivery_status in:
  - failed
  - pending

cleanup_policy:
- current phase provides review / candidate scripts only
- destructive cleanup is not enabled in current phase
