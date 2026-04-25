# CasualChatWorker Implementation Entrypoint

status: phase-f-skeleton-created
app_name: CasualChatWorker
display_name: 雑談ワーカー
category: 03.business-os
implementation_root: ~/03.civilization-development/03.business-os/CasualChatWorker

## Roadmap

1. Phase A-E: design / pricing / free ticket / DB / freeze
2. Phase F: implementation skeleton and domain contract
3. Phase G: UI static prototype
4. Phase H: API client wiring
5. Phase I: offline queue / sync presentation
6. Phase J: acceptance verification

## Current Position

This package fixes the first implementation receiving structure after DB approval.

## Canonical Fixed Points

- base price: 30 minutes = 500 JPY
- durations: 30 / 60 / 90 / 120 minutes
- monthly free tickets: 2
- free minutes per ticket: 30
- max free minutes per month: 60
- worker types: Friend / Lover
- CasualChatWorker max contract duration: 120 minutes
- CommonOS is used for shared UI foundation
- business schema owns contract and ticket truth
- aiworker schema owns AI worker truth
- cx22073jw is read-only reference for common knowledge / conversation material

## Prohibited in this phase

- DB apply
- destructive file operation
- ERP direct posting
- copying aiworker canon into this app
- copying cx22073jw canon into this app
- real surveillance / coercion / dependency induction
