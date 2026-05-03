# AICompanyManager Phase ACI-ACL
# Company settings white screen diagnostic

generated_at: 2026-04-29 20:55:31 +0900

## Scope

- Target: 03.business-os / AICompanyManager
- Symptom: AI企業設定 -> 遷移先で白画面
- DB_WRITE: NOT_EXECUTED
- API_SAVE: NOT_EXECUTED
- RLS_APPLY: NOT_EXECUTED
- DELETE: NOT_EXECUTED
- Python: NOT_USED
- Purpose: routing / display:none / JS runtime syntax / handler conflict / MutationObserver の切り分け

## Main paths

- APP_ROOT: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager`
- INDEX_HTML: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html`
- JS_DIR: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js`
- SERVER_DIR: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server`



## 1. Path existence

```
total 115
drwx------.  14 u0_a402 u0_a402  3452 Apr 29 20:55 .
drwx------.  21 u0_a402 u0_a402  3452 Apr 29 06:36 ..
-rw-------.   1 u0_a402 u0_a402    20 Apr 27 06:10 .gitignore
drwx------.   3 u0_a402 u0_a402  3452 Apr 29 20:55 900.meta
drwx------.   9 u0_a402 u0_a402  3452 Apr 25 13:34 _commonos
drwx------.   5 u0_a402 u0_a402  3452 Apr 28 17:09 assets
drwx------.   3 u0_a402 u0_a402  3452 Apr 27 09:42 backend-api
drwx------.  34 u0_a402 u0_a402  8192 Apr 27 08:00 backup
drwx------.   5 u0_a402 u0_a402  8192 Apr 28 06:45 docs
-rw-------.   1 u0_a402 u0_a402  3037 Apr 29 18:05 index.html
-rw-------.   1 u0_a402 u0_a402  1186 Apr 27 14:19 local-static-server.js
drwx------. 120 u0_a402 u0_a402 20480 Apr 27 12:01 logs
drwx------.   2 u0_a402 u0_a402  3452 Apr 29 11:54 server
drwx------.   2 u0_a402 u0_a402  3452 Apr 25 16:57 server-routes
drwx------.  10 u0_a402 u0_a402  3452 Apr 25 16:57 src
drwx------.   2 u0_a402 u0_a402 45056 Apr 29 18:05 tests
drwx------.   2 u0_a402 u0_a402  3452 Apr 25 18:50 tools
```


## 2. Local UI server / port / curl check

