# ============================================================
# AI OPERATION DESK PROVIDER HTTP EXECUTION POLICY
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the outbound HTTP provider execution policy for the LINE-like provider path.

rules:
- provider http mode must fail closed when required env or secrets are missing
- provider http mode must not print raw secret values
- provider http mode must normalize result into:
  - sent
  - failed
  - cancelled
- provider http mode must not duplicate canonical business mutation
- provider http failure may lead to replay / retry review, not canonical business rewrite

required_env_candidates:
- AIOD_LINE_PUSH_ENDPOINT
- AIOD_LINE_CHANNEL_ACCESS_TOKEN

recommended_behavior:
- use explicit endpoint env
- use bearer token auth from env
- keep request payload compact
- normalize non-2xx responses to failed
- avoid provider-specific secret leakage in logs
