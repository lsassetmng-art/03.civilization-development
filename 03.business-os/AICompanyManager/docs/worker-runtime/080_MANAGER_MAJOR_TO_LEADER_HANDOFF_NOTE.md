# Manager Major to Leader Handoff Note

status: active
scope: AICompanyManager / PMLW
owner: Boss
prepared_by: Zero

## Correct flow

Manager major work item must not be sent directly to Worker Runtime.

Correct flow:

1. Manager major work item
2. Leader / 課長 handoff
3. Leader middle work items
4. Deliverable requirements
5. Worker work units
6. Worker Runtime request
7. Worker output
8. Leader review
9. Manager gate
10. Human review / delivery

## Current implementation

Manager major rows show:

- 課長へ送る

This action uses the existing DB confirmation flow and existing endpoint:

- /api/aicm/v2/manager-major/update

It updates:

- assigned_leader_label
- decomposition_status_code = assigned_to_leader
- handoff_status_code = handed_off

## Explicit boundary

This phase does not create AIWorkerOS Runtime Execution requests.

Runtime requests must later be created from Worker work units, not Manager major rows.
