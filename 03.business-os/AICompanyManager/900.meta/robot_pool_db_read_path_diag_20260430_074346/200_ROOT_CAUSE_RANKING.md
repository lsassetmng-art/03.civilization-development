# Robot pool DB read path root cause ranking

generated_at: 2026-04-30 07:43:51 +0900

## Observed UI symptom

画面に以下が出ているため、UIはDB robot_poolを読めていない可能性が高い。

- BusinessOS DB robot_pool: 未接続
- President=0 / Manager=0 / Leader=0 / Worker=0
- President候補ロボット だけが出ている

## Diagnostic facts

- ENDPOINT_TOTAL_COUNT=36
- ENDPOINT_OK_COUNT=31
- DB_SELECTOR_EXISTS=1
- DB_SELECTOR_COUNT_LINE= business.vw_company_robot_selector_options |          0

## Candidate root causes

### A. API endpoint missing or not returning 200

Risk: HIGH if ENDPOINT_OK_COUNT=0.

UI JSがDBを直接読まず、ローカルUIサーバAPI経由で読む構造なら、
endpointが無い/違う/サーバ未起動/DB接続未注入のどれかで未接続になる。

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/130_candidate_robot_pool_endpoints.txt
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/140_endpoint_curl_summary.txt
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/120_server_robot_pool_scan.txt

### B. DB selector view/table exists but API is not wired to it

Risk: HIGH if DB_SELECTOR_EXISTS=1 and ENDPOINT_OK_COUNT=0.

DB側には候補があるが、server側endpointが未実装または別テーブルを見ている。

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/020_robot_pool_readonly_check.txt
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/120_server_robot_pool_scan.txt

### C. API returns data but JS mapping/populateSelect fails

Risk: HIGH if ENDPOINT_OK_COUNT>0 but UI still shows President=0.

endpointは動くが、レスポンス形式とJS期待形式がズレている可能性。

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/140_endpoint_curl_summary.txt
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/110_robot_pool_js_scan.txt

### D. DB itself has no selector rows

Risk: HIGH if selector view exists but row count is 0.

DB登録/ entitlement / placement / role eligibility のどこかが不足。

Evidence:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_pool_db_read_path_diag_20260430_074346/020_robot_pool_readonly_check.txt

## Current likely direction

1. DBに候補があるか確認。
2. APIが候補を返しているか確認。
3. APIが無ければ server に read-only robot_pool endpoint を追加。
4. APIが返しているのにUIが0なら JS mapper を修正。
