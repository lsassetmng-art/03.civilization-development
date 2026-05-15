# B6R96R1F validation plan NOT APPLIED

## 1. Static checks

- node --check server.js
- grep marker
- grep requester_delivery_payload
- grep body_markdown
- git diff check

## 2. Runtime checks

Use HTTP only after patch phase.

Check these scenarios:

1. Worker request
2. Manager request
3. Leader request
4. President request
5. low performance model
6. high performance model
7. insufficient input

## 3. Expected for all

- requester_delivery_payload exists
- body_markdown is not empty
- summary_text exists
- minimum_guarantee_status is satisfied or blocking_report
- accepted response still has request_id/status
- no raw/internal payload is exposed as deliverable

## 4. AICM connection

After AIWorkerOS response is verified, AICM must be checked:

- AICM receives requester_delivery_payload
- business.ai_company_manager_deliverable saves body
- human_review_item metadata has deliverable_id
- delivery-summary markdown shows成果物本文抜粋
- 作成条件だけのサマリーから脱却

## 5. Push rule

Do not push until:

- patch applied
- node check passed
- HTTP response checked
- AICM UI checked
- secret scan passed
- user explicitly says push
