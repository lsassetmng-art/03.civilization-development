# CasualChatWorker Final Export Handoff

status: CLOSEOUT_READY_IMPLEMENTATION_PREPARED_REAL_MODE_DISABLED
generated_at: 20260426_052059

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- current_phase: Phase P-Closeout
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Final State

- runtime_state: mock_mode
- closeout_status: CLOSEOUT_READY_IMPLEMENTATION_PREPARED_REAL_MODE_DISABLED

## 3. Use This First In Next Chat

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/CASUAL_CHAT_WORKER_IMPLEMENTATION_PREPARED_COMPLETION_MARKER.md
- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/00_CASUAL_CHAT_WORKER_INTEGRATED_DESIGN.md

## 4. Core Canon

- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- business: contract/payment/entitlement/session facts
- aiworker: AI worker entity/series/personality/safety canon
- cx22073jw: read-only smalltalk/topic material
- CommonOS/app_common: presentation only
- CasualChatWorker max: 120 minutes
- monthly ticket rule: shortest_contract_duration
- monthly ticket quantity: 2
- one ticket: 30 minutes

## 5. What Not To Do

- do not use ERP DATABASE_URL
- do not put DB secrets in frontend
- do not duplicate aiworker canon into business
- do not copy CX materials as business truth
- do not weaken Lover safety boundary
- do not treat implementation-prepared closeout as production real-mode acceptance unless runtime_state is real_mode_enabled and live tests pass

## 6. If Real Mode Is Needed Later

Switch only with approved backend URL:

```bash
CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH=1 \
CCW_REAL_API_BASE_URL="http://127.0.0.1:8787" \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-switch-gated.sh
```

Rollback:

```bash
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-rollback-to-mock.sh
```

