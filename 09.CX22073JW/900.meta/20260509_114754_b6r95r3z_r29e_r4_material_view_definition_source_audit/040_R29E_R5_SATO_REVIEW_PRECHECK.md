# R29E-R5 Sato Review Precheck

佐藤レビュー対象:
- Material元テーブルに正規識別子列を追加する設計
- 新canonical view設計
- 旧view差し替え順序
- 旧view DROP条件

確認ポイント:
1. 参照先マスタを view ではなく実テーブルにすること
2. FK対象を model_public_registry(registry_code) にするか、model_public_registry の model_no / model_code に別uniqueを追加するか
3. public型番 BYD2-003 と runtime code byd2_003_asic_leader3 を混ぜないこと
4. Material旧値は legacy_material_model_code として残し、破壊更新しないこと
5. 旧viewは依存0確認後にのみDROPすること
6. CASCADE DROP禁止
7. AICMには触らないこと
