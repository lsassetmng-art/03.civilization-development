# B6R96R1J next guide

## Current POST

POST_URL:
http://127.0.0.1:8787/aiworker/v1/runtime-execution/request

model_code:
byd1_003_asic_workers3

Response check:
/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_115118_b6r96r1i5_valid_model_controlled_post/out/040_response_payload_check.txt

## If PASS

Next:
- AICM consumer verification
- Confirm AICM receives requester_delivery_payload
- Confirm business.ai_company_manager_deliverable save
- Confirm human_review_item metadata has deliverable_id
- Confirm delivery-summary markdown shows成果物本文抜粋

## If HTTP success but requester_delivery_payload missing

Likely:
- 8787 process is old server before B6R96R1G2 patch
- or response path bypasses wrapped JSON.stringify

Next:
- restart 8787 with patched server.js
- then rerun controlled POST once

## If HTTP 500

Use:
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_115118_b6r96r1i5_valid_model_controlled_post/out/030_post_response.json
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_115118_b6r96r1i5_valid_model_controlled_post/out/040_response_payload_check.txt
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_115118_b6r96r1i5_valid_model_controlled_post/out/033_post_curl_stderr.txt

Likely:
- model profile still mismatch
- task_domain_code mismatch
- function contract mismatch
