# B6R95R3Z-R27 Quality Summary

## Extracted zip

```
EXISTING_ZIP=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip
main_chars=1793
summary_chars=151
```

## Quality checks

```
zip_exists=PASS
has_summary_file=PASS
has_main_deliverable_file=PASS
has_manifest_file=PASS
main_long_enough=FAIL
summary_long_enough=PASS
core_terms_pass=PASS
person_terms_pass=PASS
system_terms_pass=PASS
timeline_terms_pass=PASS
source_caution_terms_pass=PASS
cx_material_patch_trace_pass=PASS
not_instruction_echo_only=FAIL
PASS_COUNT=11
FAIL_COUNT=2
FAIL_ROWS=main_long_enough,not_instruction_echo_only
```

## Core term hits

```
大化の改新=8
乙巳の変=1
改新の詔=1
公地公民=1
律令国家=1
中央集権=0
大宝律令=0
```

## Person term hits

```
中大兄皇子=1
中臣鎌足=1
蘇我入鹿=1
蘇我蝦夷=1
皇極天皇=0
孝徳天皇=0
天智天皇=0
藤原鎌足=0
```

## System term hits

```
戸籍=1
計帳=1
班田=1
租=1
庸=1
調=2
国司=1
郡司=1
国郡里=0
```

## Timeline term hits

```
645=1
646=1
663=1
701=1
白村江=0
近江令=0
飛鳥浄御原令=0
```

## Source caution term hits

```
日本書紀=1
史料=2
史料批判=1
後世=1
律令制度=1
一挙=0
段階的=1
断定=1
注意=1
```

## CX patch/material trace hits

```
B6R95R3Z-R24=1
B6R95R3Z-R26=0
CX22073JW=3
runtime material=1
selector v2=0
CX参照素材=0
cx_material=3
```

## Main deliverable head

```
# 大化の改新 詳細資料生成 smoke after R26
## 1. 成果物サマリ
AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。
## 2. 生成主体
- generation_owner: AIWorkerOS
- requester_app_ref: cx22073jw
- source_request_ref: B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815
- source_route_code: aiworkeros_direct_instruction_to_zip_smoke_after_r26
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
CX22073JWの大化の改新 source-backed runtime material を参照し、詳細資料を作成してください。
必須条件:
1. 乙巳の変、中大兄皇子、中臣鎌足、蘇我入鹿、蘇我蝦夷を含める。
2. 645年、646年、663年、701年を含む時系列を入れる。
3. 改新の詔、公地公民、戸籍、計帳、班田、租庸調、国司、郡司、律令国家形成を説明する。
4. 『日本書紀』中心の史料注意、史料批判、後世の律令制度理解が反映された可能性を明記する。
5. 大化の改新を一度で完成した改革と断定せず、段階的国家形成として説明する。
6. 成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返す。
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
AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。
```

FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R27_AFTER_R26_DELIVERABLE_QUALITY_STILL_WEAK