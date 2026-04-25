# CasualChatWorker Final Acceptance Package

status: PASS
generated_at: 20260425_063657

app_name: CasualChatWorker
display_name: 雑談ワーカー
category: 03.business-app

## 1. Final Position

CasualChatWorker has reached final acceptance package creation in this chat.

Implemented / prepared scope:

- HTML/CSS/JavaScript local prototype
- Modular frontend structure
- WorkerRentalCore payload alignment
- WorkerRentalCore generic DDL package created but not applied
- app-specific rental max 120 minutes
- monthly free ticket as shortest-contract-duration entitlement
- AIWorker latest series tendency alignment
- LoVerS individual style feature display
- strong safety notice UI
- API payload fixtures
- contract/session mock tests
- final acceptance verification

## 2. Canon

### 2-1. Worker Rental

Generic WorkerRentalCore:

- supports minute / hour / day / month / year
- generic max duration: up to 2 years
- price is app-specific through app_code / service_code
- monthly free ticket duration is app-specific shortest contract duration

CasualChatWorker:

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- supported v1 unit: minute
- minimum contract: 30 minutes
- app maximum contract: 120 minutes
- allowed durations: 30 / 60 / 90 / 120 minutes
- price 30 minutes: 500 JPY
- price 60 minutes: 1,000 JPY
- price 90 minutes: 1,500 JPY
- price 120 minutes: 2,000 JPY

### 2-2. Monthly Free Ticket

- source rule: shortest_contract_duration
- CasualChatWorker shortest contract: 30 minutes
- monthly free ticket quantity: 2
- one ticket: 30 minutes free
- monthly maximum free duration: 60 minutes
- carryover: false in v1

### 2-3. AIWorker Latest Alignment

Series tendency axes:

- initiative / 積極性
- user_influence / ユーザー影響度
- action_restriction / 行動制限

HD Series:

- initiative: medium
- user_influence: none
- action_restriction: strict_policy

LoVerS Series:

- initiative: per_model
- user_influence: soft
- action_restriction: strict_policy

LoVerS style card:

- source view: aiworker.vw_app_lovers_style_selection_card_v1
- style tags displayed
- recommended usage displayed
- requires_strong_safety_notice_flag reflected in UI
- style 12 ビジネスヤンデレ requires strong safety notice

## 3. Data Boundary

- business owns rental contracts, pricing, entitlement, usage, payment facts
- aiworker owns AI worker catalog, series tendency, style features, conversation control, safety control
- cx22073jw owns smalltalk / topic materials
- app_common / CommonOS owns UI presentation metadata
- ERP direct linkage is not v1

## 4. Generated / Updated Implementation

Implementation root:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker

Key runtime files:

- app/index.html
- app/assets/css/app.css
- app/assets/js/app.modular.js
- domain/constants.js
- domain/worker-rental-mapping.js
- pricing/pricing-domain.js
- ticket/free-ticket-domain.js
- safety/safety-policy.js
- state/app-state.js
- api-client/mock-business-api-client.js
- api-client/worker-rental-payload-client.js
- aiworker-reference/series-tendency-reference.js
- aiworker-reference/lovers-style-selection-cards.js
- aiworker-reference/mock-aiworker-reference.js
- cx-reference/mock-cx-material.js
- components/ui-renderers.js
- screens/screen-router.js

## 5. Generated / Updated Design

Design root:

- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker

Key design files:

- 040.screen/040030_CASUAL_CHAT_WORKER_AIWORKER_SERIES_STYLE_UI_ALIGNMENT.md
- 060.integration/060030_CASUAL_CHAT_WORKER_AIWORKER_SERIES_STYLE_UI_INTEGRATED_APPEND.md
- 110.aiworker-reference/110020_CASUAL_CHAT_WORKER_AIWORKER_SERIES_TENDENCY_AND_STYLE_FEATURE_ALIGNMENT.md
- 130.commonos/130020_CASUAL_CHAT_WORKER_COMMONOS_AIWORKER_CARD_VARIANT.md
- 140.safety/140020_CASUAL_CHAT_WORKER_LOVERS_STYLE_SAFETY_NOTICE_ALIGNMENT.md

## 6. WorkerRentalCore Package

Core root:

- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental

Important:

- DB apply was not executed.
- Apply requires explicit Boss approval and 佐藤（DB担当）review.

## 7. Verification

Final verification:

- verify_script: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_final_acceptance.sh
- verify_result: /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_063657_final_acceptance_verify.txt
- verify_exit: 0
- final_status: PASS

## 8. Run Command

Open prototype:

termux-open /data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/app/index.html

Run final verification:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/tests/verify_final_acceptance.sh

## 9. Next Candidate

Next recommended action:

- If final_status is PASS: prepare DB apply decision bundle for 佐藤（DB担当）review.
- If final_status is FAIL: inspect verification result and repair only failed items.

