# AXU-CSV-MAINT-R5B render marker shape diagnostic

PATCH=NO
CORE_CHANGE=NO
DB_WRITE=NO

OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5b_render_marker_shape_diag_20260502_072102/010_render_marker_shape.txt

判断:
- REGEX_FUNCTION_RENDER_HELPER_COUNT=2
  → 旧render helperだけ削除可能
- REGEX_FUNCTION_RENDER_HELPER_COUNT=1
  → 関数重複は解消済み。marker残骸だけ見る
- REGEX_FUNCTION_RENDER_HELPER_COUNT=0
  → markerだけ残っているか、関数形が壊れている。削除前に周辺行を見る
