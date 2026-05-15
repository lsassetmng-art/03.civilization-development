# B6R96R1E2 Column Exact Fix Decision

## 1. 前回FAIL原因
- aiworker.business_support_task_domain の必須列を埋められなかった。
- missing: task_domain_id / package_code / task_domain_name / cx_topic_code
- そのため18件すべてMANUAL_REVIEW_REQUIREDになった。

## 2. 今回の修正
- task_domain_id: gen_random_uuid()
- package_code: 既存行から推定
- task_domain_name: 英語名
- task_domain_name_ja: 日本語名
- cx_topic_code: task_profile_<task_domain_code>
- sort_order/status_codeも既存列に合わせて出力

## 3. 推定値
- inferred package_code: BUSINESS_SUPPORT_WLM_V0
- required columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code
- missing after fix: none

## 4. 佐藤レビュー必須
- package_codeがこの値でよいか
- cx_topic_codeを task_profile_<task_domain_code> で新規扱いしてよいか
- cx_topic_codeに既存CX topic FK/運用制約があるなら、先にCX側topic登録が必要か
- military/security系domainを同じtableに置いてよいか

## 5. 状態
- SQLはNOT APPLIED
- DB writeなし
- 次は佐藤レビュー後、明示GOならapply
