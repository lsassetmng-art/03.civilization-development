# AICompanyManager C1F server revive crash log report

## Result

FINAL_STATUS=C1F_SERVER_REVIVE_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=NO
- SERVER_PATCH=NO
- SERVER_RESTART=YES

## Checks

- core node --check: PASS
- server node --check: PASS
- HTTP_CODE=200
- SERVER_PID=28114

## Files

- CORE_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c1f_server_revive_crash_log_20260504_175030/010_core_node_check.txt
- SERVER_CHECK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c1f_server_revive_crash_log_20260504_175030/020_server_node_check.txt
- BEFORE_PROC=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c1f_server_revive_crash_log_20260504_175030/030_before_process.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c1f_server_revive_crash_log_20260504_175030/040_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c1f_server_revive_crash_log_20260504_175030/050_http_out.html
- AFTER_PROC=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c1f_server_revive_crash_log_20260504_175030/060_after_process.txt

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_c1f_server_revive_20260504_175030

## Next

ブラウザで部門別タスク台帳を開き、C1F画面を確認する。
描画エラーが出た場合は、スクショまたはエラーメッセージを貼る。
サーバーが再度落ちた場合は SERVER_LOG を確認する。

