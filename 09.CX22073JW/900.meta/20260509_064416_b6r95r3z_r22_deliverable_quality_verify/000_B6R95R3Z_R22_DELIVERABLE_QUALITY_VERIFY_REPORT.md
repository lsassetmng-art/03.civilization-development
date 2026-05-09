# B6R95R3Z-R22 Deliverable Quality Verify Report

RUN_TS=20260509_064416
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_064416_b6r95r3z_r22_deliverable_quality_verify
R21_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_064228_b6r95r3z_r21_db_response_zip_contract_verify
EXISTING_ZIP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/cx22073jw_smoke_1778274294150_17025587-9265-4aab-9866-5c10bf7bb9ad.zip

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Quality summary
# B6R95R3Z-R22 Deliverable Quality Summary

## File metrics

```
summary_chars=141
main_chars=1595
manifest_chars=2766
zip_list_has_summary=YES
zip_list_has_main=YES
zip_list_has_manifest=YES
```

## Quality checks

```
has_summary_file=PASS
has_main_deliverable_file=PASS
has_manifest_file=PASS
main_long_enough=PASS
summary_long_enough=PASS
core_terms_pass=PASS
person_terms_pass=FAIL
system_terms_pass=FAIL
timeline_terms_pass=FAIL
source_caution_terms_pass=FAIL
robot_use_terms_pass=PASS
not_instruction_echo_only=FAIL
likely_source_backed_quality=FAIL
PASS_COUNT=7
FAIL_COUNT=6
FAIL_ROWS=person_terms_pass,system_terms_pass,timeline_terms_pass,source_caution_terms_pass,not_instruction_echo_only,likely_source_backed_quality
```

## Core term hits

```
大化の改新=7
乙巳の変=0
改新の詔=1
公地公民=1
律令国家=1
中央集権=0
大宝律令=0
```

## Person term hits

```
中大兄皇子=0
中臣鎌足=0
蘇我入鹿=0
蘇我蝦夷=0
皇極天皇=0
孝徳天皇=0
天智天皇=0
藤原鎌足=0
```

## System term hits

```
戸籍=0
計帳=0
班田=0
租=0
庸=0
調=1
国司=0
郡司=0
国郡里=0
```

## Timeline term hits

```
645=0
646=0
663=0
701=0
白村江=0
近江令=0
飛鳥浄御原令=0
```

## Source caution term hits

```
日本書紀=0
史料=0
史料批判=0
後世=0
律令制度=0
一挙=0
段階的=0
断定=0
注意=1
```

## Robot-use term hits

```
誤解=1
説明=0
資料=7
要約=0
論点=0
成果物=13
注意点=0
```

## Instruction echo risk hits

```
CX22073JWの大化の改新 source-backed runtime material を参照し=1
成果物本文、summary_text、generated_artifacts、納品zipを作成し=1
zip linkを返してください=1
```

## Main deliverable head

```
# 大化の改新 詳細資料生成 smoke
## 1. 成果物サマリ
AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smokeの一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。
## 2. 生成主体
- generation_owner: AIWorkerOS
- requester_app_ref: cx22073jw
- source_request_ref: B6R95R3Z_R20_TAIKA_E2E_20260509_060449
- source_route_code: aiworkeros_direct_instruction_to_zip_smoke
- app_surface_code: ai_company_manager
## 3. 設定ロボット / 性能差の根拠
- model_code: byd2_003_asic_leader3
- role_layer_code: runtime_resolved_by_aiworker
- series_code: runtime_resolved_by_aiworker
- capability_profile_code: runtime_resolved_by_aiworker
- task_domain_code: history_worldview
- cx_reference_depth_code: runtime_policy_resolved
- cx_reference_breadth_code: runtime_policy_resolved
## 4. 成果物本文
CX22073JWの大化の改新 source-backed runtime material を参照し、出典注意、誤解防止、時系列、人物、制度、公地公民、改新の詔、律令国家形成への接続を含む詳細資料を作成してください。成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返してください。
## 5. 品質メモ
AIWorkerOS側で生成した一次成果物です。
設定ロボット: byd2_003_asic_leader3
役割レイヤー: runtime_resolved_by_aiworker
タスク領域: history_worldview
CX参照深度: runtime_policy_resolved
CX参照広さ: runtime_policy_resolved
今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。
## 6. 未解決事項
この段階では外部実行、PG apply、破壊的操作は行っていません。
追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。
## 7. 次工程
依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。
レビュー画面から成果物本文へ辿れるようにする。
差し戻し時は追加条件をAIWorkerOSへ再依頼する。
## 8. 安全境界
- external_execution_performed_flag=false
- pg_apply_performed_flag=false
- destructive_action_performed_flag=false
- CX22073JW brain access control is AIWorkerOS-side responsibility
```

## Summary head

```
AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smokeの一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。
```

## Manifest head

```
{
  "contract_version": "B6R95R3D-R1",
  "contract_name": "aiworkeros_common_requester_multi_artifact_zip_contract",
  "package_purpose": "bundle_generated_artifacts_for_single_download",
  "request_id": "a97837f5-3947-479a-b167-ae05ed90a1d8",
  "output_id": "e937dc58-8617-47e5-aa8b-ffbc88f25b06",
  "deliverable_title": "大化の改新 詳細資料生成 smoke 成果物",
  "summary_text": "AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smokeの一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。",
  "artifact_count": 4,
  "generated_artifacts": [
    {
      "artifact_no": 1,
      "artifact_kind_code": "main_deliverable",
      "title": "大化の改新 詳細資料生成 smoke 成果物",
      "file_name": "01_main_deliverable.md",
      "body_format": "markdown"
    },
    {
      "artifact_no": 2,
      "artifact_kind_code": "quality_notes",
      "title": "品質メモ",
      "file_name": "90_quality_notes.md",
      "body_format": "markdown"
    },
    {
      "artifact_no": 3,
      "artifact_kind_code": "unresolved_issues",
      "title": "未解決事項",
      "file_name": "91_unresolved_issues.md",
      "body_format": "markdown"
    },
    {
      "artifact_no": 4,
      "artifact_kind_code": "next_steps",
      "title": "次工程",
      "file_name": "92_next_steps.md",
      "body_format": "markdown"
    }
  ],
  "deliverable_ref": {
    "id": "e937dc58-8617-47e5-aa8b-ffbc88f25b06",
    "table": "runtime_worker_output",
    "schema": "aiworker",
    "source": "aiworkeros"
  },
  "robot_context": {
    "model_code": "byd2_003_asic_leader3",
    "series_code": "runtime_resolved_by_aiworker",
    "role_layer_code": "runtime_resolved_by_aiworker",
    "task_domain_code": "history_worldview",
    "capability_profile_code": "runtime_resolved_by_aiworker"
  },
  "generation_basis": {
    "cx_depth_basis": "runtime_policy_resolved",
    "safety_boundary": "internal_only_no_external_execution_no_pg_apply_no_destructive_action",
    "contract_version": "B6R95R3B-R3",
    "cx_breadth_basis": "runtime_policy_resolved",
    "generation_owner": "AIWorkerOS",
    "requester_app_ref": "cx22073jw",
    "robot_trait_basis": "model_code / role_layer_code / series_code / capability_profile_code are carried 
```

FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R22_DELIVERABLE_QUALITY_WEAK_OR_INCOMPLETE
## Quality log
```
============================================================
DELIVERABLE QUALITY CHECK
============================================================
summary_chars=141
main_chars=1595
manifest_chars=2766
has_summary_file=PASS
has_main_deliverable_file=PASS
has_manifest_file=PASS
main_long_enough=PASS
summary_long_enough=PASS
core_terms_pass=PASS
person_terms_pass=FAIL
system_terms_pass=FAIL
timeline_terms_pass=FAIL
source_caution_terms_pass=FAIL
robot_use_terms_pass=PASS
not_instruction_echo_only=FAIL
likely_source_backed_quality=FAIL
PASS_COUNT=7
FAIL_COUNT=6
FAIL_ROWS=person_terms_pass,system_terms_pass,timeline_terms_pass,source_caution_terms_pass,not_instruction_echo_only,likely_source_backed_quality
QUALITY_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_064416_b6r95r3z_r22_deliverable_quality_verify/040_R22_DELIVERABLE_QUALITY_SUMMARY.md
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R22_DELIVERABLE_QUALITY_WEAK_OR_INCOMPLETE
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
```

## Secret scan
```
Scan generated files only
```
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R22_DELIVERABLE_QUALITY_WEAK_OR_INCOMPLETE
NEXT=PASSならR23でAIWorkerOS側の成果物品質改善余地/selector material利用証跡確認。弱ければselector/material参照強化へ。
