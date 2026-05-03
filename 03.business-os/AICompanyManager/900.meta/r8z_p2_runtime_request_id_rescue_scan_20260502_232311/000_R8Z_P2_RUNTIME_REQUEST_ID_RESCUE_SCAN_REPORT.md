# AICompanyManager R8Z-P2 runtime request_id rescue scan report

## Result
- final_status: R8Z_P2_RUNTIME_REQUEST_ID_RESCUE_SCAN_DONE
- db_write: NO
- api_post: NO
- persistent_db_write: NO
- physical_delete: NO

## Counts
- raw_total: 0
- view_total: 0
- raw_in_progress: 0
- view_in_progress: 0
- raw_request_id_count: 0
- view_request_id_count: 0
- final_judgement: NO_WORKER_ROWS_FOUND_CHECK_COMPANY_OR_DB

## Interpretation
- REQUEST_ID_FOUND_PROCEED_OUTPUT_COLLECTION: 次は request_id を使って成果物/実行結果回収へ進む。
- WORKER_ROWS_FOUND_BUT_REQUEST_ID_MISSING: Worker行はあるが runtime_result が保存されていない。mark/update 側を見る。
- NO_WORKER_ROWS_FOUND_CHECK_COMPANY_OR_DB: 会社ID、owner、DB接続先、または前回実行DBとの差異を確認する。
