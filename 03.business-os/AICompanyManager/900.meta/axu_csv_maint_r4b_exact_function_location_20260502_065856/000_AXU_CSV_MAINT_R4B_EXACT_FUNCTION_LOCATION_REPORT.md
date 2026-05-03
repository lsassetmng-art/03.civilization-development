# AXU-CSV-MAINT-R4B exact function location

PATCH=NO
CORE_CHANGE=NO
DB_WRITE=NO

OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r4b_exact_function_location_20260502_065856/010_exact_function_location.txt

次に見ること:
- FUNCTION_RENDER_HELPER_COUNT が 1 なら、R4の検証側誤判定。
- FUNCTION_RENDER_HELPER_COUNT が 2以上なら、重複整理が必要。
- FUNCTION_RENDER_HELPER_COUNT が 0 で TEXT_RENDER_HELPER_COUNT があるなら、文字列/壊れた挿入の疑い。
