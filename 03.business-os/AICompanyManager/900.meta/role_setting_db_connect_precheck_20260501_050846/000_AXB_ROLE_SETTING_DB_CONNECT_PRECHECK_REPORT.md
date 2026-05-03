# AICompanyManager Phase AXB role-setting DB connect precheck

## Result
- FINAL_STATUS=ROLE_SETTING_DB_CONNECT_PRECHECK_DONE_PATCH_NOT_APPLIED
- PASS_COUNT=9
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO

## Current judgement
社長/部長/課長/従業員が変更できない原因は、本体updateとは別の robot placement 保存が未接続である可能性が高い。

## Metrics
- PLACEMENT_ROUTE_COUNT=1
- CREATE_PLACEMENT_COUNT=2
- CORE_PLACEMENT_ENDPOINT_COUNT=1
- CORE_ROLE_WORD_COUNT=130
- DB_PLACEMENT_TABLE_COUNT=10

## Output files
- SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/010_server_placement_scan.txt
- CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/020_clean_core_role_setting_scan.txt
- DB_TABLE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/031_db_placement_tables.tsv
- DB_SCHEMA_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/030_db_placement_schema.tsv
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/040_node_check.txt

## Maintainability rule for next phase
次のpatchでは以下を守る:
1. 既存placement table/APIを使う
2. 新規Pool/DB helperを作らない
3. 会社/部/課の本体updateとロボット配置updateを責務分離する
4. UIは確認画面経由でのみ保存する
5. 社長/部長/課長/従業員は role_code で保存する
6. 従業員は複数行を扱う
7. 既存構造が確認できない場合はpatchしない

## Next paste
Please paste:

tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/010_server_placement_scan.txt"
echo "============================================================"
tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/020_clean_core_role_setting_scan.txt"
echo "============================================================"
tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/031_db_placement_tables.tsv"
echo "============================================================"
tail -n +1 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_setting_db_connect_precheck_20260501_050846/030_db_placement_schema.tsv"
