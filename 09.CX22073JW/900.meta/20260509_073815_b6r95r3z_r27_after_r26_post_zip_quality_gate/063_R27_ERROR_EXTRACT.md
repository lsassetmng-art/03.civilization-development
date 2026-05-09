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
