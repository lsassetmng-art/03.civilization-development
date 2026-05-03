# Next plan

Next phase:
ANY-AOB controlled production switch to clean core + clean server.

This next phase will change:
- index.html
- server/aicm-local-ui-api-server.mjs

It will not change:
- DB schema
- old JS files
- clean core
- clean server candidate

Rollback:
- restore backed up index.html
- restore backed up server file
- restart local server

Approval point:
Run next phase only when ready to replace the old 36-script production stack.
