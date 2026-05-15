# B6R96R1E2 佐藤レビュー依頼

## 前回FAIL原因

B6R96R1Eでは aiworker.business_support_task_domain の必須列を埋められず、18件すべてMANUAL_REVIEW_REQUIREDになった。

不足列:
- task_domain_id
- package_code
- task_domain_name
- cx_topic_code

## 今回の修正案

- task_domain_id: gen_random_uuid()
- package_code: 既存business_support_task_domainから最多/先頭値を推定
- task_domain_code: 仕事内容コード
- task_domain_name: 英語名
- task_domain_name_ja: 日本語名
- cx_topic_code: task_profile_<task_domain_code>
- sort_order: 1000番台/2000番台
- status_code: active

## 佐藤確認事項

1. package_codeの推定値でよいか
2. cx_topic_codeを task_profile_<task_domain_code> で追加してよいか
3. cx_topic_codeがCX側topicの正本を要求する場合、先にCX topic登録が必要か
4. military/security系domainを同じtableに置いてよいか
5. HD-R2系の安全境界は別policyにも追加する必要があるか
6. worker_domain_proficiencyがworker_id専用なら、model/domain overlayを追加する必要があるか
7. PersonaOS側はderived viewで進めてよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
