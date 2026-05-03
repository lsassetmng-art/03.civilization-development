# Next patch plan: Phase AKN-AKQ

## Goal

本番UIに表示される debug surface を消す。

## Input

VISIBLE_DEBUG_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_visible_debug_surface_inventory_20260430_071415/120_VISIBLE_DEBUG_SUMMARY.tsv
VISIBLE_DEBUG_BLOCKS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_visible_debug_surface_inventory_20260430_071415/110_VISIBLE_DEBUG_BLOCKS.txt

## Patch target selection

優先順位:
1. BusinessOS DB 会社バインドカード
2. 会社ID/DB確認カード
3. payload preview/debug card
4. smoke/test/rescue/diagnostic panel

## Patch method

- target function/block のみ修正
- dev flag gate を追加:
  window.AICM_DEV_DEBUG_SURFACE_ENABLED === true の場合だけ描画
- default false
- production index.html は何も表示しない
- state/binding/helper処理は残す

## Verify

- No white screen
- AI企業選択が動く
- AI企業を表示が動く
- AI企業設定が動く
- BusinessOS DB 会社バインドカードが表示されない
