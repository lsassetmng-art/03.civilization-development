# CasualChatWorker Phase O Start

status: phase-o-started
generated_at: 20260425_224836

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- category: 03.business-app
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Whole-App Roadmap

- Phase A: App rule and canon freeze — completed
- Phase B: Design skeleton — completed
- Phase C: Pricing / contract / monthly free ticket — completed
- Phase D: WorkerRentalCore generic DB design — completed
- Phase E: Persona-side DB apply / verify — completed path
- Phase F: Frontend prototype — completed
- Phase G: AIWorker latest alignment — completed
- Phase H: CX22073JW read-only material — completed
- Phase I: API payload alignment — completed
- Phase J: Backend endpoint skeleton — completed
- Phase K: Backend transaction preparation — completed
- Phase L: PostgreSQL repository / HTTP wiring — completed
- Phase M: Secure runtime / real mode preparation — completed
- Phase N: Persona-side DB boundary / pre-real-mode audit — completed as decision baseline
- Phase O: Frontend real mode switch — started
- Phase P: Final acceptance / handoff — pending

## 3. Phase O Goal

Phase O switches CasualChatWorker frontend from mock/local mode to real API mode only through a safe runtime config.

## 4. Current Canon

- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: forbidden for this path
- business schema: contract / pricing / payment / entitlement / session facts
- aiworker schema: AI worker entity / series / personality / conversation control / safety canon
- cx22073jw schema: read-only smalltalk / topic material
- CommonOS / app_common: presentation metadata only

## 5. CasualChatWorker Contract Canon

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- minimum contract: 30 minutes
- maximum contract: 120 minutes
- allowed durations: 30 / 60 / 90 / 120 minutes
- 30 minutes: 500 JPY
- 60 minutes: 1,000 JPY
- 90 minutes: 1,500 JPY
- 120 minutes: 2,000 JPY
- monthly free ticket rule: shortest_contract_duration
- monthly free ticket quantity: 2
- one ticket: 30 minutes free
- total monthly free: 60 minutes

## 6. Phase O Rule

Do not switch real mode unless:

- CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH=1
- CCW_REAL_API_BASE_URL is set
- runtime-config.js exists
- real-mode-preflight-check.js passes
- frontend secret scan passes
- no DATABASE_URL / PERSONA_DATABASE_URL assignment exists in frontend
- no psql exists in frontend
- apiBaseUrl is not empty
- allowRealApi is intentionally set to true by gated switch script

