# Clean server switch plan

## Current phase

Do not switch production yet.

## Later controlled switch

1. Backup current server.
2. Copy server/aicm-clean-v2-api-server.candidate.mjs to server/aicm-local-ui-api-server.mjs.
3. Switch index to clean production core only.
4. Restart server.
5. Verify:
   - GET /api/aicm/v2/context
   - create company
   - create department
   - create section
   - no raw backend connection string in errors
6. Only after pass, archive old scripts.

## Rollback

Restore current server backup and index backup.
