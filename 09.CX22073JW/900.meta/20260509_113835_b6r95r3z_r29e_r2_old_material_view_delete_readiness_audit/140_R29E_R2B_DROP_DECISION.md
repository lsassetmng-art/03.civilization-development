# R29E-R2B Old Material View Drop Decision

RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_113835_b6r95r3z_r29e_r2_old_material_view_delete_readiness_audit

## Decision
OLD_VIEW_DROP_NOT_READY

## Counts
DB_DO_NOT_DROP_HITS=4
DB_DELETE_CANDIDATE_HITS=0
LIVE_CODE_HITS_EXCLUDING_900_META=5

## Meaning
- DB_DO_NOT_DROP_HITS が 1以上なら、DB依存が残っているので旧view削除不可。
- LIVE_CODE_HITS_EXCLUDING_900_META が 1以上なら、server/code参照が残っているので旧view削除不可。
- 両方0なら、旧viewは削除候補。ただし、Material正規列追加、新canonical view作成、provider切替、E2E品質PASS、佐藤レビュー、ボス明示GO後にDROP。

## Next
- DROP_READYなら、次は Material元テーブル正規列追加 + canonical view作成SQL案。
- DROP_NOT_READYなら、旧view参照元を先に潰す。
