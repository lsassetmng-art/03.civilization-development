# AICompanyManager Phase ANA-AND
# Full maintainability rebuild review

generated_at: 2026-04-30 11:10:57 +0900

PASS_COUNT=16
WARN_COUNT=5
FAIL_COUNT=0
FINAL_STATUS=FULL_MAINTAINABILITY_REBUILD_REVIEW_DONE_REVIEW_REQUIRED

SCOPE=FULL_REVIEW_ONLY
MODIFY=NO
DB_WRITE=NOT_EXECUTED
DB_READ=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED
PYTHON=NOT_USED

## Key counts

SCRIPT_COUNT=36
JS_COUNT=96
MARKER_LINE_COUNT=1265
EVENT_RISK_COUNT=423
STORAGE_LINE_COUNT=628
API_LINE_COUNT=302
SERVER_ROUTE_LINE_COUNT=43
DEBUG_SURFACE_LINE_COUNT=161
ROOT_REWRITE_LINE_COUNT=311

## Files

SCRIPT_LIST=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/100_index_script_list.txt
JS_FILE_LIST=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/110_assets_js_file_list.txt
MARKER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/120_patch_marker_scan.txt
EVENT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/130_event_listener_scan.txt
ACTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/140_data_action_scan.txt
STORAGE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/150_local_storage_scan.txt
API_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/160_api_endpoint_scan.txt
SERVER_ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/170_server_route_scan.txt
DEBUG_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/180_debug_surface_scan.txt
ROOT_REWRITE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/190_root_rewrite_scan.txt
CLASSIFICATION=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/200_SCRIPT_CLASSIFICATION.tsv
REBUILD_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/300_REBUILD_PLAN.md
TARGET_ARCH=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/310_TARGET_ARCHITECTURE.md
STOP_RULES=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/320_STOP_PATCHING_RULES.md
NEXT_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036/900_NEXT_PLAN.md
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_maintainability_rebuild_review_20260430_111036

## Decision

Stop adding patches.

Move to clean production core rebuild:
- one state owner
- one API client
- one render path
- one action dispatcher
- v2 DB only for company hierarchy
- no debug surface in production
