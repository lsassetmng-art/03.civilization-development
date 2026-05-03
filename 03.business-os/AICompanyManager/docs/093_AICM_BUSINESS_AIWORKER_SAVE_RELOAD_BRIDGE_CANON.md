# AICompanyManager BusinessOS AIWorker Save Reload Bridge Canon

## Purpose
After AICompanyManager saves a BusinessOS AIWorker robot placement, reload the screen-specific placement list automatically.

## Boundary
This bridge does not own DB or robot canon.

AIWorkerOS owns:
- model canon
- series
- manufacturer
- personality
- safety boundary

BusinessOS _aiworker owns:
- pool
- entitlement
- placement
- placement API

AICompanyManager owns:
- route-specific UX
- save button
- screen-specific list display
- reload bridge

## Trigger
The bridge observes the save client output:
[data-aicm-aiworker-output='draft']

When the output JSON contains:
- ok: true
- placementResult.ok: true

Then the bridge reloads the screen-filter list for the current route context.

## Route context source
localStorage key:
aicm_business_aiworker_route_context

This is written by:
aicm-business-aiworker-route-integration.js

## Manual fallback
The bridge also adds a manual button:
保存後リスト再読込

## Safety
- No DB change
- No direct DB access
- No existing main JS modification
- index.html script append only
