# AICompanyManager server restart only report

FINAL_STATUS=SERVER_RESTART_ONLY_DONE_REVIEW_REQUIRED

## Scope

- DB_WRITE=NO
- API_POST=NO
- CORE_PATCH=NO
- SERVER_PATCH=NO
- SERVER_RESTART=YES
- PORT=8794

## Checks

- core node --check: PASS
- server node --check: PASS
- root HTTP: 200

## Files

- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_server_restart_only_20260504_170811/010_server.log
- CHECK_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_server_restart_only_20260504_170811/020_core_node_check.txt
- CHECK_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_server_restart_only_20260504_170811/030_server_node_check.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_server_restart_only_20260504_170811/040_http_check.txt
- PROC_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_server_restart_only_20260504_170811/050_process_check.txt

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c1b_server_restart_20260504_170811

