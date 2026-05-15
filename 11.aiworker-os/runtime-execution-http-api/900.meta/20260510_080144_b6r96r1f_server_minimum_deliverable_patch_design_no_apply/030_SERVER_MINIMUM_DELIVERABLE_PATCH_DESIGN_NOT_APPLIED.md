# B6R96R1F AIWorkerOS server minimum deliverable patch design NOT APPLIED

## 1. Goal

AIWorkerOS must always return requester-facing deliverable payload for paid robot runtime requests.

The payload must include a stable deliverable body.

The goal is not to make low performance robots unstable or empty.  
The goal is to make every paid robot return a stable standard deliverable, while performance differences are expressed by CX reference permission, depth, specialty, originality, prediction, and review precision.

## 2. Contract to add

AIWorkerOS response should include:

- requester_delivery_payload.contract_version
- requester_delivery_payload.deliverable_title
- requester_delivery_payload.deliverable_kind
- requester_delivery_payload.body_format
- requester_delivery_payload.body_markdown
- requester_delivery_payload.summary_text
- requester_delivery_payload.limitations_text
- requester_delivery_payload.unresolved_issues_text
- requester_delivery_payload.next_steps_text
- requester_delivery_payload.minimum_guarantee_status
- requester_delivery_payload.performance_profile
- requester_delivery_payload.reference_usage_profile
- requester_delivery_payload.generation_basis

## 3. Non-empty body rule

body_markdown must not be empty.

If normal generation cannot be done, return a stable fallback deliverable:

- 作業不能理由レポート
- 不足情報レポート
- 権限境界レポート
- 安全境界レポート

## 4. Role-specific minimum body

President:
- 方針案
- 目的
- 優先順位
- 成功条件
- 制約条件
- Managerへ渡す方向性
- 次工程

Manager:
- 大項目分解案
- 目的
- 優先度
- Leaderへ渡す観点
- 未解決事項
- 次工程

Leader:
- 作業単位分解案
- 中項目
- Workerへの引き渡し
- 品質確認観点
- 次工程

Worker:
- 成果物
- 概要
- 本文
- 確認ポイント
- 未解決事項
- 次工程

Unknown role:
- 標準成果物
- 概要
- 本文
- 注意点
- 次工程

## 5. Performance difference

Low performance:
- stable standard deliverable
- low originality
- low specialty
- lightweight CX reference
- shallow prediction
- basic review

Standard performance:
- stable practical deliverable
- standard specificity
- standard CX reference
- standard review

High performance:
- stable advanced deliverable
- high specialty
- deeper CX reference
- higher originality
- stronger prediction
- advanced review

## 6. CX permission boundary

The server should not pretend to use CX data that the robot cannot read.

Payload should include reference_usage_profile:

- reference_depth
- readable_domain_scope
- used_reference_scope
- unavailable_reference_scope
- assumptions
- limitations
- escalation_recommendation

## 7. Helper functions to add

Add helpers near the runtime request handler, not scattered.

Recommended helpers:

- aiwB6R96R1GText
- aiwB6R96R1GFirstText
- aiwB6R96R1GNormalizeRoleCode
- aiwB6R96R1GCapabilityTierFromModel
- aiwB6R96R1GReferenceProfile
- aiwB6R96R1GBuildRoleBody
- aiwB6R96R1GBuildBlockingBody
- aiwB6R96R1GBuildRequesterDeliveryPayload
- aiwB6R96R1GAttachRequesterDeliveryPayload

## 8. Patch insertion point

The next phase must identify the exact server response object that currently returns accepted/request_id/status/payload.

Patch should insert requester_delivery_payload into that response object.

Do not change DB function semantics yet.

Do not rewrite the whole handler.

## 9. DB scope

This patch design does not require DB schema apply.

If persistence in aiworker.runtime_requester_deliverable_output is needed, do it in a later DB-reviewed phase.

## 10. Acceptance criteria

- server.js node --check passes
- requester_delivery_payload exists in runtime accepted response
- body_markdown is non-empty
- low performance model returns stable standard deliverable
- high performance model returns richer profile
- accepted-only response is eliminated for paid runtime
- no raw internal payload is exposed as deliverable
