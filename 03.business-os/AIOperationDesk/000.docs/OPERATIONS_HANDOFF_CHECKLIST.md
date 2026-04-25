# ============================================================
# AI OPERATION DESK OPERATIONS HANDOFF CHECKLIST
# ============================================================

status: handoff-checklist
app: AIOperationDesk
owner: Boss
prepared_by: Zero

handoff_check_items:
- design verification runner exists
- implementation verification runner exists
- db bootstrap runner exists
- local mock walkthrough runner exists
- local db walkthrough runner exists
- local stop runner exists
- smoke test runner exists
- final precheck runner exists
- implementation integrated doc exists
- final handoff note exists
- completion candidate summary exists

recommended_handoff_sequence:
1. run final precheck
2. run mock walkthrough
3. optionally run db walkthrough
4. collect local run artifacts
5. generate handoff bundle
6. archive audit output directory path
7. pass handoff bundle directory to next execution chat

notes:
- db walkthrough depends on PERSONA_DATABASE_URL and local psql availability
- current package is local-development / staged-follow-on ready
- this checklist is for handoff discipline, not production signoff
