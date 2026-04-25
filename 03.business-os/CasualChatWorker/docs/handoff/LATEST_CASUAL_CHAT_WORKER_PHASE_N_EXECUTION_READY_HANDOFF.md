# CasualChatWorker Phase N Execution-Ready Handoff

status: ready
generated_at: 20260425_184803

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- current_phase: Phase N
- frontend_real_mode: disabled
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Created This Turn

- execution_decision_board: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_184803_CASUAL_CHAT_WORKER_PHASE_N_EXECUTION_DECISION_BOARD.md
- readiness_ledger: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_184803_CASUAL_CHAT_WORKER_PHASE_N_READINESS_LEDGER.md
- stop_conditions: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_184803_CASUAL_CHAT_WORKER_PHASE_N_STOP_CONDITIONS.md
- command_board: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_184803_CASUAL_CHAT_WORKER_PHASE_N_COMMAND_BOARD.md

## 3. Current Position

Phase N is ready for Boss decision.

Available choices:

A. Run non-production rollback dry-run  
B. Defer DB dry-run and hand off  
C. Run live payload gap check  
D. Real mode switch remains STOP

## 4. Recommended

Next safe choice:

- choose A only when DB-connected rollback dry-run is approved
- otherwise choose B and continue in another chat
- do not start Phase O yet

## 5. Nonprod Dry-Run Command

```bash
CCW_APPROVE_NONPROD_DB_DRY_RUN=1 \
CCW_BACKEND_MODE=nonprod_db_dry_run \
CCW_ENABLE_NONPROD_DB_DRY_RUN=1 \
CCW_CONFIRM_ROLLBACK_TEST=1 \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh
```

## 6. STOP Reminder

- no DATABASE_URL
- no frontend DB secrets
- no live confirm without extra approval
- no real mode switch yet
- no weakening Lover safety boundary

