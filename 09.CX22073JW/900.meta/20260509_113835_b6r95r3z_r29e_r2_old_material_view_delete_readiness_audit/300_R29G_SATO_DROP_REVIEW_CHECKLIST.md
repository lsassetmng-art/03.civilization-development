# R29G 佐藤レビュー チェックリスト: 旧Material view削除

## 削除候補
- aiworker.vw_robot_readable_brain_runtime_material_v1
- aiworker.vw_robot_readable_brain_runtime_material_v2
- aiworker.vw_robot_readable_brain_runtime_material_v3
- aiworker.vw_robot_brain_runtime_material_quality_overlay_v1

## 削除前条件
- 新canonical viewが存在する
- Material元テーブルに正規列が存在する
  - registry_code
  - public_model_no
  - runtime_model_code
  - legacy_material_model_code
- registry_code が aiworker.model_public_registry(registry_code) と整合する
- AIWorkerOS runtime provider が新canonical viewを参照している
- 旧viewへのDB view依存が0
- 旧viewへのfunction source参照が0
- server.js / bridge / sql / docs のlive参照が0
- E2E zip品質ゲートがPASS
- dropは明示GO後のみ

## 禁止
- CASCADEで雑に消す
- 依存が残っている状態でDROP
- AICM側補正
- server.js個別alias復活
