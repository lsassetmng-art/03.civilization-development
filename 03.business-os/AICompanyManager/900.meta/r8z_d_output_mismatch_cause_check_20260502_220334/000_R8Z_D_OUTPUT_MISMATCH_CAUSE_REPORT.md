# AICompanyManager R8Z-D output mismatch cause check

## Current symptom
- Manager大項目サマリ shows completed/decomposed = 1
- Leader以降の出力 panel shows:
  - Leader中項目 = 0
  - 成果物要件 = 0
  - Worker作業単位 = 0

## Purpose
Determine whether the issue is:
A. DB child rows were not created
B. child rows exist but context/API/UI does not expose them

## Outputs
- node_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/010_node_check.log
- db_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/020_db_child_and_view_check.log
- context_json: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/030_context.json
- context_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/050_context_check.log
- server_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/060_server_scan.log
- core_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/070_core_scan.log
- latest_r8zd: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_d_output_mismatch_cause_check_20260502_220334/080_latest_r8zd_files.log

## Next decision
1. If DB table/view counts are 0:
   - fix server route transaction/insert logic, because child rows were not created.
2. If DB counts are >0 but context counts are 0:
   - fix context route JSON keys / view aggregation.
3. If context counts are >0 but UI panel is 0:
   - fix core output panel filtering/rendering.
