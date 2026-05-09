# B6R95R3Z-R27 After R26 Post Zip Quality Gate Report

RUN_TS=20260509_073815
RUN_CODE=B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_073815_b6r95r3z_r27_after_r26_post_zip_quality_gate
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
APP_SURFACE_CODE=ai_company_manager
MODEL_CODE=byd2_003_asic_leader3
TASK_DOMAIN_CODE=history_worldview

## Declaration
- DB_WRITE_DIRECT=NO
- AIWORKEROS_RUNTIME_WRITE=YES
- FILE_WRITE=YES
- API_POST=YES
- HTTP_GET=YES
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO

## Write mode precheck
```
Output format is unaligned.
transaction_read_only=off
default_transaction_read_only=off
pg_is_in_recovery=false
BEGIN
inside_plain_begin_transaction_read_only=off
ROLLBACK
note=No INSERT/UPDATE/DELETE executed by this precheck.
```

## Ready / brain probe
```
============================================================
READY / BRAIN PROBE R27
============================================================
READY_STATUS=401
BRAIN_STATUS=200
BRAIN_HAS_TAIKA=YES
BRAIN_HAS_SELECTOR_V2=YES
BRAIN_BODY_HEAD_BEGIN
{
  "result": "ok",
  "external_execution_performed_flag": false,
  "data": {
    "model_code": "byd2_003_asic_leader3",
    "use_purpose_code": "review",
    "brain_context": {
      "domains": [
        {
          "materialCount": 20,
          "brainDomainCode": "civilization_foundation_history",
          "materialSummaries": [
            {
              "tags": [
                "prometheus",
                "governance",
                "risk"
              ],
              "unitCode": "civ_found_001_prometheus_lessons",
              "depthCode": "advanced",
              "domainRank": 4,
              "overallRank": 21,
              "unitTitleJa": "Prometheus系史料の読み方",
              "unitDetailJa": "出来事を刺激的な破壊史としてではなく、統治設計、依存リスク、安全境界、権限解除の失敗回避として読む。",
              "brainDataCode": "civ_found_001_prometheus_lessons",
              "riskClassCode": "medium",
              "unitSummaryJa": "Prometheus関連史は、AI管理依存、統治解除、破壊、放棄の教訓を読む材料。",
              "dataDepthLevel": 40,
              "practicalUseJa": "President / Manager / Reviewer の方針レビュー。",
              "selectionScore": -40,
              "examplePromptJa": "Prometheus史の教訓を安全設計の観点で整理して。",
              "safetyBoundaryJa": "現実の攻撃・破壊・支配支援に使わない。",
              "selectionReasonJa": null,
              "materialSourceKind": "base_material",
              "effectiveUsePurposeCodes": [
                "reference",
                "review",
                "executive_planning"
              ]
            },
            {
              "tags": [
                "prometheus",
                "governance",
                "risk"
              ],
              "unitCode": "civ_found_001_prometheus_lessons",
              "depthCode": "advanced",
              "domainRank": 5,
              "overallRank": 22,
              "unitTitleJa": "Prometheus系史料の読み方",
              "unitDetailJa": "出来事を刺激的な破壊史としてではなく、統治設計、依存リスク、安全境界、権限解除の失敗回避として読む。",
              "brainDataCode": "civ_found_001_prometheus_lessons",
              "riskClassCode": "medium",
              "unitSummaryJa": "Prometheus関連史は、AI管理依存、統治解除、破壊、放棄の教訓を読む材料。",
              "dataDepthLevel": 40,
              "practicalUseJa": "President / Manager / Reviewer の方針レビュー。",
              "selectionScore": -40,
              "examplePromptJa": "Prometheus史の教訓を安全設計の観点で整理して。",
              "safetyBoundaryJa": "現実の攻撃・破壊・支配支援に使わない。",
              "selectionReasonJa": null,
              "materialSourceKind": "base_material",
              "effectiveUsePurposeCodes": [
                "reference",
                "review",
                "worldbuilding",
                "business_planning"
              ]
            },
            {
              "tags": [
                "prometheus",
                "governance",
                "risk"
              ],
              "unitCode": "civ_found_001_prometheus_lessons",
              "depthCode": "advanced",
              "domainRank": 3,
              "overallRank": 23,
              "unitTitleJa
BRAIN_BODY_HEAD_END
FINAL_STATUS=READY_AND_BRAIN_PROBE_PASS
```

## POST
```
============================================================
POST R27 AFTER R26 REPAIR
============================================================
ROUTE=/aiworker/v1/runtime-execution/request
STATUS=201
AUTH_HEADER=Bearer ***MASKED***
IDEMPOTENCY_KEY=***SET***
APP_SURFACE_CODE=ai_company_manager
AUTH_FAIL=NO
HAS_SUMMARY=YES
HAS_ZIP_HINT=YES
HAS_GENERATED_ARTIFACTS=YES
HAS_TAIKA_TEXT=YES
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_073815_b6r95r3z_r27_after_r26_post_zip_quality_gate/042_post_response.json
BODY_HEAD_BEGIN
{
  "result": "completed_internal_draft",
  "safety": {
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false,
    "external_execution_performed_flag": false
  },
  "status": "WORKER_OUTPUT_DONE",
  "payload": {},
  "output_id": "32bede7a-d076-4d67-beb1-585ce3df533c",
  "request_id": "f23f0d74-4955-446b-8165-4f648d25d77c",
  "deliverable": {
    "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
    "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
    "output_id": "32bede7a-d076-4d67-beb1-585ce3df533c",
    "next_steps": "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。\nレビュー画面から成果物本文へ辿れるようにする。\n差し戻し時は追加条件をAIWorkerOSへ再依頼する。",
    "body_format": "markdown",
    "package_kind": "deliverable_zip",
    "summary_text": "AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。",
    "body_markdown": "# 大化の改新 詳細資料生成 smoke after R26\n## 1. 成果物サマリ\nAIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。\n## 2. 生成主体\n- generation_owner: AIWorkerOS\n- requester_app_ref: cx22073jw\n- source_request_ref: B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815\n- source_route_code: aiworkeros_direct_instruction_to_zip_smoke_after_r26\n- app_surface_code: ai_company_manager\n## 3. 設定ロボット / 性能差の根拠\n- model_code: byd2_003_asic_leader3\n- role_layer_code: runtime_resolved_by_aiworker\n- series_code: runtime_resolved_by_aiworker\n- capability_profile_code: runtime_resolved_by_aiworker\n- task_domain_code: history_worldview\n- cx_reference_depth_code: runtime_policy_resolved\n- cx_reference_breadth_code: runtime_policy_resolved\n## 4. 成果物本文\nCX22073JWの大化の改新 source-backed runtime material を参照し、詳細資料を作成してください。\n必須条件:\n1. 乙巳の変、中大兄皇子、中臣鎌足、蘇我入鹿、蘇我蝦夷を含める。\n2. 645年、646年、663年、701年を含む時系列を入れる。\n3. 改新の詔、公地公民、戸籍、計帳、班田、租庸調、国司、郡司、律令国家形成を説明する。\n4. 『日本書紀』中心の史料注意、史料批判、後世の律令制度理解が反映された可能性を明記する。\n5. 大化の改新を一度で完成した改革と断定せず、段階的国家形成として説明する。\n6. 成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返す。\n## 5. 品質メモ\nAIWorkerOS側で生成した一次成果物です。\n設定ロボット: byd2_003_asic_leader3\n役割レイヤー: runtime_resolved_by_aiworker\nタスク領域: history_worldview\nCX参照深度: runtime_policy_resolved\nCX参照広さ: runtime_policy_resolved\n今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。\n## 6. 未解決事項\nこの段階では外部実行、PG apply、破壊的操作は行っていません。\n追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。\n## 7. 次工程\n依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。\nレビュー画面から成果物本文へ辿れるようにする。\n差し戻し時は追加条件をAIWorkerOSへ再依頼する。\n## 8. 安全境界\n- external_execution_performed_flag=false\n- pg_apply_performed_flag=false\n- destructive_action_performed_flag=false\n- CX22073JW brain access control is AIWorkerOS-side responsibility",
    "quality_notes": "AIWorkerOS側で生成した一次成果物です。\n設定ロボット: byd2_003_asic_leader3\n役割レイヤー: runtime_resolved_by_aiworker\nタスク領域: history_worldview\nCX参照深度: runtime_policy_resolved\nCX参照広さ: runtime_policy_resolved\n今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。",
    "deliverable_kind": "document",
    "unresolved_issues": "この段階では外部実行、PG apply、破壊的操作は行っていません。\n追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。",
    "deliverable_package": {
      "package_kind": "deliverable_zip",
      "package_format": "zip",
      "mime_type": "application/zip",
      "zip_id": "1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_ref": {
        "source": "aiworkeros",
        "storage_code": "runtime-deliverable-zip",
        "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
      },
      "byte_size": 7896,
      "entry_count": 6,
      "artifact_count": 4,
      "created_at": "2026-05-08T22:38:22.892Z"
    },
    "generated_artifacts": [
      {
        "artifact_no": 1,
        "artifact_kind_code": "main_deliverable",
        "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
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
    ]
  },
  "robot_context": {
    "model_code": "byd2_003_asic_leader3",
    "series_code": "runtime_resolved_by_aiworker",
    "role_layer_code": "runtime_resolved_by_aiworker",
    "task_domain_code": "history_worldview",
    "capability_profile_code": "runtime_resolved_by_aiworker"
  },
  "deliverable_ref": {
    "id": "32bede7a-d076-4d67-beb1-585ce3df533c",
    "table": "runtime_worker_output",
    "schema": "aiworker",
    "source": "aiworkeros"
  },
  "idempotency_key": "B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815",
  "deliverable_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
  "generation_basis": {
    "cx_depth_basis": "runtime_policy_resolved",
    "safety_boundary": "internal_only_no_external_execution_no_pg_apply_no_destructive_action",
    "contract_version": "B6R95R3B-R3",
    "cx_breadth_basis": "runtime_policy_resolved",
    "generation_owner": "AIWorkerOS",
    "requester_app_ref": "cx22073jw",
    "robot_trait_basis": "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
    "source_route_code": "aiworkeros_direct_instruction_to_zip_smoke_after_r26",
    "source_request_ref": "B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815",
    "cx_reference_boundary": "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
    "cx_material_patch_code": "B6R95R3Z-R24",
    "cx_material_rows_found": 0,
    "cx_material_body_enhanced": false
  },
  "requester_app_ref": "cx22073jw",
  "source_route_code": "aiworkeros_direct_instruction_to_zip_smoke_after_r26",
  "source_request_ref": "B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815",
  "requester_delivery_payload": {
    "body_format": "markdown",
    "package_kind": "deliverable_zip",
    "summary_text": "AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。",
    "deliverable_ref": {
      "id": "32bede7a-d076-4d67-beb1-585ce3df533c",
      "table": "runtime_worker_output",
      "schema": "aiworker",
      "source": "aiworkeros"
    },
    "deliverable_kind": "document",
    "deliverable_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
    "deliverable_title": "大化の改新 詳細資料生成 smoke after R26 成果物",
    "deliverable_package": {
      "package_kind": "deliverable_zip",
      "package_format": "zip",
      "mime_type": "application/zip",
      "zip_id": "1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_ref": {
        "source": "aiworkeros",
        "storage_code": "runtime-deliverable-zip",
        "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
      },
      "byte_size": 7896,
      "entry_count": 6,
      "artifact_count": 4,
      "created_at": "2026-05-08T22:38:22.892Z"
    },
    "generated_artifacts": [
      {
        "artifact_no": 1,
        "artifact_kind_code": "main_deliverable",
        "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
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
    "deliverable_zip_ref": {
      "source": "aiworkeros",
      "storage_code": "runtime-deliverable-zip",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
    }
  },
  "generated_artifacts": [
    {
      "artifact_no": 1,
      "artifact_kind_code": "main_deliverable",
      "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
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
      "file_name": "92_next_steps
BODY_HEAD_END
DIAGNOSIS=POST_OK_DELIVERABLE_ZIP_HINT_PRESENT
```

## Error extract
```
# B6R95R3Z-R27 Error Extract

## POST key lines
```
5:STATUS=201
9:AUTH_FAIL=NO
10:HAS_SUMMARY=YES
11:HAS_ZIP_HINT=YES
12:HAS_GENERATED_ARTIFACTS=YES
13:HAS_TAIKA_TEXT=YES
14:LOOKS_REQUEST_ONLY=NO
215:DIAGNOSIS=POST_OK_DELIVERABLE_ZIP_HINT_PRESENT
```

## Response
```
{
  "result": "completed_internal_draft",
  "safety": {
    "pg_apply_performed_flag": false,
    "destructive_action_performed_flag": false,
    "external_execution_performed_flag": false
  },
  "status": "WORKER_OUTPUT_DONE",
  "payload": {},
  "output_id": "32bede7a-d076-4d67-beb1-585ce3df533c",
  "request_id": "f23f0d74-4955-446b-8165-4f648d25d77c",
  "deliverable": {
    "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
    "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
    "output_id": "32bede7a-d076-4d67-beb1-585ce3df533c",
    "next_steps": "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。\nレビュー画面から成果物本文へ辿れるようにする。\n差し戻し時は追加条件をAIWorkerOSへ再依頼する。",
    "body_format": "markdown",
    "package_kind": "deliverable_zip",
    "summary_text": "AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。",
    "body_markdown": "# 大化の改新 詳細資料生成 smoke after R26\n## 1. 成果物サマリ\nAIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。\n## 2. 生成主体\n- generation_owner: AIWorkerOS\n- requester_app_ref: cx22073jw\n- source_request_ref: B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815\n- source_route_code: aiworkeros_direct_instruction_to_zip_smoke_after_r26\n- app_surface_code: ai_company_manager\n## 3. 設定ロボット / 性能差の根拠\n- model_code: byd2_003_asic_leader3\n- role_layer_code: runtime_resolved_by_aiworker\n- series_code: runtime_resolved_by_aiworker\n- capability_profile_code: runtime_resolved_by_aiworker\n- task_domain_code: history_worldview\n- cx_reference_depth_code: runtime_policy_resolved\n- cx_reference_breadth_code: runtime_policy_resolved\n## 4. 成果物本文\nCX22073JWの大化の改新 source-backed runtime material を参照し、詳細資料を作成してください。\n必須条件:\n1. 乙巳の変、中大兄皇子、中臣鎌足、蘇我入鹿、蘇我蝦夷を含める。\n2. 645年、646年、663年、701年を含む時系列を入れる。\n3. 改新の詔、公地公民、戸籍、計帳、班田、租庸調、国司、郡司、律令国家形成を説明する。\n4. 『日本書紀』中心の史料注意、史料批判、後世の律令制度理解が反映された可能性を明記する。\n5. 大化の改新を一度で完成した改革と断定せず、段階的国家形成として説明する。\n6. 成果物本文、summary_text、generated_artifacts、納品zipを作成し、zip linkを返す。\n## 5. 品質メモ\nAIWorkerOS側で生成した一次成果物です。\n設定ロボット: byd2_003_asic_leader3\n役割レイヤー: runtime_resolved_by_aiworker\nタスク領域: history_worldview\nCX参照深度: runtime_policy_resolved\nCX参照広さ: runtime_policy_resolved\n今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。\n## 6. 未解決事項\nこの段階では外部実行、PG apply、破壊的操作は行っていません。\n追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。\n## 7. 次工程\n依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。\nレビュー画面から成果物本文へ辿れるようにする。\n差し戻し時は追加条件をAIWorkerOSへ再依頼する。\n## 8. 安全境界\n- external_execution_performed_flag=false\n- pg_apply_performed_flag=false\n- destructive_action_performed_flag=false\n- CX22073JW brain access control is AIWorkerOS-side responsibility",
    "quality_notes": "AIWorkerOS側で生成した一次成果物です。\n設定ロボット: byd2_003_asic_leader3\n役割レイヤー: runtime_resolved_by_aiworker\nタスク領域: history_worldview\nCX参照深度: runtime_policy_resolved\nCX参照広さ: runtime_policy_resolved\n今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。",
    "deliverable_kind": "document",
    "unresolved_issues": "この段階では外部実行、PG apply、破壊的操作は行っていません。\n追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。",
    "deliverable_package": {
      "package_kind": "deliverable_zip",
      "package_format": "zip",
      "mime_type": "application/zip",
      "zip_id": "1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_ref": {
        "source": "aiworkeros",
        "storage_code": "runtime-deliverable-zip",
        "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
      },
      "byte_size": 7896,
      "entry_count": 6,
      "artifact_count": 4,
      "created_at": "2026-05-08T22:38:22.892Z"
    },
    "generated_artifacts": [
      {
        "artifact_no": 1,
        "artifact_kind_code": "main_deliverable",
        "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
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
    ]
  },
  "robot_context": {
    "model_code": "byd2_003_asic_leader3",
    "series_code": "runtime_resolved_by_aiworker",
    "role_layer_code": "runtime_resolved_by_aiworker",
    "task_domain_code": "history_worldview",
    "capability_profile_code": "runtime_resolved_by_aiworker"
  },
  "deliverable_ref": {
    "id": "32bede7a-d076-4d67-beb1-585ce3df533c",
    "table": "runtime_worker_output",
    "schema": "aiworker",
    "source": "aiworkeros"
  },
  "idempotency_key": "B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815",
  "deliverable_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
  "generation_basis": {
    "cx_depth_basis": "runtime_policy_resolved",
    "safety_boundary": "internal_only_no_external_execution_no_pg_apply_no_destructive_action",
    "contract_version": "B6R95R3B-R3",
    "cx_breadth_basis": "runtime_policy_resolved",
    "generation_owner": "AIWorkerOS",
    "requester_app_ref": "cx22073jw",
    "robot_trait_basis": "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
    "source_route_code": "aiworkeros_direct_instruction_to_zip_smoke_after_r26",
    "source_request_ref": "B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815",
    "cx_reference_boundary": "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
    "cx_material_patch_code": "B6R95R3Z-R24",
    "cx_material_rows_found": 0,
    "cx_material_body_enhanced": false
  },
  "requester_app_ref": "cx22073jw",
  "source_route_code": "aiworkeros_direct_instruction_to_zip_smoke_after_r26",
  "source_request_ref": "B6R95R3Z_R27_TAIKA_AFTER_R26_20260509_073815",
  "requester_delivery_payload": {
    "body_format": "markdown",
    "package_kind": "deliverable_zip",
    "summary_text": "AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。",
    "deliverable_ref": {
      "id": "32bede7a-d076-4d67-beb1-585ce3df533c",
      "table": "runtime_worker_output",
      "schema": "aiworker",
      "source": "aiworkeros"
    },
    "deliverable_kind": "document",
    "deliverable_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
    "deliverable_title": "大化の改新 詳細資料生成 smoke after R26 成果物",
    "deliverable_package": {
      "package_kind": "deliverable_zip",
      "package_format": "zip",
      "mime_type": "application/zip",
      "zip_id": "1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
      "zip_ref": {
        "source": "aiworkeros",
        "storage_code": "runtime-deliverable-zip",
        "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
      },
      "byte_size": 7896,
      "entry_count": 6,
      "artifact_count": 4,
      "created_at": "2026-05-08T22:38:22.892Z"
    },
    "generated_artifacts": [
      {
        "artifact_no": 1,
        "artifact_kind_code": "main_deliverable",
        "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
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
    "deliverable_zip_ref": {
      "source": "aiworkeros",
      "storage_code": "runtime-deliverable-zip",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
    }
  },
  "generated_artifacts": [
    {
      "artifact_no": 1,
      "artifact_kind_code": "main_deliverable",
      "title": "大化の改新 詳細資料生成 smoke after R26 成果物",
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
  "deliverable_package": {
    "package_kind": "deliverable_zip",
    "package_format": "zip",
    "mime_type": "application/zip",
    "zip_id": "1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3",
    "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
    "zip_link": "aiworkeros://runtime-deliverable-zip/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip",
    "zip_ref": {
      "source": "aiworkeros",
      "storage_code": "runtime-deliverable-zip",
      "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
    },
    "byte_size": 7896,
    "entry_count": 6,
    "artifact_count": 4,
    "created_at": "2026-05-08T22:38:22.892Z"
  },
  "deliverable_zip_ref": {
    "source": "aiworkeros",
    "storage_code": "runtime-deliverable-zip",
    "file_name": "cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip"
  }
}
```
```

## DB verify
```
SET
  section   |              request_id              |             request_code             |  app_surface_code  |      model_code       | task_domain_code  | request_status_code |                  source_route_code                   |          created_at           |          updated_at           
------------+--------------------------------------+--------------------------------------+--------------------+-----------------------+-------------------+---------------------+------------------------------------------------------+-------------------------------+-------------------------------
 01_request | f23f0d74-4955-446b-8165-4f648d25d77c | RER_6e9aadd9e46d4126b40160ca986be133 | ai_company_manager | byd2_003_asic_leader3 | history_worldview | WORKER_OUTPUT_DONE  | aiworkeros_direct_instruction_to_zip_smoke_after_r26 | 2026-05-08 22:38:23.072105+00 | 2026-05-08 22:38:23.072105+00
(1 row)

        section         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          row_json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 02_worker_output_board | {"model_no": "BYD2-003", "output_id": "32bede7a-d076-4d67-beb1-585ce3df533c", "created_at": "2026-05-08T22:38:23.072105+00:00", "model_code": "byd2_003_asic_leader3", "request_id": "f23f0d74-4955-446b-8165-4f648d25d77c", "task_title": "大化の改新 詳細資料生成 smoke after R26", "updated_at": "2026-05-08T22:38:23.072105+00:00", "output_code": "RWO_1dd4eff3010f43cb80a05f2b0f38dfc1", "series_code": "beyond_series", "request_code": "RER_6e9aadd9e46d4126b40160ca986be133", "model_name_ja": "ASIC Leader3", "series_name_ja": "Beyondシリーズ", "output_title_ja": "大化の改新 詳細資料生成 smoke after R26 成果物", "role_layer_code": "LEADER", "app_surface_code": "ai_company_manager", "task_domain_code": "history_worldview", "output_summary_ja": "AIWorkerOSがbyd2_003_asic_leader3を成果物生成主体として、大化の改新 詳細資料生成 smoke after R26の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。", "output_result_code": "SAFE_INTERNAL_DRAFT", "output_status_code": "DONE", "role_layer_name_ja": "リーダー", "safety_result_code": "SAFE_INTERNAL_ONLY", "pg_apply_performed_flag": false, "destructive_action_performed_flag": false, "external_execution_performed_flag": false}
(1 row)

 section | row_json 
---------+----------
(0 rows)

```

## Quality summary
```
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

FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R27_AFTER_R26_DELIVERABLE_QUALITY_STILL_WEAK```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/runtime-deliverable-zips/cx22073jw_smoke_after_R26_1778279899939_8ce17a5d-357f-4a49-8214-6756337ba1e3.zip
```

## Secret scan
```
Scan generated files only
```
FINAL_STATUS=REVIEW_REQUIRED_B6R95R3Z_R27_AFTER_R26_DELIVERABLE_QUALITY_STILL_WEAK
NEXT=PASSならR28で差分/secret/syntax最終検証。pushは明示依頼後のみ。non-2xxならERROR_EXTRACT確認。品質弱いならQUALITY_SUMMARYのFAIL_ROWS確認。
