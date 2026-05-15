# B6R96R1I3S decision guide

## 状態

前回の B6R96R1I3 は STEP 8 latest logs grep で終了しました。
この I3S は POSTを追加せず、既存のHTTP500証跡を回収しています。

## 次に見るファイル

- Parsed response:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_113304_b6r96r1i3s_salvage_http500_collect_no_post/out/010_parsed_response.txt

- Safe error grep:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_113304_b6r96r1i3s_salvage_http500_collect_no_post/out/040_recent_error_log_grep_safe.txt

- Key hints:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_113304_b6r96r1i3s_salvage_http500_collect_no_post/out/050_key_hints.txt

- Source route windows:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_113304_b6r96r1i3s_salvage_http500_collect_no_post/out/030_request_route_and_db_windows.txt

- DB function dump:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_113304_b6r96r1i3s_salvage_http500_collect_no_post/out/030_runtime_request_function_dump.txt

## 判断

### 1. responseにSQLエラーがある場合
DB関数またはserver payload mappingの問題。
requester_delivery_payload以前にruntime request作成を直す。

### 2. responseにauth/permissionがある場合
認証ヘッダまたはtoken設定を見る。

### 3. responseに古いserver挙動がある場合
8787プロセスがpatch前の古いserverで動いている可能性。
安全に停止/再起動して再POST。

### 4. routeが500専用error responseで返っている場合
まず500を直す。
その後、error responseにもblocking_reportを含めるか検討。

## 境界

- POST追加なし
- DB writeなし
- patchなし
- pushなし
