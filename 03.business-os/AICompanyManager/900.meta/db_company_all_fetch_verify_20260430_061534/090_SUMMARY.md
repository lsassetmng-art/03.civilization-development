# AICompanyManager DB company all-fetch verify summary

generated_at: 2026-04-30 06:15:36 +0900

## Status

PASS_COUNT=7
WARN_COUNT=0
FAIL_COUNT=0

## Files

- DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/db_company_all_fetch_verify_20260430_061534/020_db_company_tables_check.txt
- CODE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/db_company_all_fetch_verify_20260430_061534/040_code_company_fetch_scan.txt
- SERVED_HTML=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/db_company_all_fetch_verify_20260430_061534/050_served_html.txt
- CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/db_company_all_fetch_verify_20260430_061534/051_curl.log
- VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/db_company_all_fetch_verify_20260430_061534/030_verify.txt

## How to judge

1. DB_OUTで business 側の会社テーブルと件数を見る。
2. CODE_SCANで UI/API が会社一覧を limit 1 や先頭固定で取っていないか見る。
3. AI企業選択の候補数とDB件数が一致すれば「全件取得OK」。
4. DB件数より候補が少ない場合は、API/ローカル状態/非active除外/soft delete除外のどれかを確認。

## Important

No DB write executed.
No API save executed.
No RLS/delete executed.
