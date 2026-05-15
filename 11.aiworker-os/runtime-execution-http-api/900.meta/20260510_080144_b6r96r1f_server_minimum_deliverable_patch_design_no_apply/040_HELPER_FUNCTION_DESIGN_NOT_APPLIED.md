# B6R96R1F helper function design NOT APPLIED

## 1. aiwB6R96R1GText

Purpose:
Normalize nullable values to trimmed strings.

## 2. aiwB6R96R1GFirstText

Purpose:
Pick the first non-empty text from candidates.

## 3. aiwB6R96R1GNormalizeRoleCode

Purpose:
Normalize role code from request/body/model metadata.

Expected categories:

- president
- manager
- leader
- worker
- helper
- friend
- lover
- unknown

## 4. aiwB6R96R1GCapabilityTierFromModel

Purpose:
Map model/series/profile to capability tier.

Initial safe mapping:

- HD-R5P, HD-R5, BYD2-003: high
- HD-R4, BYD2-002, BYD1-003: standard
- HD-R3, BYD1-001, BYD1-002: standard_basic
- HD-R1C, HD-R1A, low budget/Friend/Lover: basic_stable
- unknown: standard_basic

Important:
basic_stable still returns stable deliverable.

## 5. aiwB6R96R1GReferenceProfile

Purpose:
Describe CX reference permission effect.

basic_stable:
- reference_depth: lightweight
- originality_level: low
- specialty_level: low
- stability_level: standard

standard_basic:
- reference_depth: standard_light
- originality_level: medium_low
- specialty_level: medium_low
- stability_level: standard

standard:
- reference_depth: standard
- originality_level: medium
- specialty_level: medium
- stability_level: standard

high:
- reference_depth: deep
- originality_level: high
- specialty_level: high
- stability_level: high

## 6. aiwB6R96R1GBuildRoleBody

Purpose:
Create stable role-specific body_markdown.

Inputs:
- role_code
- task_title
- task_instruction_ja
- capability_tier
- reference_profile

Output:
- non-empty markdown string

## 7. aiwB6R96R1GBuildBlockingBody

Purpose:
Create stable blocking report if input is insufficient or unsafe.

Output:
- non-empty markdown string

## 8. aiwB6R96R1GBuildRequesterDeliveryPayload

Purpose:
Build the full requester_delivery_payload.

Required fields:
- contract_version
- deliverable_title
- deliverable_kind
- body_format
- body_markdown
- summary_text
- limitations_text
- unresolved_issues_text
- next_steps_text
- minimum_guarantee_status
- performance_profile
- reference_usage_profile
- generation_basis

## 9. aiwB6R96R1GAttachRequesterDeliveryPayload

Purpose:
Attach payload to the existing response without breaking existing fields.

Rules:
- Preserve request_id/status/payload
- Add requester_delivery_payload
- Add deliverable alias only if safe
- Do not remove existing app_read_payload_jsonb
