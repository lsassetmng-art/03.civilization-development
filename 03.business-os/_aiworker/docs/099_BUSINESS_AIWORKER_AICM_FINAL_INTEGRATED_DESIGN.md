# BusinessOS AIWorker x AICompanyManager Final Integrated Design

## 0. Status
- status: final-integrated-design
- generated_at: 20260428_064220
- owner: Boss
- prepared_by: Zero
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used
- target: BusinessOS AIWorker / AICompanyManager connection
- design_scope: robot pool, role catalog, CX reference, API v3, auth/audit, company context, ctx wrappers, company-scoped RLS, combat role separation

## 1. Purpose
This document is the integrated BusinessOS-side design for the AICompanyManager to BusinessOS AIWorker connection.

It consolidates:
- robot pool and model-role slots
- role catalog
- CX22073JW reference boundary
- personality and public profile references
- API v3 auth/audit
- company context foundation
- ctx wrapper write path
- company_robot_entitlement and company_robot_placement RLS
- combat/security/crisis role separation

## 2. Canonical ownership boundary

### 2.1 BusinessOS owns
BusinessOS owns:
- robot pool available to BusinessOS apps
- placement role catalog
- company robot entitlement
- company robot placement
- API auth/audit client records
- AICompanyManager write API boundary
- company-scoped RLS policy for entitlement and placement
- app.current_company_id context enforcement

### 2.2 AIWorkerOS owns
AIWorkerOS owns:
- AI worker machine/model canon
- personality profile canon
- public profile canon
- series behavior canon
- safety/personality/public metadata source

### 2.3 CX22073JW owns
CX22073JW owns:
- read-only knowledge reference
- role explanation
- personality reference
- public profile reference
- model full reference view
- work-support and explanation materials

CX22073JW does not own:
- BusinessOS entitlement
- BusinessOS placement
- RLS decisions
- API authorization
- company identity
- write permissions

## 3. Role as CX knowledge reference key
Robot role is not only a placement label.

Robot role has three meanings:
1. placement classification in BusinessOS
2. role display and assignment decision in AICompanyManager
3. reference key into CX22073JW knowledge, explanation, and work-support materials

Therefore:
- business roles must reference business/work knowledge
- friend/lover roles must reference conversation/entertainment/safety-bounded relationship-role knowledge
- combat/security/crisis roles must reference combat/security/crisis/worldbuilding knowledge
- combat roles must not be carelessly mapped to business roles such as Specialist, Manager, Leader, or Worker

## 4. Business role group
Business-oriented roles:
- President
- ExecutiveManager
- Manager
- Leader
- Worker
- Helper
- Advisor
- Specialist
- Butler

These roles connect to CX knowledge such as:
- management
- task breakdown
- review methods
- business operations
- planning
- execution support
- advisory/risk review
- expert work support

## 5. Friend / Lover role group
Conversation and entertainment roles:
- Friend
- Lover

Rules:
- Lover is pseudo-lover / entertainment / character role.
- Lover does not imply real relationship.
- Lover does not permit adult sexual service, coercion, dependence induction, stalking, monitoring, threats, or personal information extraction.
- LoVerS series maps to Lover.
- HD-R1A maps to Lover.
- NORN sisters map to Advisor / Worker / Lover.

## 6. Combat / security / crisis role group
Combat/security/crisis roles:
- Battler
- Security
- CombatSpecialist
- TacticalLeader
- StrategicCommander

These roles reference CX knowledge such as:
- war history
- tactical thought
- security
- defense
- crisis response
- combat staging
- worldbuilding
- game/fictional unit operation
- disaster response and evacuation/risk support

Safety boundary:
- not for real-world harm execution
- not for weapon-use procedure
- not for target selection
- not for crime or violence execution support
- not for surveillance, threats, intrusion, or attack support

Allowed uses:
- fiction
- game
- Civilization worldbuilding
- security design
- disaster/crisis management
- high-level historical/tactical explanation
- safety-bounded risk organization

## 7. Combat role assignment canon

| model_code | model_name | role_1 | role_2 | role_3 | reason |
|---|---|---|---|---|---|
| HD-R2 | Butler | Butler | Battler | Security | Butler/bodyguard/security lineage. Not Worker. |
| HD-R2S | Sniper | CombatSpecialist | Security | Battler | Sniper/special combat. Not business Specialist. |
| HD-R2G | General | StrategicCommander | TacticalLeader | Battler | Strategic/tactical command. Not business Manager/Leader. |
| HD-R2T-0 | Origin | StrategicCommander | TacticalLeader | Security | Origin-wide command/security. Not business President. |

## 8. Role catalog final state
The active role catalog is captured in:

- verification file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_064220_aicm_final_integrated_design_docs/030_final_role_catalog.txt

Current role catalog snapshot:

```text
ROLE|President|社長ロボット|President Robot|company|true|1|10|active
ROLE|ExecutiveManager|経営管理ロボット|Executive Manager Robot|company|true|1|20|active
ROLE|Manager|部門長ロボット|Manager Robot|department|true|1|30|active
ROLE|Leader|課長・リーダーロボット|Leader Robot|section|true|1|40|active
ROLE|Worker|ワーカーロボット|Worker Robot|section|false||50|active
ROLE|Helper|ヘルパーロボット|Helper Robot|section|false||60|active
ROLE|Friend|フレンドロボット|Friend Robot|section|false||70|active
ROLE|Lover|ラバーロボット|Lover Robot|section|false||75|active
ROLE|Specialist|専門担当ロボット|Specialist Robot|section|false||80|active
ROLE|Advisor|助言担当ロボット|Advisor Robot|department|false||90|active
ROLE|Butler|バトラーロボット|Butler Robot|section|false||100|active
ROLE|Battler|戦闘ロボット|Battler Robot|section|false||112|active
ROLE|Security|警備ロボット|Security Robot|section|false||114|active
ROLE|CombatSpecialist|戦闘専門ロボット|Combat Specialist Robot|section|false||120|active
ROLE|TacticalLeader|戦術指揮ロボット|Tactical Leader Robot|section|false||130|active
ROLE|StrategicCommander|戦略指揮ロボット|Strategic Commander Robot|department|false||140|active
```

## 9. Robot assignment final state
Robot role slot assignments are captured in:

- verification file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_064220_aicm_final_integrated_design_docs/040_final_robot_assignments.txt

Current robot assignment snapshot:

```text
ROBOT|Beyond|BYD1-001||Worker||
ROBOT|Beyond|BYD1-002||Worker|Helper|
ROBOT|Beyond|BYD1-003||Worker|Specialist|
ROBOT|Beyond|BYD2-001||Leader||
ROBOT|Beyond|BYD2-002||Leader|Manager|
ROBOT|Beyond|BYD2-003||President|Manager|ExecutiveManager
ROBOT|HD|HD-R1||Helper||
ROBOT|HD|HD-R1A||Lover||
ROBOT|HD|HD-R1C||Friend||
ROBOT|HD|HD-R2||Butler|Battler|Security
ROBOT|HD|HD-R2G||StrategicCommander|TacticalLeader|Battler
ROBOT|HD|HD-R2S||CombatSpecialist|Security|Battler
ROBOT|HD|HD-R2T-0||StrategicCommander|TacticalLeader|Security
ROBOT|HD|HD-R3||Worker||
ROBOT|HD|HD-R4||Leader||
ROBOT|HD|HD-R5||ExecutiveManager|Manager|
ROBOT|HD|HD-R5P||President||
ROBOT|LoVerS|LVS-01Fv001||Lover||
ROBOT|LoVerS|LVS-01Mv001||Lover||
ROBOT|LoVerS|LVS-02Fv001||Lover||
ROBOT|LoVerS|LVS-02Mv001||Lover||
ROBOT|LoVerS|LVS-03Fv001||Lover||
ROBOT|LoVerS|LVS-03Mv001||Lover||
ROBOT|LoVerS|LVS-04Fv001||Lover||
ROBOT|LoVerS|LVS-04Mv001||Lover||
ROBOT|LoVerS|LVS-05Fv001||Lover||
ROBOT|LoVerS|LVS-05Mv001||Lover||
ROBOT|LoVerS|LVS-06Fv001||Lover||
ROBOT|LoVerS|LVS-06Mv001||Lover||
ROBOT|LoVerS|LVS-07Fv001||Lover||
ROBOT|LoVerS|LVS-07Mv001||Lover||
ROBOT|LoVerS|LVS-08Fv001||Lover||
ROBOT|LoVerS|LVS-08Mv001||Lover||
ROBOT|LoVerS|LVS-09Fv001||Lover||
ROBOT|LoVerS|LVS-09Mv001||Lover||
ROBOT|LoVerS|LVS-10Fv001||Lover||
ROBOT|LoVerS|LVS-10Mv001||Lover||
ROBOT|LoVerS|LVS-11Fv001||Lover||
ROBOT|LoVerS|LVS-11Mv001||Lover||
ROBOT|LoVerS|LVS-12Fv001||Lover||
ROBOT|LoVerS|LVS-12Mv001||Lover||
ROBOT|MEGAMI|MG-NORN-001||Advisor|Worker|Lover
ROBOT|MEGAMI|MG-NORN-002||Advisor|Worker|Lover
ROBOT|MEGAMI|MG-NORN-003||Advisor|Worker|Lover
```

## 10. Company context foundation

### 10.1 Session variables
The API sets the following DB session context inside transaction scope:

- app.current_company_id
- app.current_api_client_id

### 10.2 DB helpers
The following helper functions are canonical:

- business.fn_aicm_aiworker_current_company_id()
- business.fn_aicm_aiworker_current_api_client_id()
- business.fn_aicm_aiworker_company_context_check(uuid)
- business.fn_aicm_aiworker_require_company_context(uuid, text)

### 10.3 Rule
Request body company_id is not trusted by itself.

A write operation is valid only when:
- app.current_company_id exists
- app.current_company_id matches the target company_id
- ctx wrapper checks pass

## 11. Context-enforced write wrappers
The API write path must use ctx wrappers:

- business.fn_company_robot_grant_entitlement_ctx(...)
- business.fn_company_robot_place_ctx(...)
- business.fn_company_robot_placement_update_ctx(...)
- business.fn_company_robot_placement_deactivate_ctx(...)

The original base functions remain preserved.

## 12. API v3 boundary
Primary local API file:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js

Canonical endpoints:
- GET /health
- GET /api/v1/business/aiworker/reference/roles
- GET /api/v1/business/aiworker/reference/personalities
- GET /api/v1/business/aiworker/reference/public-profiles
- GET /api/v1/business/aiworker/reference/model-full
- POST /api/v1/business/aiworker/company-context/rollback-smoke
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place
- POST /api/v1/business/aiworker/company-robot/update
- POST /api/v1/business/aiworker/company-robot/deactivate
- POST /api/v1/business/aiworker/company-robot/combined-rollback-smoke

## 13. API validation model
Use:
- individual grant dry-run for grant endpoint check
- standalone place only when entitlement already exists
- combined rollback-smoke for full grant/place/update/deactivate chain
- invalid-token call to verify auth denial
- no-persist check after all smoke tests

Important correction:
- standalone place after dry-run grant is expected to fail because dry-run grant rolls back entitlement
- combined rollback-smoke is the correct full-chain compatibility gate

## 14. RLS final state

RLS is enabled for:
- business.robot_placement_role_catalog
- business.robot_pool
- aiworker.robot_series_behavior_profile
- aiworker.robot_model_personality_profile
- aiworker.robot_model_public_profile
- business.aicm_aiworker_api_client
- business.aicm_aiworker_api_audit_log
- business.company_robot_entitlement
- business.company_robot_placement

FORCE RLS:
- not applied yet

DELETE policy:
- not created for entitlement / placement
- deactivate function is the expected lifecycle path

Final RLS/function inventory:

```text
FUNCTION|business.fn_aicm_aiworker_api_audit_write|p_request_id uuid, p_api_client_id uuid, p_client_code text, p_company_id uuid, p_endpoint_code text, p_action_code text, p_dry_run_flag boolean, p_allowed_flag boolean, p_status_code text, p_error_code text, p_reason text, p_request_jsonb jsonb, p_response_jsonb jsonb, p_request_ip inet, p_user_agent text, p_metadata_jsonb jsonb|security_definer|search_path=business, aiworker, cx22073jw, public, pg_temp
FUNCTION|business.fn_aicm_aiworker_api_auth_check|p_token text, p_company_id uuid, p_endpoint_code text, p_action_code text, p_dry_run_flag boolean, p_request_jsonb jsonb, p_request_ip inet, p_user_agent text|security_definer|search_path=business, aiworker, cx22073jw, public, pg_temp
FUNCTION|business.fn_aicm_aiworker_company_context_check|p_company_id uuid|security_invoker|
FUNCTION|business.fn_aicm_aiworker_current_api_client_id||security_invoker|
FUNCTION|business.fn_aicm_aiworker_current_company_id||security_invoker|
FUNCTION|business.fn_aicm_aiworker_require_company_context|p_company_id uuid, p_action_code text|security_invoker|
FUNCTION|business.fn_company_robot_grant_entitlement_ctx|p_company_id uuid, p_aiworker_model_code text, p_quantity integer, p_business_offer_code text, p_entitlement_scope_code text, p_assignment_mode_code text|security_invoker|
FUNCTION|business.fn_company_robot_place_ctx|p_company_id uuid, p_aiworker_model_code text, p_target_level_code text, p_role_code text, p_internal_nickname text, p_target_id uuid, p_app_code text, p_placement_quantity integer, p_metadata_jsonb jsonb|security_invoker|
FUNCTION|business.fn_company_robot_placement_deactivate_ctx|p_company_robot_placement_id uuid, p_reason text, p_metadata_patch_jsonb jsonb|security_invoker|
FUNCTION|business.fn_company_robot_placement_update_ctx|p_company_robot_placement_id uuid, p_internal_nickname text, p_role_code text, p_target_level_code text, p_target_id uuid, p_metadata_patch_jsonb jsonb|security_invoker|
RLS_STATE|aiworker.robot_model_personality_profile|true|false|r
RLS_STATE|aiworker.robot_model_public_profile|true|false|r
RLS_STATE|aiworker.robot_series_behavior_profile|true|false|r
RLS_STATE|business.aicm_aiworker_api_audit_log|true|false|r
RLS_STATE|business.aicm_aiworker_api_client|true|false|r
RLS_STATE|business.company_robot_entitlement|true|false|r
RLS_STATE|business.company_robot_placement|true|false|r
RLS_STATE|business.robot_placement_role_catalog|true|false|r
RLS_STATE|business.robot_pool|true|false|r
```

Final policy inventory:

```text
POLICY|aiworker.robot_model_personality_profile|robot_model_personality_profile_active_read|SELECT|(status_code = 'active'::text)|
POLICY|aiworker.robot_model_public_profile|robot_model_public_profile_active_read|SELECT|(status_code = 'active'::text)|
POLICY|aiworker.robot_series_behavior_profile|robot_series_behavior_profile_active_read|SELECT|(status_code = 'active'::text)|
POLICY|business.aicm_aiworker_api_audit_log|aicm_aiworker_api_audit_log_no_public_delete|DELETE|false|
POLICY|business.aicm_aiworker_api_audit_log|aicm_aiworker_api_audit_log_no_public_select|SELECT|false|
POLICY|business.aicm_aiworker_api_audit_log|aicm_aiworker_api_audit_log_no_public_update|UPDATE|false|false
POLICY|business.aicm_aiworker_api_client|aicm_aiworker_api_client_no_public_delete|DELETE|false|
POLICY|business.aicm_aiworker_api_client|aicm_aiworker_api_client_no_public_insert|INSERT||false
POLICY|business.aicm_aiworker_api_client|aicm_aiworker_api_client_no_public_select|SELECT|false|
POLICY|business.aicm_aiworker_api_client|aicm_aiworker_api_client_no_public_update|UPDATE|false|false
POLICY|business.company_robot_entitlement|company_robot_entitlement_company_insert|INSERT||((company_id)::text = current_setting('app.current_company_id'::text, true))
POLICY|business.company_robot_entitlement|company_robot_entitlement_company_select|SELECT|((company_id)::text = current_setting('app.current_company_id'::text, true))|
POLICY|business.company_robot_entitlement|company_robot_entitlement_company_update|UPDATE|((company_id)::text = current_setting('app.current_company_id'::text, true))|((company_id)::text = current_setting('app.current_company_id'::text, true))
POLICY|business.company_robot_placement|company_robot_placement_company_insert|INSERT||((company_id)::text = current_setting('app.current_company_id'::text, true))
POLICY|business.company_robot_placement|company_robot_placement_company_select|SELECT|((company_id)::text = current_setting('app.current_company_id'::text, true))|
POLICY|business.company_robot_placement|company_robot_placement_company_update|UPDATE|((company_id)::text = current_setting('app.current_company_id'::text, true))|((company_id)::text = current_setting('app.current_company_id'::text, true))
POLICY|business.robot_placement_role_catalog|robot_placement_role_catalog_active_read|SELECT|(status_code = 'active'::text)|
POLICY|business.robot_pool|robot_pool_active_read|SELECT|(status_code = 'active'::text)|
```

## 15. Company-scoped entitlement / placement RLS
Tables:
- business.company_robot_entitlement
- business.company_robot_placement

Policy source:
- current_setting('app.current_company_id', true)

Policy model:
- SELECT: row.company_id must equal app.current_company_id
- INSERT: inserted company_id must equal app.current_company_id
- UPDATE: existing and new company_id must equal app.current_company_id
- DELETE: no policy

## 16. Auth / audit
API auth/audit foundation is part of the final design.

Rules:
- API client table is RLS-protected
- audit log table is RLS-protected
- audit dry-run can be used in local smoke
- production audit persistence is future hardening
- invalid token must be denied

## 17. CX22073JW reference
CX reference views:

```text
CX_VIEW|cx22073jw.vw_robot_role_reference_v1|16
CX_VIEW|cx22073jw.vw_robot_personality_reference_v1|44
CX_VIEW|cx22073jw.vw_robot_public_profile_reference_v1|27
CX_VIEW|cx22073jw.vw_robot_model_full_reference_v2|44
CX_COMBAT_ROLE|Battler|戦闘ロボット|active
CX_COMBAT_ROLE|CombatSpecialist|戦闘専門ロボット|active
CX_COMBAT_ROLE|Security|警備ロボット|active
CX_COMBAT_ROLE|StrategicCommander|戦略指揮ロボット|active
CX_COMBAT_ROLE|TacticalLeader|戦術指揮ロボット|active
```

Canonical CX views:
- cx22073jw.vw_robot_role_reference_v1
- cx22073jw.vw_robot_personality_reference_v1
- cx22073jw.vw_robot_public_profile_reference_v1
- cx22073jw.vw_robot_model_full_reference_v2

## 18. Verification evidence
Latest evidence roots:

```text
*_aicm_combat_role_separation_v3|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_061322_aicm_combat_role_separation_v3
*_aicm_final_company_scoped_rls_closeout|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_055720_aicm_final_company_scoped_rls_closeout
*_aicm_entitlement_placement_rls_apply|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply
*_aicm_individual_api_ctx_wrapper_switch_closeout_v2|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054643_aicm_individual_api_ctx_wrapper_switch_closeout_v2
*_aicm_company_context_enforcement_wrapper|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054254_aicm_company_context_enforcement_wrapper
*_aicm_company_context_foundation_closeout|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_054043_aicm_company_context_foundation_closeout
*_aicm_business_aiworker_final_handoff_package|/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_053039_aicm_business_aiworker_final_handoff_package
```

This integrated design was generated from read-only state and existing verification outputs.

## 19. Remaining future work
Remaining optional/future work:
- production API client to company binding
- production user/company membership source
- production audit persistence
- deployment packaging
- optional FORCE RLS review
- optional delete policy decision, likely keep no delete and use deactivate
- robot reference UI final smoke
- CX knowledge material expansion per role
