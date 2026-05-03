# AICompanyManager R8Z-O production summary UI report

## Result
- final_status: R8Z_O_PRODUCTION_SUMMARY_UI_DONE_REVIEW_REQUIRED
- core_file_write: YES
- server_file_write: NO
- db_write: NO
- api_post: NO
- persistent_db_write: NO
- physical_delete: NO

## What changed
- 部門別タスク台帳の上部サマリを本番向けに統合。
- 未引き継ぎ / 自動処理待ち / 分解済み / Worker実行中 / レビュー待ち / 削除済みをサマリ化。
- 件数カード押下で分類別詳細を確認。
- Leader以降自動処理カード、成果物要件 / Worker作業単位の大型検証カードは通常表示から除外。
- request_id / source_request_ref / updated_at などの開発者情報は通常サマリに出さない。

## Verification
- node --check core/server: PASS
- served core marker check: PASS

## Open URL
http://127.0.0.1:8794/?v=r8z_o_20260502_231710
