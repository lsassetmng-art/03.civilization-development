# CasualChatWorker Phase P Closeout

status: CLOSEOUT_READY_IMPLEMENTATION_PREPARED_REAL_MODE_DISABLED
generated_at: 20260426_052059

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Whole-App Roadmap Final State

- Phase A: completed
- Phase B: completed
- Phase C: completed
- Phase D: completed
- Phase E: completed path
- Phase F: completed
- Phase G: completed
- Phase H: completed
- Phase I: completed
- Phase J: completed
- Phase K: completed
- Phase L: completed
- Phase M: completed
- Phase N: completed as Persona-side DB boundary/pre-real-mode audit baseline
- Phase O: switch tooling completed
- Phase P: final acceptance completed
- Phase P-Closeout: completed

## 3. Runtime State

- runtime_state: mock_mode
- closeout_status: CLOSEOUT_READY_IMPLEMENTATION_PREPARED_REAL_MODE_DISABLED

## 4. Final Canon

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum contract: 30 minutes
- maximum contract: 120 minutes
- allowed durations: 30 / 60 / 90 / 120 minutes
- monthly free ticket rule: shortest_contract_duration
- monthly free ticket quantity: 2
- one ticket: 30 minutes free
- total monthly free: 60 minutes

## 5. Persona-Side DB Boundary

- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- business: contract / pricing / payment / entitlement / session facts
- aiworker: AI worker entity / series / personality / safety canon
- cx22073jw: read-only smalltalk / topic material
- CommonOS / app_common: presentation metadata only

## 6. Closeout Meaning

If runtime_state is mock_mode:

- this is implementation-prepared closeout.
- later real-mode switch and live endpoint acceptance remain possible but separate.

If runtime_state is real_mode_enabled:

- proceed to live endpoint acceptance if needed.

