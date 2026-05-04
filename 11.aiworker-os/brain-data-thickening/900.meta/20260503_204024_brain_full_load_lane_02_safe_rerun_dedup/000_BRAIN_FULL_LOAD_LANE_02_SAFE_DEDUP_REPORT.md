# Brain Full Load Lane 02 Safe Dedup Report

RUN_TS=20260503_204024
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_204024_brain_full_load_lane_02_safe_rerun_dedup
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Cause fixed
- Duplicate source_record_code inside source tables, especially topic_code.
- Row-level ingestion now uses SELECT DISTINCT ON (brain_data_code).

## Important
- No Node patch is used.
- No AICM touch.
- Unknown objects go to backlog.
