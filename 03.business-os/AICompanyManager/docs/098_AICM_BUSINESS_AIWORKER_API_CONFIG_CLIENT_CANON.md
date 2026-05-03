# AICompanyManager BusinessOS AIWorker API Config Client Canon

## Purpose
Provide browser-side configuration for the canonical BusinessOS AIWorker API.

## Canonical base URL
Default:
- http://127.0.0.1:8801

## Override priority
1. window.AICM_BUSINESS_AIWORKER_API_BASE_URL
2. localStorage key: aicm_business_aiworker_api_base_url
3. default: http://127.0.0.1:8801

## Auth header helper
The config client uses AICMBusinessAIWorkerAuthTokenClient when present.

## Helper functions
- getBaseUrl()
- setBaseUrl(url)
- clearBaseUrl()
- buildUrl(path, params)
- buildFetchOptions(options)
- fetchJson(path, options)

## Scope
This client only supplies config/helper functions.
It does not own DB, auth decisions, or placement rules.
