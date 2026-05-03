# AICompanyManager BusinessOS AIWorker API V3 Canonical Promotion Report

## Result
- RESULT: PASS
- PASS_COUNT: 18
- FAIL_COUNT: 0

## Completed
- Promoted API v3 as canonical local API entry.
- Added canonical launcher.
- Kept v2/v1 untouched and parallel.
- Added API config client.
- Ensured auth token client and API config client are loaded exactly once.
- Verified DB auth/audit foundation exists.
- Verified President selector includes HD-R5P.
- Verified Worker selector includes HD-R3.
- Verified auth-off API v3 smoke.
- Verified auth-on valid token API v3 smoke.
- Verified auth-on invalid token denial.
- Verified audit dry-run did not persist smoke rows.

## Canonical files
- API_V3_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/api/aicm-business-aiworker-local-api-server-v3-auth-audit.js
- CANONICAL_RUN_SCRIPT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_local_api.sh
- V3_RUN_SCRIPT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_local_api_v3_auth_audit.sh
- API_CONFIG_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-api-config-client.js
- API_CONFIG_TEST: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_api_config_client.js
- CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/docs/068_BUSINESS_AIWORKER_API_V3_CANONICAL_PROMOTION_CANON.md
- AICM_CANON_FILE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/098_AICM_BUSINESS_AIWORKER_API_CONFIG_CLIENT_CANON.md

## Run commands

### Default local compatible mode
```bash
"/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_local_api.sh"
```

### Auth-on local mode
```bash
AICM_AIWORKER_AUTH_REQUIRED=1 \
AICM_AIWORKER_AUDIT_ENABLED=1 \
AICM_AIWORKER_AUDIT_DRY_RUN=0 \
AICM_AIWORKER_DRY_RUN=1 \
"/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker/scripts/run_aicm_business_aiworker_local_api.sh"
```

Header:
```text
X-AICM-AIWORKER-TOKEN: local-aicm-aiworker-dev-token
```

## Browser config
Default API base URL:
- http://127.0.0.1:8801

Browser helpers:
- window.AICM_BUILD_AIWORKER_API_URL
- window.AICM_BUILD_AIWORKER_FETCH_OPTIONS
- window.AICM_FETCH_AIWORKER_JSON
- window.AICM_BUILD_AIWORKER_AUTH_HEADERS

## Safety
- DB persistent write: none
- DB smoke: read-only / audit rollback
- ERP DATABASE_URL: not used
- Existing API v2 modified: no
- Existing main JS modified: no
- Delete: none
- RLS enforcement: not enabled

## Logs
- DB_FOUNDATION_VERIFY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/010_db_foundation_verify.txt
- DB_FOUNDATION_VERIFY_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/011_db_foundation_verify_stderr.txt
- API_V3_NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/021_api_v3_node_check_stderr.txt
- API_CONFIG_NODE_CHECK_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/023_api_config_node_check_stderr.txt
- API_CONFIG_SMOKE_STDOUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/024_api_config_smoke_stdout.txt
- API_CONFIG_SMOKE_STDERR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/025_api_config_smoke_stderr.txt
- AUTH_OFF_HEALTH: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/031_auth_off_health.json
- AUTH_OFF_PRESIDENT_SELECTOR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/032_auth_off_president_selector.json
- AUTH_OFF_READONLY_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/033_auth_off_readonly_smoke.json
- AUTH_ON_HEALTH: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/041_auth_on_health.json
- AUTH_ON_PRESIDENT_SELECTOR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/042_auth_on_president_selector.json
- AUTH_ON_READONLY_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/043_auth_on_readonly_smoke.json
- AUTH_ON_INVALID_SELECTOR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/044_auth_on_invalid_president_selector.json
- API_V3_CANONICAL_JSON_PARSE_RESULT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/050_api_v3_canonical_json_parse_result.txt
- AUDIT_DRY_RUN_NO_PERSIST_COUNT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/060_audit_dry_run_no_persist_count.txt
- SCRIPT_TAG_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/070_script_tag_counts.txt

## Next bundle
- Write endpoint rollback-smoke compatibility review.
- Then production policy / RLS hardening.
