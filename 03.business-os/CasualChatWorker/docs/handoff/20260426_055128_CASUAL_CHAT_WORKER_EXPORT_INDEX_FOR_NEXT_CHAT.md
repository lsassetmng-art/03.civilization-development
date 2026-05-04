# CasualChatWorker Export Index For Next Chat

status: READY_FOR_EXPORT_IMPLEMENTATION_PREPARED_REAL_MODE_DISABLED
generated_at: 20260426_055128

## 1. Start Here

For another chat, provide these first:

1. /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
2. /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
3. /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/00_CASUAL_CHAT_WORKER_INTEGRATED_DESIGN.md
4. /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/CASUAL_CHAT_WORKER_IMPLEMENTATION_PREPARED_COMPLETION_MARKER.md

## 2. Current State

- runtime_state: mock_mode
- final_quality_status: READY_FOR_EXPORT_IMPLEMENTATION_PREPARED_REAL_MODE_DISABLED

## 3. Roadmap State

- Phase A-P completed.
- Phase P-Closeout completed.
- Post-closeout final quality gate generated.

## 4. Canon Summary

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- max contract: 120 minutes
- monthly ticket rule: shortest_contract_duration
- monthly ticket quantity: 2
- one ticket: 30 minutes
- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- business: contract/payment/entitlement/session facts
- aiworker: AI worker entity/series/personality/safety canon
- cx22073jw: read-only smalltalk/topic material
- CommonOS/app_common: presentation only

## 5. If Continuing Real Mode Later

Use only with approved backend URL:

```bash
CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH=1 \
CCW_REAL_API_BASE_URL="http://127.0.0.1:8787" \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-switch-gated.sh
```

Rollback:

```bash
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-rollback-to-mock.sh
```

## 6. Stop Conditions

- no ERP DATABASE_URL for WorkerRentalCore
- no frontend DB secrets
- no psql in frontend
- no weakening Lover safety boundary
- no copying aiworker canon into business
- no copying CX material as business truth

