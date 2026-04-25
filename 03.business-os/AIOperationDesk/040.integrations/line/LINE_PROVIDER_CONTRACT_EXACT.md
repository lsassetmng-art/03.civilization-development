# ============================================================
# AI OPERATION DESK LINE PROVIDER CONTRACT EXACT
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the provider-facing exact contract for LINE-like delivery.

provider_modes:
- stub
- line_http

dispatch_input:
- notification_event_id
- notification_type
- destination_type
- destination_ref
- title
- body
- payload

dispatch_output:
- provider_mode
- delivery_status
- provider_message_ref
- provider_error_code
- provider_error_summary
- processed_at

rules:
- destination_type must be line for LINE provider mode
- provider payload must be compact and action-oriented
- provider dispatch is post-business-action and must not mutate canonical business truth
- provider failure can create retryable notification events later, but not duplicate business writes
