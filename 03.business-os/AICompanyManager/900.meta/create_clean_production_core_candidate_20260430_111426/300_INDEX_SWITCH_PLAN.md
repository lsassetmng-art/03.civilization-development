# Index switch plan

## Current phase

Do not switch index.html yet.

## Later switch rule

Production index should load only:

1. CSS
2. aicm-production-core.js
3. optionally one proven AIWorker connector if required

## Stop loading from production index

- phase-de-dh-workflow-final-local-ui.js
- company legacy compatibility
- business aiworker broad save client
- broad bridge/guard/sync scripts
- rescue overlays
- debug/payload preview scripts
- BusinessOS DB binding debug cards
- localStorage migration/debug pages

## Safe switch sequence

1. Create clean core candidate.
2. Create clean server v2 API consolidation.
3. Make index backup.
4. Replace script stack with one clean core script.
5. Start server.
6. Manual UI verify.
7. Only after pass, archive old scripts.
