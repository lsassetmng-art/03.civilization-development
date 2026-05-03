# AICompanyManager Phase AKR-AKU
# Gate robot placement payload preview debug surface

generated_at: 2026-04-30 07:40:21 +0900

PASS_COUNT=13
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=ROBOT_PLACEMENT_PAYLOAD_PREVIEW_GATED_REVIEW_REQUIRED

SCOPE=UI_ONLY
DB_WRITE=NOT_EXECUTED
DB_READ=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

Changed:
- Did not disable aicm-robot-placement-payload-preview.js from index.html.
- Added dev flag gate to visible preview render functions.
- Payload Preview / robot placement debug panel is hidden in production by default.
- Payload build / validation / normalizer code remains loaded.
- Debug preview can be manually enabled only by setting window.AICM_DEV_DEBUG_SURFACE_ENABLED = true before render.

PREVIEW_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js
INDEX_HTML=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html
BACKUP_PREVIEW=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017/aicm-robot-placement-payload-preview.before_akr_aku.js
BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017/index.html.before_akr_aku.bak
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017/051_curl.log
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017/090_ROLLBACK_NOTE.txt
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/gate_robot_placement_payload_preview_20260430_074017
