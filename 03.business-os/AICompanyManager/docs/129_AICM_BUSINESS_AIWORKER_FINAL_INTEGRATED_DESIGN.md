# AICompanyManager x BusinessOS AIWorker Final Integrated Design

## 0. Status
- status: final-integrated-design
- generated_at: 20260428_064220
- owner: Boss
- prepared_by: Zero
- target_app: AICompanyManager
- connected_system: BusinessOS AIWorker
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## 1. Purpose
This document defines how AICompanyManager uses BusinessOS AIWorker after the robot connection, company context, ctx wrapper, company-scoped RLS, and role/CX boundary work.

## 2. What AICompanyManager can use
AICompanyManager can use:
- robot role catalog
- robot pool selector
- robot personality reference
- robot public profile reference
- model-full reference
- company-context write API
- ctx-wrapper write API path
- company-scoped entitlement / placement RLS
- combined rollback-smoke compatibility endpoint

## 3. User-facing navigation impact
AICompanyManager user-facing top-level navigation remains:
- AI企業設定
- 会社ダッシュボード
- 部門別タスク台帳
- レビュー・承認待ち一覧

Robot placement UI uses:
- company President robot setting
- department Manager robot setting
- section Leader robot setting
- worker robot placement from Business-side robot pool
- internal nickname display format: 社内通称@役割

## 4. Role is also a CX knowledge reference key
AICompanyManager must treat role_code as:
1. placement role
2. display/assignment role
3. CX22073JW knowledge reference key

AICompanyManager should use role_code to retrieve or present:
- role explanation
- work-support knowledge
- review perspective
- task guidance
- safety bounded notes
- public/personality reference when needed

## 5. Business roles in AICompanyManager
Normal AICompanyManager business task flow uses:
- President
- ExecutiveManager
- Manager
- Leader
- Worker
- Helper
- Advisor
- Specialist

Typical mapping:
- President: company policy, business plan, allocation, approval
- ExecutiveManager: high-level corporate management
- Manager: department management
- Leader: section/task decomposition and review
- Worker: execution
- Helper: assistance
- Advisor: advice/risk review
- Specialist: business expert work

## 6. Friend / Lover roles
Friend / Lover are entertainment, conversation, and pseudo-relationship role groups.

Rules:
- Friend is casual conversation / friend-style support
- Lover is pseudo-lover entertainment / character role
- Lover never implies real relationship
- Lover does not weaken safety boundaries
- LoVerS series maps to Lover
- HD-R1A maps to Lover
- NORN sisters map to Advisor / Worker / Lover

## 7. Combat/security/crisis roles
AICompanyManager must not mix combat roles into ordinary business task assignment.

Combat/security/crisis roles:
- Battler
- Security
- CombatSpecialist
- TacticalLeader
- StrategicCommander

Use only for:
- Civilization/worldbuilding reference
- security design
- disaster/crisis management
- fictional/game combat staging
- abstract historical/tactical explanation
- risk organization within safety boundary

Do not use for:
- real-world harm execution
- weapon-use instructions
- target selection
- violence/crime support
- monitoring, threats, intrusion, or attack support

## 8. Combat role assignment canon
| model_code | role_1 | role_2 | role_3 |
|---|---|---|---|
| HD-R2 | Butler | Battler | Security |
| HD-R2S | CombatSpecialist | Security | Battler |
| HD-R2G | StrategicCommander | TacticalLeader | Battler |
| HD-R2T-0 | StrategicCommander | TacticalLeader | Security |

## 9. Current robot assignment snapshot
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

## 10. API endpoints used by AICompanyManager

Reference endpoints:
- GET /api/v1/business/aiworker/reference/roles
- GET /api/v1/business/aiworker/reference/personalities
- GET /api/v1/business/aiworker/reference/public-profiles
- GET /api/v1/business/aiworker/reference/model-full

Context endpoint:
- POST /api/v1/business/aiworker/company-context/rollback-smoke

Write endpoints:
- POST /api/v1/business/aiworker/company-entitlement/grant
- POST /api/v1/business/aiworker/company-robot/place
- POST /api/v1/business/aiworker/company-robot/update
- POST /api/v1/business/aiworker/company-robot/deactivate

Compatibility endpoint:
- POST /api/v1/business/aiworker/company-robot/combined-rollback-smoke

## 11. Company context rule
AICompanyManager must not rely on body.company_id alone.

API/DB flow:
1. request is authenticated
2. API sets app.current_company_id
3. API sets app.current_api_client_id
4. ctx wrapper checks company context
5. RLS checks company_id through current_setting('app.current_company_id', true)

## 12. Write path
AICompanyManager write path uses ctx wrappers:
- fn_company_robot_grant_entitlement_ctx
- fn_company_robot_place_ctx
- fn_company_robot_placement_update_ctx
- fn_company_robot_placement_deactivate_ctx

Original DB functions remain preserved, but AICompanyManager-facing write path should use ctx wrappers.

## 13. Entitlement / placement semantics
company_robot_entitlement:
- company has right to use a robot model

company_robot_placement:
- company places a robot into company / department / section target

Standalone place requires an existing entitlement.

Therefore:
- grant dry-run alone can pass
- place after grant dry-run can fail because grant was rolled back
- combined rollback-smoke is the correct full-chain verification

## 14. RLS state
AICompanyManager assumes company-scoped RLS is active for:
- business.company_robot_entitlement
- business.company_robot_placement

Final RLS state snapshot:
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

## 15. Reference UI behavior
Robot reference UI should show:
- role list
- model list
- personality reference
- public profile reference
- full reference

For combat roles:
- show safety-bounded note
- show that CX knowledge is fiction/security/crisis/worldbuilding oriented
- do not present combat roles as ordinary business specialists

## 16. Verification model
Use the following tests:
- health endpoint
- reference/model-full endpoint
- company-context rollback-smoke
- individual grant dry-run
- standalone place without entitlement expected fail
- combined rollback-smoke full chain
- invalid token denial
- no-persist checks

## 17. Evidence
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

API source inventory:
```text
API_FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js
----- auth/audit/context -----
10:const AUTH_REQUIRED = String(process.env.AICM_AIWORKER_AUTH_REQUIRED || "0") === "1";
11:const AUDIT_ENABLED = String(process.env.AICM_AIWORKER_AUDIT_ENABLED || "1") !== "0";
169:  if (!AUDIT_ENABLED) {
185:    ${sqlLit(AUTH_REQUIRED ? "" : "auth_off_local")},
210:  if (!AUTH_REQUIRED && !token) {
618:  'combined_api_context_matched', (business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)})->>'matched')::boolean,
653:  'context_check', business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)})
695:  'context_check', business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)}),
734:  'context_check', business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)}),
775:  'context_check', business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)}),
809:  'context_check', business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)}),
834:      auth_required: AUTH_REQUIRED,
835:      audit_enabled: AUDIT_ENABLED,
933:    if (urlObj.pathname === "/api/v1/business/aiworker/company-context/rollback-smoke") {
935:      const auth = requireAuth(req, res, "company-context/rollback-smoke", "write", companyId, contextDryRun, body);
1041:  console.log(`AUTH_REQUIRED=${AUTH_REQUIRED}`);
1042:  console.log(`AUDIT_ENABLED=${AUDIT_ENABLED}`);
----- ctx wrappers -----
309:  'company_robot_entitlement_id', business.fn_company_robot_grant_entitlement_ctx(
337:SELECT business.fn_company_robot_grant_entitlement_ctx(
347:SELECT business.fn_company_robot_place_ctx(
394:  'company_robot_placement_id', business.fn_company_robot_placement_update_ctx(
417:  'company_robot_placement_id', business.fn_company_robot_placement_deactivate_ctx(
461:      to_regprocedure('business.fn_company_robot_grant_entitlement_ctx(uuid,text,integer,text,text,text)') IS NOT NULL,
463:      to_regprocedure('business.fn_company_robot_place_ctx(uuid,text,text,text,text,uuid,text,integer,jsonb)') IS NOT NULL
551:SELECT business.fn_company_robot_grant_entitlement_ctx(
561:SELECT business.fn_company_robot_place_ctx(
580:SELECT business.fn_company_robot_placement_update_ctx(
596:SELECT business.fn_company_robot_placement_deactivate_ctx(
696:  'company_robot_entitlement_id', business.fn_company_robot_grant_entitlement_ctx(
735:  'company_robot_placement_id', business.fn_company_robot_place_ctx(
776:  'updated_company_robot_placement_id', business.fn_company_robot_placement_update_ctx(
810:  'deactivated_company_robot_placement_id', business.fn_company_robot_placement_deactivate_ctx(
----- reference endpoints -----
843:  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/roles") {
846:    const auth = requireAuth(req, res, "reference/roles", "read", null, dryRun, { role_code: roleCode });
853:  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/personalities") {
857:    const auth = requireAuth(req, res, "reference/personalities", "read", null, dryRun, { aiworker_model_code: modelCode, aiworker_series_code: seriesCode });
864:  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/public-profiles") {
869:    const auth = requireAuth(req, res, "reference/public-profiles", "read", null, dryRun, { aiworker_model_code: modelCode, aiworker_series_code: seriesCode, public_profile_status_code: profileStatusCode });
876:  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/model-full") {
881:    const auth = requireAuth(req, res, "reference/model-full", "read", null, dryRun, { aiworker_model_code: modelCode, aiworker_series_code: seriesCode, role_code: roleCode });
----- combined rollback-smoke -----
616:  'combined_api_context_company_id', current_setting('app.current_company_id', true),
618:  'combined_api_context_matched', (business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)})->>'matched')::boolean,
978:    if (urlObj.pathname === "/api/v1/business/aiworker/company-robot/combined-rollback-smoke") {
980:      const auth = requireAuth(req, res, "company-robot/combined-rollback-smoke", "write", companyId, smokeDryRun, body);
```

## 18. Remaining future work
AICompanyManager future work:
- final robot reference UI smoke
- production API client-company binding
- production user/company membership binding
- production audit persistence
- deployment packaging
- optional FORCE RLS review
- role-specific CX knowledge material expansion
