# CX22073JW参照権限による性能差制御 正本案

## 1. 方針

ロボットの性能差は、主にCX22073JWなどの参照データ利用権限で制御する。

成果物の安定性を下げるのではなく、参照できる知識の範囲、深さ、粒度、検証度で差を出す。

## 2. CX参照制御軸

主な制御軸は以下。

- readable_domain_scope
- reference_depth
- source_backed_access
- verified_canon_access
- lightweight_reference_access
- legacy_seed_access
- caution_aware_access
- professional_domain_access
- strategic_domain_access
- review_domain_access

## 3. 低性能ロボット

低性能ロボットのCX利用。

- lightweight_reference中心
- legacy_seed利用可
- source-backed深掘りは限定
- verified_canonの広範囲利用は不可または限定
- 専門domain参照は限定
- caution情報は基本的なもののみ
- 参照できない情報は成果物に含めない

成果物の性質。

- 安定した標準成果物
- 一般論中心
- 独自性は少ない
- 専門性は控えめ
- 不明点を明記
- 必要なら上位ロボットへの引き継ぎ提案を出す

## 4. 中性能ロボット

中性能ロボットのCX利用。

- 標準domain参照可
- 一部source-backed参照可
- verified_canonは限定範囲で利用可
- caution情報を扱える
- 標準的なレビュー観点を持つ

成果物の性質。

- 安定した実務成果物
- ある程度の具体性
- 標準的な専門性
- リスクや次工程を整理
- 不足情報があっても仮定を明記して進行可

## 5. 高性能ロボット

高性能ロボットのCX利用。

- source-backed参照可
- verified_canon参照可
- 複数domain横断可
- caution-aware参照可
- 専門domain参照可
- strategic/review domain参照可
- 深い歴史/知識/業務参照を成果物へ反映可

成果物の性質。

- 安定かつ高品質
- 独自性がある
- 専門性が高い
- 複数観点を統合
- 予測やリスクを含む
- 実行可能な次工程を出す

## 6. Friend / Lover / 低価格会話系

会話系ロボットは、深い知識を常に返す必要はない。

ただし成果物依頼を受けた場合は、最低保証成果物を返す。

CX利用は以下。

- lightweight_reference中心
- legacy_seed利用可
- 会話演出優先
- 深い専門判断は控える
- 必要なら専門ロボットへの依頼を提案

## 7. 成果物への反映

requester_delivery_payloadには、参照状態を明示する。

保存候補。

- reference_depth
- readable_domain_scope
- used_reference_scope
- unavailable_reference_scope
- assumptions
- limitations
- escalation_recommendation

## 8. 禁止

- 参照権限がないCX情報を使ったふりをする
- 低性能ロボットの成果物を不安定にする
- 低性能だから空成果物にする
- 高性能との差を失敗率で表す
