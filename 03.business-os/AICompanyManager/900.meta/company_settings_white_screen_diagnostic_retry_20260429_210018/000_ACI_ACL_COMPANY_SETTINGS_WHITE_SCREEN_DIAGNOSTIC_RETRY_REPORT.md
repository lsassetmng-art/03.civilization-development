# AICompanyManager Phase ACI-ACL RETRY
# Company settings white screen diagnostic robust version

generated_at: 2026-04-29 21:00:18 +0900

## Scope

- Target: 03.business-os / AICompanyManager
- Symptom: AI企業設定 -> 遷移先で白画面
- DB_WRITE: NOT_EXECUTED
- API_SAVE: NOT_EXECUTED
- RLS_APPLY: NOT_EXECUTED
- DELETE: NOT_EXECUTED
- Python: NOT_USED
- Exit handling: robust / final exit 0

## Paths

- APP_ROOT: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager`
- INDEX_HTML: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html`
- JS_DIR: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js`
- SERVER_DIR: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server`

## 1. Path existence


### Path existence

```
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
total 115
drwx------.  14 u0_a402 u0_a402  3452 Apr 29 20:55 .
drwx------.  21 u0_a402 u0_a402  3452 Apr 29 06:36 ..
-rw-------.   1 u0_a402 u0_a402    20 Apr 27 06:10 .gitignore
drwx------.   4 u0_a402 u0_a402  3452 Apr 29 21:00 900.meta
drwx------.   9 u0_a402 u0_a402  3452 Apr 25 13:34 _commonos
drwx------.   5 u0_a402 u0_a402  3452 Apr 28 17:09 assets
drwx------.   3 u0_a402 u0_a402  3452 Apr 27 09:42 backend-api
drwx------.  34 u0_a402 u0_a402  8192 Apr 27 08:00 backup
drwx------.   5 u0_a402 u0_a402  8192 Apr 28 06:45 docs
-rw-------.   1 u0_a402 u0_a402  3037 Apr 29 18:05 index.html
-rw-------.   1 u0_a402 u0_a402  1186 Apr 27 14:19 local-static-server.js
drwx------. 120 u0_a402 u0_a402 20480 Apr 27 12:01 logs
drwx------.   2 u0_a402 u0_a402  3452 Apr 29 11:54 server
drwx------.   2 u0_a402 u0_a402  3452 Apr 25 16:57 server-routes
drwx------.  10 u0_a402 u0_a402  3452 Apr 25 16:57 src
drwx------.   2 u0_a402 u0_a402 45056 Apr 29 18:05 tests
drwx------.   2 u0_a402 u0_a402  3452 Apr 25 18:50 tools

INDEX_HTML=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html
-rw-------. 1 u0_a402 u0_a402 3037 Apr 29 18:05 /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html

JS_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js
total 2500
drwx------. 2 u0_a402 u0_a402  20480 Apr 29 18:05 .
drwx------. 5 u0_a402 u0_a402   3452 Apr 28 17:09 ..
-rw-------. 1 u0_a402 u0_a402   6222 Apr 27 07:09 aicm-action-adapter.js
-rw-------. 1 u0_a402 u0_a402   4008 Apr 27 07:16 aicm-action-handlers.js
-rw-------. 1 u0_a402 u0_a402   7253 Apr 27 07:16 aicm-action-payload-builders.js
-rw-------. 1 u0_a402 u0_a402   2249 Apr 27 07:16 aicm-action-router.js
-rw-------. 1 u0_a402 u0_a402   1465 Apr 27 07:00 aicm-api-client.js
-rw-------. 1 u0_a402 u0_a402   3102 Apr 27 09:42 aicm-api-readonly-wiring-candidate.js
-rw-------. 1 u0_a402 u0_a402   6088 Apr 27 08:36 aicm-api-repository-candidate.js
-rw-------. 1 u0_a402 u0_a402   3600 Apr 27 07:00 aicm-api-repository-stub.js
-rw-------. 1 u0_a402 u0_a402   2379 Apr 27 09:56 aicm-browser-readonly-fetch-disabled.js
-rw-------. 1 u0_a402 u0_a402   2546 Apr 27 10:26 aicm-browser-write-api-disabled.js
-rw-------. 1 u0_a402 u0_a402   5340 Apr 28 04:32 aicm-business-aiworker-api-config-client.js
-rw-------. 1 u0_a402 u0_a402   2806 Apr 28 04:27 aicm-business-aiworker-auth-token-client.js
-rw-------. 1 u0_a402 u0_a402  14923 Apr 27 20:52 aicm-business-aiworker-bridge.js
-rw-------. 1 u0_a402 u0_a402   9239 Apr 27 21:20 aicm-business-aiworker-duplicate-guard.js
-rw-------. 1 u0_a402 u0_a402  13206 Apr 27 21:08 aicm-business-aiworker-placement-client.js
-rw-------. 1 u0_a402 u0_a402   3801 Apr 28 05:02 aicm-business-aiworker-reference-client.js
-rw-------. 1 u0_a402 u0_a402  11126 Apr 27 22:20 aicm-business-aiworker-route-integration.js
-rw-------. 1 u0_a402 u0_a402   9610 Apr 27 20:59 aicm-business-aiworker-save-client.js
-rw-------. 1 u0_a402 u0_a402   7463 Apr 27 22:24 aicm-business-aiworker-save-double-submit-guard.js
-rw-------. 1 u0_a402 u0_a402  11143 Apr 27 21:18 aicm-business-aiworker-save-reload-bridge.js
-rw-------. 1 u0_a402 u0_a402  12583 Apr 27 22:20 aicm-business-aiworker-screen-filter.js
-rw-------. 1 u0_a402 u0_a402   8664 Apr 28 22:43 aicm-businessos-db-company-binding.js
-rw-------. 1 u0_a402 u0_a402  12036 Apr 28 18:19 aicm-businessos-db-robot-pool-wire.js
-rw-------. 1 u0_a402 u0_a402  15093 Apr 29 18:05 aicm-company-change-white-screen-guard.js
-rw-------. 1 u0_a402 u0_a402  11801 Apr 29 17:47 aicm-company-context-production-ui.js
-rw-------. 1 u0_a402 u0_a402  13938 Apr 29 18:00 aicm-company-edit-action-stable-ui.js
-rw-------. 1 u0_a402 u0_a402   5639 Apr 27 07:37 aicm-company-local-action-wiring.js
-rw-------. 1 u0_a402 u0_a402  21902 Apr 29 17:40 aicm-company-persistent-save-client.js
-rw-------. 1 u0_a402 u0_a402   1594 Apr 27 11:32 aicm-company-persistent-write-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   1498 Apr 27 10:32 aicm-company-write-rollback-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402  13549 Apr 27 07:58 aicm-csv-local-action-wiring.js
-rw-------. 1 u0_a402 u0_a402  15727 Apr 29 17:55 aicm-current-company-single-selector-ui.js
-rw-------. 1 u0_a402 u0_a402   7260 Apr 27 07:54 aicm-department-local-action-wiring.js
-rw-------. 1 u0_a402 u0_a402   1521 Apr 27 11:45 aicm-department-persistent-write-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   1441 Apr 27 10:36 aicm-department-write-rollback-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   8446 Apr 28 21:55 aicm-existing-robot-assignment-select-sync.js
-rw-------. 1 u0_a402 u0_a402  12112 Apr 27 07:57 aicm-ledger-local-action-wiring.js
-rw-------. 1 u0_a402 u0_a402   1253 Apr 27 11:13 aicm-ledger-write-rollback-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   6634 Apr 29 05:42 aicm-legacy-local-robot-selection-guard.js
-rw-------. 1 u0_a402 u0_a402  14140 Apr 27 07:00 aicm-local-repository.js
-rw-------. 1 u0_a402 u0_a402   3618 Apr 27 07:34 aicm-local-wiring-pilot.js
-rw-------. 1 u0_a402 u0_a402  11528 Apr 27 07:55 aicm-organization-local-action-wiring.js
-rw-------. 1 u0_a402 u0_a402   1424 Apr 27 12:01 aicm-organization-persistent-write-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   1370 Apr 27 10:57 aicm-organization-write-rollback-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   1120 Apr 27 10:21 aicm-readonly-fetch-smoke-executed.js
-rw-------. 1 u0_a402 u0_a402   2870 Apr 27 08:31 aicm-repository-mode-resolver-candidate.js
-rw-------. 1 u0_a402 u0_a402   1082 Apr 27 07:09 aicm-repository-runtime.js
-rw-------. 1 u0_a402 u0_a402   2044 Apr 27 07:00 aicm-repository.js
-rw-------. 1 u0_a402 u0_a402  10571 Apr 27 08:00 aicm-review-local-action-wiring.js
-rw-------. 1 u0_a402 u0_a402  48458 Apr 29 05:50 aicm-robot-placement-payload-preview.js
-rw-------. 1 u0_a402 u0_a402   1639 Apr 29 11:54 aicm-robot-placement-persistent-save-client.js
-rw-------. 1 u0_a402 u0_a402   6247 Apr 28 17:48 aicm-robot-reference-safe-dom-wire.js
-rw-------. 1 u0_a402 u0_a402   3959 Apr 27 07:00 aicm-state-adapter.js
-rw-------. 1 u0_a402 u0_a402   6552 Apr 29 06:37 aicm-worker-change-businessos-db-candidate-normalizer.js
-rw-------. 1 u0_a402 u0_a402   9884 Apr 27 08:00 aicm-workflow-local-stub-wiring.js
-rw-------. 1 u0_a402 u0_a402  12048 Apr 25 16:50 app.js
-rw-------. 1 u0_a402 u0_a402  29580 Apr 26 07:49 phase-aa-operation-screens-extension.js
-rw-------. 1 u0_a402 u0_a402  33325 Apr 26 07:56 phase-ab-stable-ui.js
-rw-------. 1 u0_a402 u0_a402  30128 Apr 26 10:55 phase-ac-stable-ui.js
-rw-------. 1 u0_a402 u0_a402  31137 Apr 26 11:09 phase-ad-stable-ui.js
-rw-------. 1 u0_a402 u0_a402  33749 Apr 26 17:02 phase-ae-stable-ui.js
-rw-------. 1 u0_a402 u0_a402  52671 Apr 26 17:23 phase-af-stable-ui.js
-rw-------. 1 u0_a402 u0_a402  65451 Apr 26 17:44 phase-ag-stable-ui.js
-rw-------. 1 u0_a402 u0_a402  72045 Apr 26 17:50 phase-ah-stable-ui.js
-rw-------. 1 u0_a402 u0_a402   1616 Apr 26 17:53 phase-ai-company-common-rules-small.js
-rw-------. 1 u0_a402 u0_a402   2258 Apr 26 17:53 phase-ai-html-freeze-guard.js
-rw-------. 1 u0_a402 u0_a402  29916 Apr 26 21:37 phase-aj-clean-ui.js
-rw-------. 1 u0_a402 u0_a402  33138 Apr 27 05:38 phase-ak-simplified-ui.js
-rw-------. 1 u0_a402 u0_a402  44604 Apr 27 05:45 phase-am-dashboard-detail-ui.js
-rw-------. 1 u0_a402 u0_a402  45732 Apr 27 05:56 phase-an-split-add-edit-ui.js
-rw-------. 1 u0_a402 u0_a402  46476 Apr 27 05:57 phase-ao-add-only-split-ui.js
-rw-------. 1 u0_a402 u0_a402  72115 Apr 27 07:07 phase-bq-bt-repository-ready-ui.js
-rw-------. 1 u0_a402 u0_a402  80020 Apr 27 07:09 phase-bu-bx-action-adapter-ready-ui.js
-rw-------. 1 u0_a402 u0_a402  94332 Apr 27 07:16 phase-by-cb-action-handlers-ready-ui.js
-rw-------. 1 u0_a402 u0_a402  98411 Apr 27 07:34 phase-cc-cf-local-wiring-pilot-ui.js
-rw-------. 1 u0_a402 u0_a402 104606 Apr 27 07:37 phase-cg-cj-company-local-wiring-ui.js
-rw-------. 1 u0_a402 u0_a402 112457 Apr 27 07:54 phase-ck-cn-department-local-wiring-ui.js
-rw-------. 1 u0_a402 u0_a402 124648 Apr 27 07:55 phase-co-cr-organization-local-wiring-ui.js
-rw-------. 1 u0_a402 u0_a402 137410 Apr 27 07:57 phase-cs-cv-ledger-local-wiring-ui.js
-rw-------. 1 u0_a402 u0_a402 151602 Apr 27 07:58 phase-cw-cz-csv-local-wiring-ui.js
-rw-------. 1 u0_a402 u0_a402 162847 Apr 27 08:00 phase-da-dd-review-local-wiring-ui.js
-rw-------. 1 u0_a402 u0_a402 191859 Apr 28 17:14 phase-de-dh-workflow-final-local-ui.js
-rw-------. 1 u0_a402 u0_a402  11261 Apr 26 05:50 phase-u-review-ui.js
-rw-------. 1 u0_a402 u0_a402  33163 Apr 26 07:13 phase-v-ui.js
-rw-------. 1 u0_a402 u0_a402   4364 Apr 26 07:41 phase-z-delete-extension.js

SERVER_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server
total 47
drwx------.  2 u0_a402 u0_a402  3452 Apr 29 11:54 .
drwx------. 14 u0_a402 u0_a402  3452 Apr 29 20:55 ..
-rw-------.  1 u0_a402 u0_a402 17210 Apr 29 11:32 aicm-company-robot-placement-write-api.mjs
-rw-------.  1 u0_a402 u0_a402 11436 Apr 29 11:54 aicm-company-write-api.mjs
-rw-------.  1 u0_a402 u0_a402  6833 Apr 28 20:40 aicm-local-ui-api-server.mjs
```

## 2. Server port and curl check


### Port check

```
ss/netstat check
```

### Curl log

```
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
CURL_CODE=7
```

## 3. index.html script loading order


### Script order

```
10:<script src="assets/js/aicm-company-change-white-screen-guard.js?v=20260429_company_change_white_guard_v1"></script>
12:  <script src="./assets/js/phase-de-dh-workflow-final-local-ui.js"></script>
14:<script src="../_aiworker/assets/js/business-aiworker-aicm-connector.js"></script>
15:<script src="assets/js/aicm-business-aiworker-bridge.js"></script>
17:<script src="assets/js/aicm-business-aiworker-save-client.js"></script>
19:<script src="assets/js/aicm-business-aiworker-placement-client.js"></script>
21:<script src="assets/js/aicm-business-aiworker-route-integration.js"></script>
23:<script src="assets/js/aicm-business-aiworker-screen-filter.js"></script>
25:<script src="assets/js/aicm-business-aiworker-save-reload-bridge.js"></script>
27:<script src="assets/js/aicm-business-aiworker-duplicate-guard.js"></script>
29:<script src="assets/js/aicm-business-aiworker-save-double-submit-guard.js"></script>
31:<script src="assets/js/aicm-business-aiworker-auth-token-client.js"></script>
33:<script src="assets/js/aicm-business-aiworker-api-config-client.js"></script>
35:<script src="assets/js/aicm-business-aiworker-reference-client.js"></script>
36:    <script defer src="./assets/js/aicm-robot-reference-safe-dom-wire.js?v=aicm_ref_v3_declutter"></script>
37:        <script defer src="./assets/js/aicm-businessos-db-robot-pool-wire.js?v=aicm_businessos_db_robot_pool_label_v4"></script>
38:      <script defer src="./assets/js/aicm-robot-placement-payload-preview.js?v=aicm_final_payload_role_model_normalizer_v13_1777409448948"></script>
39:  <script defer src="./assets/js/aicm-existing-robot-assignment-select-sync.js?v=aicm_existing_assignment_select_sync_robust_v2_1777380924546"></script>
40:    <script defer src="./assets/js/aicm-businessos-db-company-binding.js?v=aicm_company_binding_screen_scoped_persistent_v3_1777383822825"></script>
41:  <script defer src="./assets/js/aicm-legacy-local-robot-selection-guard.js?v=aicm_guard_remove_placement_prefix_role_shortcut_v2_1777408953353"></script>
42:<script src="./assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js?v=aicm_worker_change_force_db_clone_v2_20260429_063723"></script>
43:<script src="assets/js/aicm-robot-placement-persistent-save-client.js?v=20260429_robot_save_disabled_company_first"></script>
44:<script src="assets/js/aicm-company-persistent-save-client.js?v=20260429_company_v6_field_dedup_list_sync"></script>
45:<script src="assets/js/aicm-company-context-production-ui.js?v=20260429_company_context_production_ui_v1"></script>
46:<script src="assets/js/aicm-current-company-single-selector-ui.js?v=20260429_current_company_single_selector_v1"></script>
47:<script src="assets/js/aicm-company-edit-action-stable-ui.js?v=20260429_company_edit_action_stable_v1"></script>
```

## 4. AI企業設定 / 表示 / 変更 button route extraction


### Button and route context

```
7:  <link rel="stylesheet" href="./assets/css/phase-de-dh-workflow-final-local-ui.css">
29:<script src="assets/js/aicm-business-aiworker-save-double-submit-guard.js"></script>
```

## 5. JS syntax check


### Node syntax check

```
node version:
v24.14.1


---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-company-write-api.mjs ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-company-robot-placement-write-api.mjs ----
NODE_CHECK_CODE=0

---- all aicm/company js files ----

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-adapter.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-handlers.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-payload-builders.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-router.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-readonly-wiring-candidate.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-repository-candidate.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-repository-stub.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-browser-readonly-fetch-disabled.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-browser-write-api-disabled.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-api-config-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-auth-token-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-reference-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-local-action-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-write-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-write-rollback-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-persistent-write-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-write-rollback-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-write-rollback-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-local-repository.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-local-wiring-pilot.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-persistent-write-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-write-rollback-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-readonly-fetch-smoke-executed.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-repository-mode-resolver-candidate.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-repository-runtime.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-repository.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-state-adapter.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-company-common-rules-small.js ----
NODE_CHECK_CODE=0

---- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js ----
NODE_CHECK_CODE=0
```

## 6. Suspicious hide / guard / observer check


### Suspicious hits

```
---- index + js suspicious hits ----
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:37:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:41:      el.innerHTML = "<strong>" + text(metric.value) + "</strong><span>" + text(metric.label) + "</span>";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:48:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:52:      el.innerHTML =
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:61:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:65:      el.innerHTML =
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:76:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:80:      el.innerHTML =
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:101:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:107:      el.innerHTML = "<strong>" + text(summary[key] || 0) + "</strong><span>" + label + "</span>";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:114:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:119:      el.innerHTML =
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:130:    root.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:134:      el.innerHTML =
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:181:    document.getElementById("submitPolicyButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:196:    document.getElementById("startPipelineButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:217:    document.getElementById("pullSnapshotButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:234:    document.getElementById("syncQueueButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:241:    document.getElementById("failQueueButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:248:    document.getElementById("retryQueueButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:255:    document.getElementById("conflictQueueButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:262:    document.getElementById("resolveConflictButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:269:    document.getElementById("approveReviewButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:273:    document.getElementById("returnReviewButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:277:    document.getElementById("approveDeliveryButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:281:    document.getElementById("requestRevisionButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:285:    document.getElementById("acceptDeliveryButton").addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js:290:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-u-review-ui.js:250:    root.innerHTML = `
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-u-review-ui.js:271:      button.addEventListener("click", () => {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-u-review-ui.js:278:      button.addEventListener("click", () => {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-u-review-ui.js:285:      button.addEventListener("click", () => {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-u-review-ui.js:299:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:486:      document.body.innerHTML = "<div id=\"aicm-root\"></div>";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:492:    root.innerHTML = "<main class=\"aicm-shell\">" +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:525:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:532:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:540:      fileInput.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:549:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:557:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:670:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:689:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:699:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:711:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js:712:    document.body.innerHTML = "<div id=\"aicm-root\"></div>";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js:58:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js:85:    hint.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js:102:  document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js:139:    window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js:142:  const observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js:146:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:181:        details.remove();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:203:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:222:    root.innerHTML = "<main class=\"aicm-shell\">" +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:317:    root.innerHTML = "<main class=\"aicm-shell\">" +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:360:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:365:    document.querySelector("[data-aa-back-dashboard]")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:366:      window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:369:    document.querySelector("[data-aa-action='add-company']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:401:    document.querySelector("[data-aa-action='save-company']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:412:    document.querySelector("[data-aa-action='delete-company']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:426:    document.querySelector("[data-aa-action='add-company-rule-files']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:436:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:449:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:454:    document.querySelector("[data-aa-back-dashboard]")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:455:      window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:458:    document.querySelector("[data-aa-action='add-tree']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:472:    document.querySelector("[data-aa-action='add-unit']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:495:    document.querySelector("[data-aa-action='save-organization']")?.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:517:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:528:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:548:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:561:      button.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:576:  document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:591:  const observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js:595:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:15:    root.innerHTML = '<div class="aicm-error">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:348:    html += '<button class="primary" data-screen="company-operation">会社操作へ</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:349:    html += '<button class="primary" data-screen="organization-operation">組織操作へ</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:379:    html += '<div class="aicm-card"><h2>対象会社</h2>' + companyButtons(company) + '<button data-screen="dashboard">戻る</button></div>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:410:    html += '<div class="aicm-card"><h2>対象会社</h2>' + companyButtons(company) + '<button data-screen="dashboard">戻る</button></div>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:522:      '<button class="' + (app.screen === "dashboard" ? "primary" : "") + '" data-screen="dashboard">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:523:      '<button class="' + (app.screen === "handoff" ? "primary" : "") + '" data-screen="handoff">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:534:      root.innerHTML = '<div class="aicm-error">会社データがありません</div>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:538:    if (app.screen === "company-operation") root.innerHTML = layout(renderCompanyOperation(company), company);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:539:    else if (app.screen === "organization-operation") root.innerHTML = layout(renderOrganizationOperation(company), company);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:540:    else if (app.screen === "handoff") root.innerHTML = layout(renderHandoff(company), company);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:541:    else root.innerHTML = layout(renderDashboard(company), company);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:549:    buttons = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:552:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js:782:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:15:    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:426:      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:427:      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:428:      '<button data-screen="department-ledger" class="' + (app.screen === "department-ledger" ? "primary" : "") + '">部門設計書台帳</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:429:      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:430:      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:431:      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:449:    root.innerHTML = layout(body);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:454:    var nodes = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:458:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js:649:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:15:    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:440:      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:441:      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:442:      '<button data-screen="department-task-ledger" class="' + (app.screen === "department-task-ledger" ? "primary" : "") + '">部門別タスク台帳</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:443:      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:444:      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:445:      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:463:    root.innerHTML = layout(body);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:468:    var nodes = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:472:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js:662:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:15:    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:440:      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:441:      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:442:      '<button data-screen="department-task-ledger" class="' + (app.screen === "department-task-ledger" ? "primary" : "") + '">部門別タスク台帳</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:443:      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:444:      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:445:      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:463:    root.innerHTML = layout(body);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:468:    var nodes = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:472:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:662:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:694:    select.innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:719:      roleSelect.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:743:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js:746:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:15:    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:440:      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:441:      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:442:      '<button data-screen="department-task-ledger" class="' + (app.screen === "department-task-ledger" ? "primary" : "") + '">部門別タスク台帳</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:443:      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:444:      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:445:      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:463:    root.innerHTML = layout(body);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:468:    var nodes = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:472:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:662:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:694:    select.innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:719:      roleSelect.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:743:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:746:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1058:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1092:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1126:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1169:    root.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1261:        preview.innerHTML = '<p style="color:#9f1239;">' + esc(error) + '</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1267:      preview.innerHTML = previewCsvRows(rows);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1278:        preview.innerHTML = '<p style="color:#9f1239;">先にCSVプレビューを実行してください。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1286:      preview.innerHTML = '<p class="aicm-muted">IMPORT_DONE: ' + esc(result.imported) + ' rows</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1290:      window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1295:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1315:        window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1343:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js:1347:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:15:    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:440:      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:441:      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:442:      '<button data-screen="department-task-ledger" class="' + (app.screen === "department-task-ledger" ? "primary" : "") + '">部門別タスク台帳</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:443:      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:444:      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:445:      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:463:    root.innerHTML = layout(body);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:468:    var nodes = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:472:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:662:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:694:    select.innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:719:      roleSelect.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:743:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:746:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1058:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1092:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1126:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1169:    root.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1261:        preview.innerHTML = '<p style="color:#9f1239;">' + esc(error) + '</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1267:      preview.innerHTML = previewCsvRows(rows);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1278:        preview.innerHTML = '<p style="color:#9f1239;">先にCSVプレビューを実行してください。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1286:      preview.innerHTML = '<p class="aicm-muted">IMPORT_DONE: ' + esc(result.imported) + ' rows</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1290:      window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1295:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1315:        window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1343:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1347:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1557:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1577:    target.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1653:    window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1680:    window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1690:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1718:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js:1722:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:15:    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:440:      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:441:      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社共通ルール</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:442:      '<button data-screen="department-task-ledger" class="' + (app.screen === "department-task-ledger" ? "primary" : "") + '">部門別タスク台帳</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:443:      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:444:      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:445:      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:463:    root.innerHTML = layout(body);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:468:    var nodes = document.querySelectorAll("[data-screen]");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:472:        app.screen = this.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:662:  document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:694:    select.innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:719:      roleSelect.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:743:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:746:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1058:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1092:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1126:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1169:    root.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1261:        preview.innerHTML = '<p style="color:#9f1239;">' + esc(error) + '</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1267:      preview.innerHTML = previewCsvRows(rows);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1278:        preview.innerHTML = '<p style="color:#9f1239;">先にCSVプレビューを実行してください。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1286:      preview.innerHTML = '<p class="aicm-muted">IMPORT_DONE: ' + esc(result.imported) + ' rows</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1290:      window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1295:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1315:        window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1343:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1347:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1557:    panel.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1577:    target.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1653:    window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1680:    window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1690:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1718:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1722:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1863:      grid.innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1889:          nodes[i].style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1927:    window.location.reload();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1931:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1953:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js:1958:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js:4:  var originalMutationObserver = window.MutationObserver;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js:42:  window.addEventListener("unhandledrejection", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js:47:  if (originalMutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js:48:    window.MutationObserver = function (callback) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js:51:      return new originalMutationObserver(function (mutations, observer) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js:58:          showBanner("HTML停止防止: MutationObserverの過剰発火を停止しました。");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-company-common-rules-small.js:46:        cards[i].style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-company-common-rules-small.js:56:  document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:189:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : "") + ">" + label + "</button>";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:228:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:255:      '<section class="aicm-grid" data-screen-scope="company-rules">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:272:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:312:      '<section class="aicm-grid" data-screen-scope="work-packet">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:332:      '<section class="aicm-grid" data-screen-scope="inbox">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:369:      '<section class="aicm-grid" data-screen-scope="csv-template">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:385:      '<section class="aicm-grid" data-screen-scope="handoff">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:436:    document.getElementById("aicm-root").innerHTML = body;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:441:    document.querySelectorAll("[data-screen]").forEach(function (b) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:443:        app.screen = b.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:460:        document.getElementById("add-robot").innerHTML = robotOptions(d, dept.id, role.value, "");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:578:      document.getElementById("distribution-result").innerHTML = '<p class="aicm-ok">配布操作を記録しました: ' + esc(name) + '</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:618:    document.getElementById("edit-form").innerHTML = [
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:619:      '<input id="edit-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:682:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:689:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js:739:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:226:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:266:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:312:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:361:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:362:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:389:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:443:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:481:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:512:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:517:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:519:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:796:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:803:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js:848:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:268:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:318:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:327:      '<div class="aicm-card-footer"><button class="primary" data-screen="settings">AI企業設定</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:340:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:346:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:350:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:351:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:361:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:362:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">AI企業設定はトップタブではなく、AI企業ダッシュボードの会社概要から開きます。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:392:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:393:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、右下ボタンから追加・変更・削除の別画面へ移動します。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:404:      '<button class="primary" data-screen="department-add">部門追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:405:      '<button class="primary" data-screen="department-edit">部門変更</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:406:      '<button class="danger" data-screen="department-delete">部門削除</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:415:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:416:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:428:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:429:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:443:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:444:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:457:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:458:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、右下ボタンから追加・変更・削除の別画面へ移動します。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:466:      '<button class="primary" data-screen="organization-add">組織追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:467:      '<button class="primary" data-screen="organization-edit">組織変更</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:468:      '<button class="danger" data-screen="organization-delete">組織削除</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:477:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:478:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:494:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:495:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:510:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:511:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:523:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:575:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:613:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:650:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:655:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:657:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:920:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:1015:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:1022:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js:1067:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:273:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:325:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:333:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:334:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:348:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">部門追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:354:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">組織追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:358:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:359:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:367:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:368:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:382:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:383:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:401:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:411:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:412:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、右下ボタンから変更・削除の別画面へ移動します。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:420:      '<button class="primary" data-screen="department-add">部門追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:421:      dept ? '<button class="primary" data-screen="department-edit">部門変更</button><button class="danger" data-screen="department-delete">部門削除</button>' : '',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:430:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:431:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:443:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">部門追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:447:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:448:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:462:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:463:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:474:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:475:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、右下ボタンから変更・削除の別画面へ移動します。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:483:      '<button class="primary" data-screen="organization-add">組織追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:484:      current ? '<button class="primary" data-screen="organization-edit">組織変更</button><button class="danger" data-screen="organization-delete">組織削除</button>' : '',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:493:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">部門追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:497:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:498:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:514:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">組織追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:518:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:519:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:534:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:535:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:546:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">部門追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:550:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:602:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:641:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:679:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:684:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:686:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:1021:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:1028:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js:1073:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:273:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:325:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:333:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:334:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:348:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:354:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:358:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:359:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:367:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:368:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:382:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:383:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:401:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:411:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:412:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:416:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:431:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:432:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:444:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:448:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:449:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:463:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:464:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:476:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:477:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:481:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:497:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:501:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:502:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:518:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:522:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:523:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:538:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:539:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:550:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:554:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:606:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:645:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:683:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:688:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:690:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:1025:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:1032:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js:1077:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:918:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:970:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:978:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:979:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:993:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:999:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1003:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1004:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1012:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1013:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1027:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1028:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1046:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1056:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1057:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1061:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1076:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1077:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1089:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1093:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1094:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1108:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1109:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1121:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1122:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1126:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1142:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1146:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1147:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1163:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1167:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1168:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1183:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1184:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1195:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1199:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1251:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1290:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1328:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1333:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1335:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1670:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1677:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js:1722:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:925:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:977:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:985:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:986:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1000:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1006:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1010:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1011:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1019:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1020:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1034:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1035:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1053:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1063:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1064:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1068:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1083:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1084:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1096:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1100:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1101:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1115:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1116:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1128:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1129:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1133:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1149:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1153:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1154:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1170:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1174:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1175:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1190:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1191:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1202:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1206:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1258:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1297:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1335:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1340:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1342:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1677:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1684:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js:1729:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:932:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:984:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:992:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:993:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1007:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1013:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1017:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1018:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1026:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1027:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1041:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1042:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1060:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1070:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1071:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1075:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1090:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1091:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1103:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1107:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1108:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1122:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1123:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1135:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1136:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1140:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1156:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1160:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1161:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1177:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1181:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1182:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1197:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1198:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1209:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1213:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1265:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1304:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1342:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1347:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1349:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1684:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1691:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js:1736:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-local-wiring-pilot.js:107:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:939:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:991:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:999:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1000:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1014:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1020:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1024:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1025:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1033:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1034:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1048:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1049:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1067:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1077:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1078:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1082:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1097:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1098:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1110:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1114:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1115:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1129:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1130:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1142:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1143:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1147:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1163:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1167:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1168:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1184:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1188:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1189:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1204:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1205:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1216:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1220:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1272:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1311:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1349:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1354:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1356:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1691:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1698:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:1743:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js:2394:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-local-action-wiring.js:161:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-local-action-wiring.js:171:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-local-action-wiring.js:173:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-local-action-wiring.js:198:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:949:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1001:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1009:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1010:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1024:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1030:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1034:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1035:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1043:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1044:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1058:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1059:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1077:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1087:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1088:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1092:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1107:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1108:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1120:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1124:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1125:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1139:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1140:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1152:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1153:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1157:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1173:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1177:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1178:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1194:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1198:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1199:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1214:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1215:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1226:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1230:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1282:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1321:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1359:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1364:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1366:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1701:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1708:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:1753:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:2404:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:2573:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:2583:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:2585:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js:2610:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js:187:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js:204:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js:212:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js:222:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js:224:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js:255:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:960:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1012:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1020:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1021:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1035:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1041:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1045:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1046:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1054:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1055:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1069:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1070:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1088:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1098:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1099:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1103:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1118:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1119:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1131:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1135:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1136:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1150:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1151:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1163:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1164:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1168:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1184:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1188:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1189:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1205:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1209:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1210:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1225:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1226:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1237:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1241:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1293:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1332:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1370:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1375:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1377:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1712:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1719:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:1764:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2415:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2584:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2594:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2596:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2621:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2816:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2833:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2841:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2851:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2853:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js:2884:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js:285:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js:313:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js:331:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js:341:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js:343:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js:379:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:974:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1026:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1034:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1035:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1049:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1055:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1059:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1060:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1068:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1069:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1083:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1084:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1102:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1112:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1113:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1117:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1132:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1133:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1145:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1149:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1150:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1164:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1165:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1177:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1178:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1182:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1198:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1202:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1203:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1219:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1223:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1224:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1239:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1240:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1251:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1255:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1307:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1346:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1384:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1389:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1391:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1726:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1733:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:1778:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2429:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2598:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2608:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2610:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2635:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2830:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2847:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2855:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2865:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2867:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:2898:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:3191:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:3219:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:3237:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:3247:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:3249:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js:3285:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js:290:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js:316:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js:334:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js:344:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js:346:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js:386:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:988:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1040:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1048:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1049:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1063:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1069:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1073:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1074:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1082:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1083:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1097:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1098:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1116:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1126:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1127:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1131:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1146:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1147:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1159:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1163:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1164:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1178:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1179:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1191:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1192:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1196:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1212:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1216:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1217:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1233:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1237:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1238:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1253:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1254:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1265:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1269:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1321:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1360:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1398:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1403:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1405:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1740:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1747:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:1792:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2443:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2612:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2622:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2624:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2649:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2844:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2861:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2869:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2879:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2881:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:2912:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3205:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3233:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3251:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3261:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3263:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3299:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3597:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3623:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3641:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3651:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3653:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js:3693:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js:413:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js:435:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js:449:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js:459:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js:461:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js:505:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1002:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1054:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1062:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1063:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1077:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1083:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1087:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1088:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1096:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1097:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1111:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1112:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1130:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1140:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1141:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1145:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1160:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1161:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1173:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1177:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1178:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1192:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1193:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1205:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1206:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1210:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1226:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1230:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1231:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1247:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1251:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1252:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1267:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1268:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1279:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1283:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1335:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1374:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1412:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1417:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1419:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1754:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1761:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:1806:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2457:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2626:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2636:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2638:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2663:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2858:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2875:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2883:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2893:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2895:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:2926:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3219:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3247:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3265:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3275:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3277:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3313:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3611:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3637:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3655:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3665:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3667:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:3707:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:4128:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:4150:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:4164:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:4174:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:4176:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js:4220:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js:286:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js:312:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js:326:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js:336:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js:338:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js:376:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1017:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1069:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1077:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1078:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1092:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1098:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1102:      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1103:      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1111:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1112:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1126:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1127:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1145:      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1155:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1156:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1160:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1175:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1176:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1188:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1192:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1193:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1207:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1208:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1220:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1221:      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1225:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1241:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1245:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1246:      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1262:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1266:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1267:      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1282:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1283:      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1294:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1298:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1350:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1389:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1427:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1432:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1434:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1769:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1776:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:1821:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2472:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2641:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2651:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2653:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2678:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2873:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2890:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2898:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2908:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2910:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:2941:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3234:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3262:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3280:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3290:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3292:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3328:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3626:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3652:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3670:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3680:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3682:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:3722:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4143:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4165:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4179:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4189:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4191:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4235:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4529:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4555:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4569:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4579:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4581:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js:4619:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js:227:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js:253:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js:271:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js:281:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js:283:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js:326:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1033:    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1318:    return '<div style="display:none"><select id="edit-org-robots" multiple>' +
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1349:      '<section class="aicm-grid" data-screen-scope="dashboard">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1357:      '<button class="primary" data-screen="settings">AI企業設定</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1358:      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1372:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1378:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">課詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1387:      '<section class="aicm-grid" data-screen-scope="company-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1388:      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1404:      '<section class="aicm-grid" data-screen-scope="settings">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1405:      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理、Presidentロボット設定、会社事業方針指示を行います。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1444:      '<section class="aicm-grid" data-screen-scope="department-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1445:      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。Managerロボット設定もここで行います。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1449:      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1467:      '<section class="aicm-grid" data-screen-scope="department-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1468:      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1480:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1484:      '<section class="aicm-grid" data-screen-scope="department-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1485:      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1499:      '<section class="aicm-grid" data-screen-scope="department-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1500:      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1515:      '<section class="aicm-grid" data-screen-scope="organization-detail">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1516:      '<div class="aicm-card aicm-wide"><h2>課詳細</h2><p class="aicm-muted">課を選択し、この画面内で変更・削除・Leader設定・Worker配置を行います。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1520:      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1542:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>課追加</h2><p class="aicm-muted">課を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1546:      '<section class="aicm-grid" data-screen-scope="organization-add">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1547:      '<div class="aicm-card aicm-wide"><h2>課追加</h2><p class="aicm-muted">課詳細とは分けた追加専用画面です。ロボットは組織作成後に課詳細でコンボボックスから複数追加できます。</p><button data-screen="organization-detail">課詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1552:      '<div style="display:none"><select id="new-org-robots" multiple></select></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1566:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>課変更</h2><p class="aicm-muted">変更できる課がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1570:      '<section class="aicm-grid" data-screen-scope="organization-edit">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1571:      '<div class="aicm-card aicm-wide"><h2>課変更</h2><p class="aicm-muted">Leader設定・Worker配置変更もできます。</p><button data-screen="organization-detail">課詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1590:      '<section class="aicm-grid" data-screen-scope="organization-delete">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1591:      '<div class="aicm-card aicm-wide"><h2>課削除</h2><button data-screen="organization-detail">課詳細へ戻る</button></div>',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1602:      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1606:      '<section class="aicm-grid" data-screen-scope="task-ledger">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1658:      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1697:      '<section class="aicm-grid" data-screen-scope="review">',
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1735:    document.getElementById("aicm-root").innerHTML = html;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1740:    document.querySelectorAll("[data-screen]").forEach(function (button) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:1742:        app.screen = button.getAttribute("data-screen");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:2244:      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:2251:      preview.innerHTML = CSV_ROWS.map(function (r) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:2296:  document.addEventListener("DOMContentLoaded", render);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:2947:    document.addEventListener("DOMContentLoaded", autoInit);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3116:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3126:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3128:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3153:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3348:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3365:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3373:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3383:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3385:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3416:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3709:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3737:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3755:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3765:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3767:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:3803:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4101:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4127:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4145:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4155:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4157:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4197:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4618:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4640:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4654:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4664:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4666:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:4710:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5004:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5030:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5044:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5054:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5056:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5094:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5329:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5355:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5373:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5383:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5385:      event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js:5428:    document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js:316:    rootEl.innerHTML = buildPanelHtml(state);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js:320:    panel.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js:332:    panel.addEventListener("input", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js:337:    panel.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js:394:      document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js:257:    root.document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js:284:    if (root.MutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js:285:      var observer = new root.MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js:331:      document.addEventListener("DOMContentLoaded", bindPanelSave);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:238:    rootEl.innerHTML = buildPanelHtml(state || {});
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:242:    panel.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:249:        outputEl.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">読み込み中...</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:253:            outputEl.innerHTML = '<pre style="white-space:pre-wrap;background:#fff5f5;border-radius:10px;padding:12px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:256:          outputEl.innerHTML = renderPlacementListHtml(result.items || []);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:264:          output.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:282:          editOutput.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:12px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js:323:      document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js:271:    rootEl.innerHTML = buildRouteIntegrationHtml();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js:274:    panel.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js:314:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js:269:    rootEl.innerHTML = buildPanelHtml(state || {});
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js:273:    panel.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js:282:        output.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:10px;">読み込み中...</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js:289:          output.innerHTML = '<pre style="white-space:pre-wrap;background:#fff5f5;border-radius:10px;padding:10px;">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js:293:        output.innerHTML = renderPlacementItems(result.items || []);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js:326:      document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:165:      output.innerHTML = content;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:167:      output.innerHTML = '<pre style="white-space:pre-wrap;background:#f6f8fa;border-radius:10px;padding:10px;">' + escapeHtml(content) + '</pre>';
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:283:    root.document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:310:    if (!root || !root.document || !root.MutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:327:    var observer = new root.MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:363:    if (root.MutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:364:      var mountObserver = new root.MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js:404:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js:244:    root.document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js:271:    if (root && root.MutationObserver && root.document) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js:272:      var observer = new root.MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js:306:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js:206:    root.document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js:211:        event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js:226:    if (!root || !root.document || !root.MutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js:233:    var observer = new root.MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js:274:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-auth-token-client.js:119:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-api-config-client.js:193:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-reference-client.js:117:      document.addEventListener("DOMContentLoaded", init);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:130:      document.addEventListener("DOMContentLoaded", apply);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:135:    window.addEventListener("load", apply);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:136:    window.addEventListener("focus", apply);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:137:    document.addEventListener("visibilitychange", apply);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:138:    document.addEventListener("click", function () { window.setTimeout(apply, 180); }, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:140:    if (window.MutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:143:        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js:146:      else document.addEventListener("DOMContentLoaded", startObserver);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js:242:    select.innerHTML = "";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js:376:      document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js:383:    window.addEventListener("load", scheduleLightApply);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js:384:    window.addEventListener("focus", scheduleLightApply);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js:386:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js:394:     * No MutationObserver loop.
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js:1420:    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js:1423:    window.addEventListener("load", schedule);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js:1424:    window.addEventListener("focus", schedule);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js:1426:    document.addEventListener("change", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js:1434:    document.addEventListener("input", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js:1442:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js:236:      document.addEventListener("DOMContentLoaded", function () { schedule(500); });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js:241:    window.addEventListener("load", function () { schedule(700); });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js:242:    window.addEventListener("focus", function () { schedule(700); });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js:244:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js:250:    document.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js:254:    if (OBSERVER || !document.body || !window.MutationObserver) return;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js:256:    OBSERVER = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js:268:      document.addEventListener("DOMContentLoaded", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js:277:    window.addEventListener("load", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js:282:    window.addEventListener("focus", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js:286:    document.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js:199:      document.addEventListener("DOMContentLoaded", function () { schedule(600); });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js:204:    window.addEventListener("load", function () { schedule(700); });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js:205:    window.addEventListener("focus", function () { schedule(700); });
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js:207:    document.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js:211:    document.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js:209:    document.addEventListener("DOMContentLoaded", schedule);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js:215:    document.addEventListener(name, normalizeEventTarget, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js:216:    document.addEventListener(name, schedule, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js:219:  if (window.MutationObserver) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js:220:    new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js:22:      node.remove();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js:27:        button.remove();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js:43:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js:55:    document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:212:        wrapper.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:213:        wrapper.setAttribute("data-aicm-hidden-duplicate-company-selector", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:217:          prev.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:218:          prev.setAttribute("data-aicm-hidden-duplicate-company-selector-label", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:226:        button.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:227:        button.setAttribute("data-aicm-hidden-company-load-button", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:238:      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:278:        block.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:279:        block.setAttribute("data-aicm-hidden-businessos-company-debug", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:285:      badge.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:286:      badge.setAttribute("data-aicm-hidden-debug-badge", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:294:        div.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:295:        div.setAttribute("data-aicm-hidden-company-id-debug", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:335:    select.addEventListener("change", onTopCompanyChanged);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:350:      duplicate_edit_selector_hidden: true,
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:351:      businessos_company_debug_hidden: true,
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:361:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js:373:    document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:220:  function smallestBlockContaining(needle) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:235:  function companyOverviewBlock() {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:236:    return smallestBlockContaining("会社概要");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:239:  function companyEditBlock() {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:269:    var block = companyOverviewBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:290:        child.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:291:        child.setAttribute("data-aicm-hidden-old-company-overview", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:317:    summary.innerHTML =
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:332:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:337:      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:343:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:366:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:371:      select.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:372:      select.setAttribute("data-aicm-hidden-duplicate-edit-select", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:375:        wrapper.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:376:        wrapper.setAttribute("data-aicm-hidden-duplicate-edit-select-wrapper", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:383:        btn.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:384:        btn.setAttribute("data-aicm-hidden-read-button", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:387:          btn.parentElement.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:388:          btn.parentElement.setAttribute("data-aicm-hidden-read-button-wrapper", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:396:        node.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:397:        node.setAttribute("data-aicm-hidden-edit-target-label", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:402:  function hideBusinessOsDebugCards() {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:424:      block.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:425:      block.setAttribute("data-aicm-hidden-businessos-debug-card", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:430:      badge.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:431:      badge.setAttribute("data-aicm-hidden-save-debug-badge", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:442:    select.addEventListener("change", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:459:      btn.addEventListener("click", function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:467:          hideBusinessOsDebugCards();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:494:    hideBusinessOsDebugCards();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:499:      duplicate_edit_selector_hidden: true,
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:500:      businessos_debug_card_hidden: true,
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:509:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js:521:    document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:92:        if (optionIsBogus(option)) option.remove();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:161:  function companyEditBlock() {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:183:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:188:      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:247:    event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:249:    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:253:    var block = companyEditBlock() || document.body;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:312:  function hideCompanyDebugCards() {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:321:        node.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:322:        node.setAttribute("data-aicm-hidden-company-debug-by-guard", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:327:    if (badge) badge.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:331:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:437:      hideCompanyDebugCards();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:475:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:485:      document.addEventListener(name, interceptAction, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:488:    document.addEventListener("submit", interceptSubmit, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:494:    hideCompanyDebugCards();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:498:      early_capture_guard: true,
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:508:    document.addEventListener("DOMContentLoaded", maintenance);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js:514:  var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:45:        el.remove();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:88:      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:643:    event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:645:    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:665:  function capturePointerLike(eventName, event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:698:  function captureSubmit(event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:724:    document.addEventListener("click", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:725:      capturePointerLike("click", event);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:728:    document.addEventListener("pointerup", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:729:      capturePointerLike("pointerup", event);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:732:    document.addEventListener("touchend", function (event) {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:733:      capturePointerLike("touchend", event);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:736:    document.addEventListener("submit", captureSubmit, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:751:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js:767:    document.addEventListener("DOMContentLoaded", start);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:95:        if (optionIsBogus(option)) option.remove();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:164:  function companyEditBlock() {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:186:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:191:      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:218:    var block = companyEditBlock() || document.body;
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:276:        node.style.display = "none";
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:277:        node.setAttribute("data-aicm-hidden-company-debug", "1");
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:283:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:295:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:304:    var block = companyEditBlock();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:320:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:322:      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:410:      event.preventDefault();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:412:      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:427:      changeButton.addEventListener("click", saveCompanyChange, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:428:      changeButton.addEventListener("submit", saveCompanyChange, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:433:      deleteButton.addEventListener("click", blockDelete, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:434:      deleteButton.addEventListener("submit", blockDelete, true);
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:457:    var observer = new MutationObserver(function () {
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js:469:    document.addEventListener("DOMContentLoaded", start);
```

## 7. Company JS inventory


### Company JS inventory

```
---- JS files ----
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-adapter.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-handlers.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-payload-builders.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-action-router.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-readonly-wiring-candidate.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-repository-candidate.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-api-repository-stub.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-browser-readonly-fetch-disabled.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-browser-write-api-disabled.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-api-config-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-auth-token-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-reference-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-change-white-screen-guard.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-context-production-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-edit-action-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-local-action-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-write-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-write-rollback-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-csv-local-action-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-current-company-single-selector-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-local-action-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-persistent-write-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-department-write-rollback-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-existing-robot-assignment-select-sync.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-local-action-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ledger-write-rollback-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-legacy-local-robot-selection-guard.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-local-repository.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-local-wiring-pilot.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-local-action-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-persistent-write-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-organization-write-rollback-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-readonly-fetch-smoke-executed.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-repository-mode-resolver-candidate.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-repository-runtime.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-repository.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-review-local-action-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-persistent-save-client.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-reference-safe-dom-wire.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-state-adapter.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-workflow-local-stub-wiring.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/app.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aa-operation-screens-extension.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ab-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ac-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ad-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ae-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-af-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ag-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ah-stable-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-company-common-rules-small.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ai-html-freeze-guard.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-aj-clean-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ak-simplified-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-am-dashboard-detail-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-an-split-add-edit-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ao-add-only-split-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bq-bt-repository-ready-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-bu-bx-action-adapter-ready-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-by-cb-action-handlers-ready-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cc-cf-local-wiring-pilot-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cg-cj-company-local-wiring-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-ck-cn-department-local-wiring-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-co-cr-organization-local-wiring-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cs-cv-ledger-local-wiring-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-cw-cz-csv-local-wiring-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-da-dd-review-local-wiring-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-u-review-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-v-ui.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-z-delete-extension.js

---- company/aicm script src in index ----
10:<script src="assets/js/aicm-company-change-white-screen-guard.js?v=20260429_company_change_white_guard_v1"></script>
14:<script src="../_aiworker/assets/js/business-aiworker-aicm-connector.js"></script>
15:<script src="assets/js/aicm-business-aiworker-bridge.js"></script>
17:<script src="assets/js/aicm-business-aiworker-save-client.js"></script>
19:<script src="assets/js/aicm-business-aiworker-placement-client.js"></script>
21:<script src="assets/js/aicm-business-aiworker-route-integration.js"></script>
23:<script src="assets/js/aicm-business-aiworker-screen-filter.js"></script>
25:<script src="assets/js/aicm-business-aiworker-save-reload-bridge.js"></script>
27:<script src="assets/js/aicm-business-aiworker-duplicate-guard.js"></script>
29:<script src="assets/js/aicm-business-aiworker-save-double-submit-guard.js"></script>
31:<script src="assets/js/aicm-business-aiworker-auth-token-client.js"></script>
33:<script src="assets/js/aicm-business-aiworker-api-config-client.js"></script>
35:<script src="assets/js/aicm-business-aiworker-reference-client.js"></script>
36:    <script defer src="./assets/js/aicm-robot-reference-safe-dom-wire.js?v=aicm_ref_v3_declutter"></script>
37:        <script defer src="./assets/js/aicm-businessos-db-robot-pool-wire.js?v=aicm_businessos_db_robot_pool_label_v4"></script>
38:      <script defer src="./assets/js/aicm-robot-placement-payload-preview.js?v=aicm_final_payload_role_model_normalizer_v13_1777409448948"></script>
39:  <script defer src="./assets/js/aicm-existing-robot-assignment-select-sync.js?v=aicm_existing_assignment_select_sync_robust_v2_1777380924546"></script>
40:    <script defer src="./assets/js/aicm-businessos-db-company-binding.js?v=aicm_company_binding_screen_scoped_persistent_v3_1777383822825"></script>
41:  <script defer src="./assets/js/aicm-legacy-local-robot-selection-guard.js?v=aicm_guard_remove_placement_prefix_role_shortcut_v2_1777408953353"></script>
42:<script src="./assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js?v=aicm_worker_change_force_db_clone_v2_20260429_063723"></script>
43:<script src="assets/js/aicm-robot-placement-persistent-save-client.js?v=20260429_robot_save_disabled_company_first"></script>
44:<script src="assets/js/aicm-company-persistent-save-client.js?v=20260429_company_v6_field_dedup_list_sync"></script>
45:<script src="assets/js/aicm-company-context-production-ui.js?v=20260429_company_context_production_ui_v1"></script>
46:<script src="assets/js/aicm-current-company-single-selector-ui.js?v=20260429_current_company_single_selector_v1"></script>
47:<script src="assets/js/aicm-company-edit-action-stable-ui.js?v=20260429_company_edit_action_stable_v1"></script>
```

## 8. Candidate culprit ranking


### Candidate culprit ranking

```
# Candidate culprit ranking

A. JS syntax error
RISK=LOW_OR_NOT_DETECTED

B. AI企業設定 route/button intercepted by guard
RISK=HIGH_OR_MEDIUM

C. Over-broad display:none / hidden
RISK=HIGH_OR_MEDIUM

D. MutationObserver loop
RISK=MEDIUM_OR_HIGH

E. route / section switching conflict
RISK=MEDIUM

F. local UI server not running
RISK=MEDIUM_OR_ENVIRONMENT
```

## 9. Final summary

```
PASS_COUNT=6
WARN_COUNT=9
FAIL_COUNT=0
FINAL_STATUS=REVIEW_REQUIRED

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_diagnostic_retry_20260429_210018/000_ACI_ACL_COMPANY_SETTINGS_WHITE_SCREEN_DIAGNOSTIC_RETRY_REPORT.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_diagnostic_retry_20260429_210018
```

## Next

- First check: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_diagnostic_retry_20260429_210018/080_candidate_culprit_ranking.txt`
- Then check: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_diagnostic_retry_20260429_210018/060_suspicious_hits.txt`
- Then check: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_diagnostic_retry_20260429_210018/050_node_check.txt`
- If guard/hide is high risk, next phase should disable/replace duplicate company UI guard JS and consolidate company UI control into one JS.
