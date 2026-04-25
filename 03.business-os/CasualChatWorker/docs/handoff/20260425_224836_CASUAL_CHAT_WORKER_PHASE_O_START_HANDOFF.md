# CasualChatWorker Phase O Start Handoff

status: PASS
generated_at: 20260425_224836

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- current_phase: Phase O
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker

## 2. Created

- phase_o_start: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_224836_CASUAL_CHAT_WORKER_PHASE_O_START.md
- phase_o_gate: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/170.implementation-ready-freeze/170160_CASUAL_CHAT_WORKER_PHASE_O_REAL_MODE_SWITCH_GATE.md
- phase_o_policy: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/080.policy/080080_CASUAL_CHAT_WORKER_PHASE_O_REAL_MODE_POLICY.md
- phase_o_api_contract: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/070.api/070110_CASUAL_CHAT_WORKER_PHASE_O_REAL_API_SWITCH_CONTRACT.md
- switch_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-switch-gated.sh
- rollback_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-rollback-to-mock.sh
- verify_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/verify-phase-o-real-mode-switch-readiness.sh
- verify_file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_224836_phase_o_start_verify.md

## 3. Current State

- Phase O started
- real mode switch tooling generated
- real mode was not automatically enabled
- DB was not executed
- Persona-side DB boundary retained

## 4. Switch Command

Only with approved backend URL:

```bash
CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH=1 \
CCW_REAL_API_BASE_URL="http://127.0.0.1:8787" \
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-switch-gated.sh
```

## 5. Rollback Command

```bash
/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tools/phase-o-real-mode-rollback-to-mock.sh
```

## 6. STOP

- no frontend DB secrets
- no psql in frontend
- no DATABASE_URL / PERSONA_DATABASE_URL in frontend
- no real mode switch without approved backend URL

