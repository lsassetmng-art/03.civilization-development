# ============================================================
# AI OPERATION DESK PROVIDER DELIVERY RESULT FLOW
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the provider-result back-write and retry/backoff flow after
notification_event persistence and provider dispatch decision.

flow:
1. notification_event is created or identified
2. provider dispatch runs
3. provider returns normalized result
4. normalized result is written back to notification_event
5. dispatch journal record is created
6. retry/backoff recommendation is computed
7. response or job context is enriched

normalized_delivery_status:
- pending
- sent
- failed
- cancelled

backwrite_rules:
- provider result back-write is additive follow-on
- provider result must not re-run canonical business mutation
- provider failure may recommend retry, but must not duplicate business write
- journal is operational evidence, not canonical business truth replacement

retry_backoff_rules:
- sent:
  - no retry
- failed:
  - retry candidate depending on provider error class
- cancelled:
  - no retry
- pending:
  - operational follow-up may re-check later
