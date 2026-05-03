# Manager to Leader to Worker Runtime Plan

status: active
scope: AICompanyManager / PMLW / Runtime Execution
owner: Boss
prepared_by: Zero

## Correct canonical flow

Manager major work item must not be sent directly to Worker Runtime.

Correct flow:

1. President policy or user request
2. Manager creates major work item
3. Manager sends major work item to Leader / 課長
4. Leader creates middle work items
5. Leader creates deliverable requirements
6. Leader creates Worker work units
7. Worker work unit creates AIWorkerOS Runtime Execution request
8. Worker output
9. Leader review
10. Manager gate
11. Human review / delivery approval

## UI wording

Manager major row action should be:

- 課長へ送る
- Leaderへ引渡し

Not:

- AI実行依頼へ送る

## Runtime request source

Runtime request must be created from Worker work unit, not Manager major item.

Expected source_request_ref examples:

- worker-work-unit:<worker_work_unit_id>
- pmlw-worker-unit:<worker_work_unit_id>

## Safe implementation order

AXU-R1:
- Manager major row -> Leader handoff
- Update major row status / assigned leader / handoff status
- No AIWorkerOS runtime request yet

AXV:
- Leader middle item / deliverable requirement / Worker work unit UI/API
- Build or connect existing DB/API objects

AXW:
- Worker work unit -> worker-runtime/request
- Existing confirmation screen reused
- Runtime Status Panel tracks result

## Boundary

Do not bypass:
- Leader decomposition
- Worker work unit creation
- review gate
- human GO gate
- AIWorkerOS Runtime Control Profile
