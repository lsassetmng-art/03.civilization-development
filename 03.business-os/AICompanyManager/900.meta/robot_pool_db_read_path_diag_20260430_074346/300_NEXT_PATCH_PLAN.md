# Next patch plan

## If API endpoint is missing

Add a read-only local UI server endpoint that returns robot selector options from:

- business.vw_company_robot_selector_options

Expected response shape should be fixed to what UI uses:

{
  "result": "ok",
  "robots": [
    {
      "robot_id": "...",
      "label": "...",
      "role_code": "president|manager|leader|worker",
      "model_code": "...",
      "series_code": "...",
      "source": "business.vw_company_robot_selector_options"
    }
  ]
}

## If API exists but UI still says 未接続

Patch:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js

Target:
- fetch URL
- response field mapping
- populateSelect role filter
- updateStatusLines count display

## If DB has zero rows

Stop UI patching.
Fix DB seed / entitlement / selector view first under 佐藤(DB担当) review.

## Review files

DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/020_robot_pool_readonly_check.txt
JS_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/110_robot_pool_js_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/120_server_robot_pool_scan.txt
ENDPOINTS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/130_candidate_robot_pool_endpoints.txt
CURL_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/140_endpoint_curl_summary.txt
CAUSE_RANKING=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/200_ROOT_CAUSE_RANKING.md
