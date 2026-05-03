# AICompanyManager BusinessOS AIWorker Save Double Submit Guard Canon

## Purpose
Prevent duplicate robot placement saves caused by rapid clicks or repeated saveDraft calls.

## Scope
This bridge only guards save execution.
It does not own DB, API, selector, or robot canon.

## Behavior
- Wrap AICMBusinessAIWorkerSaveClient.saveDraft.
- If a save is already running, block the next save request.
- Disable save buttons while save is running.
- Restore buttons after success or failure.
- Write blocked result to the existing output area when available.

## Guarded action
- data-aicm-aiworker-action="save-db"

## Safety
- No DB update.
- No existing main JS modification.
- index.html script append only.
- No delete.

## Relation to duplicate guard
Duplicate guard checks whether the role target is already occupied.
Double-submit guard checks whether the current browser session is already saving.

Both are needed.
