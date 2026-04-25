# CasualChatWorker Persona DB Boundary Audit Handoff

status: REVIEW_REQUIRED
generated_at: 20260425_205110

## 1. Target

- app_name: CasualChatWorker
- display_name: 雑談ワーカー
- current_phase: Phase N
- design_root: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker
- implementation_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker
- worker_rental_core_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

## 2. Fixed Boundary

- DB target: Persona-side DB
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## 3. Schema Responsibility

- business: contract/payment/entitlement/session facts
- aiworker: AI worker entity/series/personality/safety canon
- cx22073jw: read-only smalltalk/topic material
- CommonOS/app_common: presentation metadata only

## 4. Audit Files

- summary: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/900.meta/persona-db-boundary-audit/20260425_205110_persona_db_boundary_audit/000_PERSONA_DB_BOUNDARY_AUDIT_SUMMARY.md
- risk_scan: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/900.meta/persona-db-boundary-audit/20260425_205110_persona_db_boundary_audit/040_risk_terms_scan.txt
- correction_map: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/900.meta/persona-db-boundary-audit/20260425_205110_persona_db_boundary_audit/050_correction_map.md
- final_bundle: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/final/20260425_205110_CASUAL_CHAT_WORKER_PERSONA_DB_BOUNDARY_AUDIT_BUNDLE.md

## 5. Current Gate

- Phase N current
- Phase O STOP
- real mode disabled
- DB dry-run not executed here
- live payload gap not executed here

