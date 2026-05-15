# B6R96R1J next guide

## Current result

Controlled POST against existing 8787 server was executed once.

POST URL:
http://127.0.0.1:8787/aiworker/v1/runtime-execution/request

Response check:
/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_112532_b6r96r1i2_controlled_post_existing_8787/out/040_response_payload_check.txt

## If PASS

Next:
- AICM consumer verification
- Confirm AICM receives requester_delivery_payload
- Confirm business.ai_company_manager_deliverable save
- Confirm human_review_item metadata has deliverable_id
- Confirm delivery-summary markdown shows成果物本文抜粋

## If FAIL

Use:
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_112532_b6r96r1i2_controlled_post_existing_8787/out/031_post_headers.txt
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_112532_b6r96r1i2_controlled_post_existing_8787/out/030_post_response.json
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_112532_b6r96r1i2_controlled_post_existing_8787/out/033_post_curl_stderr.txt
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_112532_b6r96r1i2_controlled_post_existing_8787/out/040_response_payload_check.txt

Likely fixes:
- existing 8787 process is old server before patch
- response object not wrapped
- endpoint returns early before JSON.stringify wrapper
- auth or route mismatch
