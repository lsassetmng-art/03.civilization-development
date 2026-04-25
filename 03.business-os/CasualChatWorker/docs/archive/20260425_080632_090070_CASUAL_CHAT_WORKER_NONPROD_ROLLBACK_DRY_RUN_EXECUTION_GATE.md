# CasualChatWorker Non-Production DB Rollback Dry-Run Execution Gate

status: active
phase: Phase T
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Purpose

Define the execution gate for non-production DB rollback dry-run.

This document does not execute DB operations.

## 2. Required Flags

The dry-run runner must not run unless all are set:

- CCW_APPROVE_NONPROD_DB_DRY_RUN=1
- CCW_BACKEND_MODE=nonprod_db_dry_run
- CCW_ENABLE_NONPROD_DB_DRY_RUN=1
- CCW_CONFIRM_ROLLBACK_TEST=1
- PERSONA_DATABASE_URL is set

## 3. Required Behavior

The dry-run must:

- use PERSONA_DATABASE_URL only
- use rollback-only transaction
- never commit
- never use ERP DATABASE_URL
- verify quote behavior
- keep frontend real mode disabled

## 4. STOP

Stop if:

- any flag is missing
- rollback is not guaranteed
- DB commit appears
- payload gap check fails
- auth policy fails
- 150 minute rental is not rejected
