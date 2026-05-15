# B6R96R1H4_R3 佐藤レビュー依頼

## 原因

H4_R2 applyで `robot_brain_model_domain_policy.brain_domain_code` に `security_crisis_response` を入れようとした。
しかし `brain_domain_code` は `aiworker.brain_data_domain_catalog` へのFKであり、task_domain_codeとは別物。

## 今回の修正

- `aiworker.brain_data_domain_catalog` をread-only確認
- task_domain_code 6件を brain_domain_code へマッピング
- H4_R1補正SQL内の `... as brain_domain_code` をbrain catalog上の値へ置換
- SQLはまだ未適用

## 佐藤確認事項

1. task_domain_code → brain_domain_code のマッピングが正しいか
2. brain_domain_codeが粗すぎる場合、brain_data_domain_catalog側へ新規domain追加が必要か
3. 新規brain domain追加が必要なら、このoverlay applyより先にbrain catalog applyを行うか
4. AIWorkerOS runtimeでは task_domain_code と brain_domain_code を別概念として扱う方針でよいか
5. 補正版SQLを次工程でapplyしてよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
