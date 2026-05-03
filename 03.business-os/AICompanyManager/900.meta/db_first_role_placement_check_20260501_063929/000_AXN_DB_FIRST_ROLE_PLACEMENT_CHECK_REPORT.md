# AICompanyManager AXN-DB-FIRST role placement DB check

## Result
- DB_READ_ONLY=YES
- DB_WRITE=NO
- API_POST=NO
- PATCH=NO

## Files
- OUT_FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/db_first_role_placement_check_20260501_063929/010_db_role_placement_check.txt

## Quick indicators
- ACTIVE_TEXT_HIT_COUNT=20
- PRESIDENT_TEXT_HIT_COUNT=9

## Judgement guide
1. If active President placement exists:
   - DB保存は成功。
   - 次は UI readback / context mapping / select prefill を確認。

2. If only archived placement exists:
   - archive は動いているが insert が残っていない。
   - syncRoleSettings の insert / transaction / response を確認。

3. If no placement exists:
   - 「保存された」表示が main update の成功だけを見ていて、role sync は失敗または未実行。
   - server log / sync endpoint / client payload を確認。
