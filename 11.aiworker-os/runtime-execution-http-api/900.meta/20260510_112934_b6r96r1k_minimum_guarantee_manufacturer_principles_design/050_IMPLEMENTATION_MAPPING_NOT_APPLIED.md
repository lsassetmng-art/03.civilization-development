# AIWorkerOS 実装マッピング案 NOT APPLIED

## 1. 目的

最低保証、メーカー競争差別化、ロボット基本原則を、AIWorkerOS実装へ接続するための対応表。

この工程では実装しない。  
server patch、DB apply、API POSTは別工程。

## 2. requester_delivery_payload へ入れる項目

候補。

- minimum_guarantee_profile
- manufacturer_profile
- series_profile
- cx_reference_profile
- personality_profile
- trait_profile
- robot_principle_profile
- performance_profile
- reference_usage_profile
- safety_boundary_summary

## 3. minimum_guarantee_profile

保存内容。

- deliverable_body_required
- executable_required
- available_required
- readable_required
- maintainable_required
- safe_required
- limitation_required
- next_steps_required

## 4. manufacturer_profile

保存内容。

- manufacturer_code
- manufacturer_name
- manufacturer_style
- manufacturer_strengths
- manufacturer_output_bias
- manufacturer_review_bias
- manufacturer_safety_posture

## 5. series_profile

保存内容。

- series_code
- initiative_level
- user_influence_level
- action_restriction_level
- role_affinity
- output_style
- review_style

## 6. cx_reference_profile

保存内容。

- reference_depth
- readable_domain_scope
- source_backed_allowed
- verified_canon_allowed
- lightweight_reference_allowed
- caution_aware_allowed
- unavailable_reference_scope

## 7. personality_profile

保存内容。

- personality_code
- tone_style
- suggestion_style
- distance_style
- correction_style
- encouragement_style

## 8. trait_profile

保存内容。

- precision_level
- creativity_level
- review_level
- prediction_level
- organization_level
- execution_level
- communication_level

## 9. robot_principle_profile

公開側に出す内容。

- safety_first
- authority_boundary
- risk_disclosure
- escalation_on_high_risk
- safe_alternative_on_rejection

内部だけで扱う内容。

- detailed harm control
- self-destruction prevention
- combat safety constraints
- internal stop conditions
- internal escalation rules

## 10. 実装順

1. 設計書作成
2. 既存DB/profile table確認
3. requester_delivery_payloadへprofileを追加
4. AICM consumer保存
5. UI表示は公開可能項目だけ
6. 内部項目はmetadataまたはpolicy側に保持
7. POST検証
8. AICM UI確認
9. secret scan
10. ユーザー明示後のみpush

## 11. 注意

戦闘用詳細原則は公開表示しない。

公開上は、防衛、警備、危機対応、安全制御などの抽象表現にする。

内部では安全境界として保持する。
