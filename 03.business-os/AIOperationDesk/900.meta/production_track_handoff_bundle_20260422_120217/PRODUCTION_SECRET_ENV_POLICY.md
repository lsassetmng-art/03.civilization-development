# ============================================================
# AI OPERATION DESK PRODUCTION SECRET ENV POLICY
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the secret and environment handling policy for production-track work.

rules:
- secrets must be loaded only from environment variables
- secrets must not be hardcoded into source files
- logs must not dump provider tokens
- debug output must avoid raw secret values
- provider credential presence must be checked explicitly
- missing secret must fail closed for provider http mode

provider_secret_candidates:
- AIOD_LINE_CHANNEL_ACCESS_TOKEN
- AIOD_LINE_CHANNEL_SECRET
- AIOD_NOTIFICATION_SIGNING_KEY

auth_secret_candidates:
- future session verification secret
- future trusted header signing secret

database_secret_rule:
- PERSONA_DATABASE_URL remains environment-only
- DATABASE_URL remains environment-only

current_phase:
- this document fixes the production-track discipline
- actual provider secret usage is still skeleton-level in this bundle
