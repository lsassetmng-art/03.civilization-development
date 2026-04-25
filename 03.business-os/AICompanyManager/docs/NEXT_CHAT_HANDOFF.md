# AICompanyManager Implementation Next Chat Handoff

app_name: AICompanyManager
display_name: AI企業運営アプリ
status: final-completion-package

## Implementation Root

~/03.civilization-development/03.business-os/AICompanyManager

## Main Files

- index.html
- assets/css/app.css
- assets/js/app.js
- src/config/runtimeConfig.js
- src/api/client.js
- src/api/payloadAdapter.js
- src/api/serverRouteClient.js
- src/bridge/aiworkerBridge.js
- src/queue/localQueue.js
- src/events/aicmEvents.js
- src/actions/reviewDeliveryActions.js
- src/mock/mockData.js
- _commonos/sync/syncPresenter.js
- server-routes/README.md
- server-routes/business-ai-company-manager-routes.md
- server-routes/aiworker-company-pipeline-route.placeholder.js
- tests/smoke_check.sh
- tests/acceptance_check.sh
- tests/final_completion_check.sh

## Runtime

Default:
- mock

Live:
- deferred
- server-mediated only

## Safety

No browser-side secrets.

No direct browser call to AIWorkerOS internal routes.

RLS not applied yet.

## Next

Use one of:

- RLS apply after explicit Boss RLS OK / GO
- server route hardening
- production auth design
- deployment package
