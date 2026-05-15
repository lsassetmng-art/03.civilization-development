# 実装計画 NOT APPLIED

## 1. 今回の設計変更

低性能ロボットでも成果物は安定させる。

性能差は成果物の安定性ではなく、CX利用権限と専門性で出す。

## 2. AIWorkerOS runtimeの必須処理

runtime request accepted後、AIWorkerOSは requester_delivery_payload を必ず作る。

必須。

- deliverable_title
- deliverable_kind
- body_format
- body_markdown
- summary_text
- limitations_text
- unresolved_issues_text
- next_steps_text
- performance_profile
- reference_usage_profile

## 3. 最低成果物生成

body_markdownが空になりそうな場合は、以下の順で補完する。

1. ロール別標準テンプレートで成果物作成
2. それも不可なら作業不能理由レポート
3. それも不可なら不足情報レポート

ただし acceptedだけで終わらせない。

## 4. CX利用権限制御

AIWorkerOSは、ロボットごとにCX参照可能範囲を確認する。

生成時に見る。

- model_code
- role_code
- capability_profile
- reference_depth
- readable_domain_scope
- source_backed_allowed
- verified_canon_allowed
- lightweight_reference_allowed

## 5. performance_profile

成果物payloadへ以下を入れる。

- capability_tier
- stability_level
- originality_level
- specialty_level
- reference_depth
- reference_scope
- prediction_level
- review_depth
- granularity_level

低性能でも stability_level は standard 以上にする。

## 6. 実装順

1. server.jsの実コードdump
2. 既存runtime response作成位置の特定
3. requester_delivery_payload builder追加
4. ロール別最低成果物テンプレート追加
5. CX利用権限profileの読み取り
6. accepted responseへpayload追加
7. AICM consumer保存確認
8. UIで納品サマリー確認

## 7. DB方針

DB applyはまだしない。

必要なら次工程で佐藤レビュー後。

候補。

- aiworker.runtime_requester_deliverable_output
- requester_delivery_payload_jsonb
- performance_profile_jsonb
- reference_usage_profile_jsonb

## 8. 検証条件

- 低性能ロボットでもbody_markdownが非空
- 成果物本文が安定
- summaryだけで終わらない
- acceptedだけで終わらない
- CX権限外の専門性を出さない
- 高性能との差は深さと専門性で出る
- AICM納品サマリーが作成条件だけにならない

## 9. 次工程

B6R96R1F:
AIWorkerOS server minimum deliverable generation patch design NOT APPLIED

B6R96R1G:
AIWorkerOS server patch temp generation / node check only

B6R96R1H:
AICM integration UI confirmation
