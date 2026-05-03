# Next patch plan: Phase AKJ-AKM

## Goal

本番 index.html から debug-only surfaces を外す。
coupled files は core/debug分離してから外す。

## Next safe sequence

1. Review /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_ui_debug_surface_purge_inventory_20260430_071150/110_SCRIPT_DEBUG_PRODUCTION_CLASSIFICATION.tsv
2. For debug_only_candidate:
   - comment out script line in index.html with rollback marker
   - keep JS file on disk
3. For coupled_debug_and_production:
   - do not disable from index
   - split file:
     - production core remains active
     - debug-card/debug-panel moved to debug-only file
4. Verify no white screen
5. Verify AI企業選択 / AI企業を表示 / AI企業設定 still works

## Review files

ACTIVE_SCRIPTS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_ui_debug_surface_purge_inventory_20260430_071150/100_ACTIVE_INDEX_SCRIPTS.txt
SCRIPT_CLASSIFICATION=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_ui_debug_surface_purge_inventory_20260430_071150/110_SCRIPT_DEBUG_PRODUCTION_CLASSIFICATION.tsv
DEBUG_SURFACE_HITS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_ui_debug_surface_purge_inventory_20260430_071150/120_DEBUG_SURFACE_HITS.txt
COUPLED_SCRIPT_HITS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_ui_debug_surface_purge_inventory_20260430_071150/130_COUPLED_DEBUG_PRODUCTION_HITS.txt
PURGE_PLAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_ui_debug_surface_purge_inventory_20260430_071150/200_PRODUCTION_DEBUG_PURGE_PLAN.md
