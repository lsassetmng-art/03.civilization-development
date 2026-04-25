# ============================================================
# STREAM STUDIO IMPLEMENTATION BOUNDARY
# ============================================================

status: implementation-boundary
system: StreamingOS
app: StreamStudio
phase: phase1
schema: streaming
db_target: PERSONA_DATABASE_URL

in_scope_phase1:
- project create / list / detail / update
- upload session create / complete / status / retry
- video draft create
- metadata update
- thumbnail assignment
- subtitle track add
- edit marker upsert
- publish setting upsert
- publish readiness validation
- publish request create
- publish request schedule
- publish history read

out_of_scope_phase1:
- marketplace execution
- membership execution
- split execution
- settlement execution
- external push execution
- production notification connector execution

fixed_stack_for_starter:
- web shell: html / css / javascript
- edge starter: typescript
- db runner: psql + PERSONA_DATABASE_URL

note:
This starter bundle intentionally begins with a minimal but real implementation root
instead of pretending that full production completion already exists.
