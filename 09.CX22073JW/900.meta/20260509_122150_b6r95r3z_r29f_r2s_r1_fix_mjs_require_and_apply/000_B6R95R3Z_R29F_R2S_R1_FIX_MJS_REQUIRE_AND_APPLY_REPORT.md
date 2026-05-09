# B6R95R3Z-R29F-R2S-R1 Fix MJS Require And Apply Report

FINAL_STATUS=B6R95R3Z_R29F_R2S_R1_FIX_MJS_REQUIRE_AND_APPLY_PASS_REVIEW_REQUIRED
DB_WRITE=YES
FILE_WRITE=YES
API_POST=NO
PATCH=SQL_REPAIR_ONLY
GIT_PUSH=NO
AICM_TOUCH=NO

## Files
- SQL_APPLY=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_122150_b6r95r3z_r29f_r2s_r1_fix_mjs_require_and_apply/030_R29F_R2S_R1_APPLY_EXECUTED.sql
- APPLY_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_122150_b6r95r3z_r29f_r2s_r1_fix_mjs_require_and_apply/031_r29f_r2s_r1_apply.log
- VERIFY_SQL=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_122150_b6r95r3z_r29f_r2s_r1_fix_mjs_require_and_apply/040_r29f_r2s_r1_verify.sql
- VERIFY_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_122150_b6r95r3z_r29f_r2s_r1_fix_mjs_require_and_apply/041_r29f_r2s_r1_verify.log

## Apply key lines
```
3:BEGIN
4:CREATE TABLE
5:INSERT 0 4
6:CREATE TABLE
7:CREATE INDEX
8:CREATE INDEX
9:CREATE INDEX
10:INSERT 0 12
11:INSERT 0 4
12:CREATE VIEW
33:COMMIT
```

## Verify key lines
```
4: verify_01_readonly_guard | on                    | off                           | postgres      | postgres
9: verify_02_canon_table_rows | MODEL                 |        12
10: verify_02_canon_table_rows | SERIES                |         4
15: verify_03_canon_view_byd2_003 |       1723 |            1070 |                653 |        106
24: verify_05_sample_byd2_003_taika_rows | {                                                                                                                                                                                                                                                                                                                                                              +
35:                                      |     "model_code": "byd2_003_asic_leader3",                                                                                                                                                                                                                                                                                                                     +
44:                                      |     "public_model_no": "BYD2-003",                                                                                                                                                                                                                                                                                                                             +
56:                                      |     "runtime_model_code": "byd2_003_asic_leader3",                                                                                                                                                                                                                                                                                                             +
57:                                      |     "safety_boundary_ja": "prompt肥大化を避け、安全境界を残す。",                                                                                                                                                                                                                                                                                              +
73:                                      |     "legacy_material_model_code": "BYD2-003",                                                                                                                                                                                                                                                                                                                  +
82: verify_05_sample_byd2_003_taika_rows | {                                                                                                                                                                                                                                                                                                                                                              +
93:                                      |     "model_code": "byd2_003_asic_leader3",                                                                                                                                                                                                                                                                                                                     +
102:                                      |     "public_model_no": "BYD2-003",                                                                                                                                                                                                                                                                                                                             +
114:                                      |     "runtime_model_code": "byd2_003_asic_leader3",                                                                                                                                                                                                                                                                                                             +
115:                                      |     "safety_boundary_ja": "prompt肥大化を避け、安全境界を残す。",                                                                                                                                                                                                                                                                                              +
131:                                      |     "legacy_material_model_code": "SERIES:Beyond",                                                                                                                                                                                                                                                                                                             +
139: verify_05_sample_byd2_003_taika_rows | {                                                                                                                                                                                                                                                                                                                                                              +
148:                                      |     "model_code": "byd2_003_asic_leader3",                                                                                                                                                                                                                                                                                                                     +
153:                                      |     "unit_title_ja": "material limitでprompt肥大化を防ぐ",                                                                                                                                                                                                                                                                                                     +
157:                                      |     "public_model_no": "BYD2-003",                                                                                                                                                                                                                                                                                                                             +
169:                                      |     "runtime_model_code": "byd2_003_asic_leader3",                                                                                                                                                                                                                                                                                                             +
186:                                      |     "legacy_material_model_code": "BYD2-003",                                                                                                                                                                                                                                                                                                                  +
```
