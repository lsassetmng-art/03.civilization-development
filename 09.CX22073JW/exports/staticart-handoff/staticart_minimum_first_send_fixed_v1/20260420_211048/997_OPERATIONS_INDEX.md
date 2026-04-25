# ============================================================
# STATICART OPERATIONS INDEX
# ============================================================

generated_at: 20260420_225018
run_code: staticart_resume_pack_20260420_225018

## 1. Master Status

- certificate_code: staticart_final_completion_20260420_224105
- certificate_status: partial
- release_code: staticart_minimum_first_send_fixed_v1
- release_status: blocked
- export_code: staticart_handoff_20260420_211048
- export_status: done
- package_code: staticart_final_handoff_20260420_222944
- package_status: partial
- closeout_run_code: staticart_delivery_closeout_20260420_124523

## 2. Core Files

- 000_README.md
- 010_manifest.json
- 020_release_summary.json
- 030_targets.jsonl
- 040_payload_contracts.jsonl
- 050_top_level_contracts.jsonl
- 060_blocked_targets.jsonl
- 070_targets.tsv
- 080_payload_contracts.tsv
- 090_top_level_contracts.tsv
- 991_FILE_INDEX.tsv
- 992_SHA256SUMS.txt
- 993_DB_SUMMARY.json
- 994_PACKAGE_MANIFEST.json
- 995_FINAL_COMPLETION_CERTIFICATE.md
- 996_HANDOFF_REENTRY_INDEX.md
- 997_OPERATIONS_INDEX.md
- 998_RESUME_CONTEXT.json
- 999_FINAL_DELIVERY_CLOSEOUT.md

## 3. Recommended Restart Order

1. 995_FINAL_COMPLETION_CERTIFICATE.md
2. 996_HANDOFF_REENTRY_INDEX.md
3. 999_FINAL_DELIVERY_CLOSEOUT.md
4. 994_PACKAGE_MANIFEST.json
5. 010_manifest.json
6. 020_release_summary.json
7. 030_targets.jsonl
8. 040_payload_contracts.jsonl
9. 050_top_level_contracts.jsonl

## 4. DB-side Anchors

- cx22073jw.v_staticart_delivery_master_status
- cx22073jw.v_staticart_resume_pack_summary
- cx22073jw.v_staticart_final_handoff_package_summary
- cx22073jw.v_staticart_delivery_closeout_summary
- cx22073jw.v_staticart_handoff_export_batch_summary
- cx22073jw.v_staticart_fixed_contract_release_summary

## 5. Note

Delivery artifacts are present, but some release conditions remain partial or blocked.
