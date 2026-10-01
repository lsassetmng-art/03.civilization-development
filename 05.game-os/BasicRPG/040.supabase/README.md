# SUPABASE WORKSPACE

status: active
phase: GameOS R26 / M01 Builder Foundation

responsibilities:
- GameOS M01 PostgreSQL schema source
- atomic create-project RPC
- persistent idempotency record
- Builder bootstrap/read RPCs
- authenticated Edge Function boundary

schema:
- gameos

important:
- public schema is not used
- R26 creates migration/function source only
- this implementation block does not connect to or mutate a database
- deployment requires the gameos schema to be exposed to the authorized PostgREST/Supabase API configuration
