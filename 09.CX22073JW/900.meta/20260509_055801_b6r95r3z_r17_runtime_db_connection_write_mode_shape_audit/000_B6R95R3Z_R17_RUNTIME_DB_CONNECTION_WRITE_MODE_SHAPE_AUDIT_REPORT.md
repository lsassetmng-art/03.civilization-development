# B6R95R3Z-R17 Runtime DB Connection Write-mode Shape Audit Report

RUN_TS=20260509_055801
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_055801_b6r95r3z_r17_runtime_db_connection_write_mode_shape_audit

## Declaration
- DB_WRITE=NO
- FILE_WRITE=YES
- API_POST=NO
- HTTP_GET=NO
- PATCH=NO
- GIT_PUSH=NO
- AICM_TOUCH=NO
- SECRET_OUTPUT=NO

## DB session default
```
            section             | transaction_read_only | default_transaction_read_only | session_replication_role | database_name | db_user  |                server_addr                 | server_port | pg_is_in_recovery 
--------------------------------+-----------------------+-------------------------------+--------------------------+---------------+----------+--------------------------------------------+-------------+-------------------
 01_session_default_without_set | off                   | off                           | origin                   | postgres      | postgres | 2406:da12:b78:de00:8528:d827:b2b0:d897/128 |        5432 | f
(1 row)

BEGIN
              section              | transaction_read_only | default_transaction_read_only 
-----------------------------------+-----------------------+-------------------------------
 02_inside_plain_begin_without_set | off                   | off
(1 row)

ROLLBACK
                            section                             |                                   note                                   
----------------------------------------------------------------+--------------------------------------------------------------------------
 03_runtime_create_function_can_be_called_only_in_write_session | No function call executed here. This audit only checks session defaults.
(1 row)

```

## Env/url shape
```
============================================================
ENV AND URL SHAPE AUDIT
============================================================
CURRENT_SHELL_ENV_SHAPE_BEGIN
DATABASE_URL_PRESENT=YES
DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
DATABASE_URL_DDL_PRESENT=YES
DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
PERSONA_DATABASE_URL_PRESENT=YES
PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
PERSONA_DATABASE_URL_DDL_PRESENT=NO
AIWORKEROS_DATABASE_URL_PRESENT=NO
AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
PGDATABASE_PRESENT=NO
PGHOST_PRESENT=NO
PGPORT_PRESENT=NO
PGUSER_PRESENT=NO
PGPASSWORD_PRESENT=NO
PGOPTIONS_PRESENT=NO
NODE_ENV_PRESENT=NO
AIWORKEROS_BASE_URL_PRESENT=YES
PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
CURRENT_SHELL_ENV_SHAPE_END
RUNTIME_PROCESS_ENV_SHAPE_BEGIN
RUNTIME_SERVER_PROCESS_COUNT=2
--- PID 11659 ---
CMD=node /data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js 
PID_11659_ENV_SHAPE_BEGIN
DATABASE_URL_PRESENT=YES
DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
DATABASE_URL_DDL_PRESENT=YES
DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
PERSONA_DATABASE_URL_PRESENT=YES
PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
PERSONA_DATABASE_URL_DDL_PRESENT=NO
AIWORKEROS_DATABASE_URL_PRESENT=NO
AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
PGDATABASE_PRESENT=NO
PGHOST_PRESENT=NO
PGPORT_PRESENT=NO
PGUSER_PRESENT=NO
PGPASSWORD_PRESENT=NO
PGOPTIONS_PRESENT=NO
NODE_ENV_PRESENT=NO
AIWORKEROS_BASE_URL_PRESENT=YES
PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
PID_11659_ENV_SHAPE_END
--- PID 16843 ---
CMD=node /data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_055801_b6r95r3z_r17_runtime_db_connection_write_mode_shape_audit/120_env_and_url_shape_audit.mjs /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js 
PID_16843_ENV_SHAPE_BEGIN
DATABASE_URL_PRESENT=YES
DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
DATABASE_URL_DDL_PRESENT=YES
DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
PERSONA_DATABASE_URL_PRESENT=YES
PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
PERSONA_DATABASE_URL_DDL_PRESENT=NO
AIWORKEROS_DATABASE_URL_PRESENT=NO
AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
PGDATABASE_PRESENT=NO
PGHOST_PRESENT=NO
PGPORT_PRESENT=NO
PGUSER_PRESENT=NO
PGPASSWORD_PRESENT=NO
PGOPTIONS_PRESENT=NO
NODE_ENV_PRESENT=NO
AIWORKEROS_BASE_URL_PRESENT=YES
PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
PID_16843_ENV_SHAPE_END
RUNTIME_PROCESS_ENV_SHAPE_END
FINAL_STATUS=ENV_AND_URL_SHAPE_AUDIT_DONE
```

## Server DB source
```
============================================================
SERVER DB CONNECTION SOURCE AUDIT
============================================================
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
BRIDGE_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/brain-context-bridge.js
SERVER_DB_RELEVANT_CONTEXT_BEGIN
--- hit line 192 ---
  182:   }
  183: 
  184:   return out;
  185: }
  186: // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_END
  187: 
  188: 
  189: const http = require("http");
  190: const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
  191: const { URL } = require("url");
  192: const { spawnSync } = require("child_process");
  193: const fs = require("fs");
  194: const path = require("path");
  195: 
  196: const appRoot = __dirname;
  197: const envFile = path.join(appRoot, ".env.local");
  198: 
  199: function loadDotEnv(filePath) {
  200:   if (!fs.existsSync(filePath)) return;
  201:   const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  202:   for (const line of lines) {
--- hit line 222 ---
  212: }
  213: 
  214: loadDotEnv(envFile);
  215: 
  216: const port = Number(process.env.PERSONA_AIWORKEROS_PORT || "8787");
  217: const authToken = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN;
  218: if (!authToken) {
  219:   console.error("ERROR: PERSONA_AIWORKEROS_AUTH_TOKEN is required");
  220:   process.exit(1);
  221: }
  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
  223: 
  224: if (!databaseUrl) {
  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
  226:   process.exit(1);
  227: }
  228: 
  229: function sendJson(res, status, payload) {
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
--- hit line 224 ---
  214: loadDotEnv(envFile);
  215: 
  216: const port = Number(process.env.PERSONA_AIWORKEROS_PORT || "8787");
  217: const authToken = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN;
  218: if (!authToken) {
  219:   console.error("ERROR: PERSONA_AIWORKEROS_AUTH_TOKEN is required");
  220:   process.exit(1);
  221: }
  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
  223: 
  224: if (!databaseUrl) {
  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
  226:   process.exit(1);
  227: }
  228: 
  229: function sendJson(res, status, payload) {
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  233:   } catch (_b6r44gR4Error) {
  234:     // Keep sendJson stable for non-runtime payloads.
--- hit line 225 ---
  215: 
  216: const port = Number(process.env.PERSONA_AIWORKEROS_PORT || "8787");
  217: const authToken = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN;
  218: if (!authToken) {
  219:   console.error("ERROR: PERSONA_AIWORKEROS_AUTH_TOKEN is required");
  220:   process.exit(1);
  221: }
  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
  223: 
  224: if (!databaseUrl) {
  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
  226:   process.exit(1);
  227: }
  228: 
  229: function sendJson(res, status, payload) {
  230:   // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  231:   try {
  232:     payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  233:   } catch (_b6r44gR4Error) {
  234:     // Keep sendJson stable for non-runtime payloads.
  235:   }
--- hit line 273 ---
  263: }
  264: 
  265: function normalizeLimit(value) {
  266:   const n = Number(value || "20");
  267:   if (!Number.isFinite(n)) return 20;
  268:   return Math.max(1, Math.min(100, Math.floor(n)));
  269: }
  270: 
  271: /**
  272:  * IMPORTANT:
  273:  * Do not pass SQL using `psql -c` here.
  274:  * In the previous version, psql variables like :'app_surface_code'
  275:  * were not substituted and were sent to PostgreSQL as-is.
  276:  *
  277:  * This fixed version passes SQL via stdin.
  278:  */
  279: function psqlJson(sql, vars = {}) {
  280:   const args = [
  281:     databaseUrl,
  282:     "-X",
  283:     "-A",
--- hit line 274 ---
  264: 
  265: function normalizeLimit(value) {
  266:   const n = Number(value || "20");
  267:   if (!Number.isFinite(n)) return 20;
  268:   return Math.max(1, Math.min(100, Math.floor(n)));
  269: }
  270: 
  271: /**
  272:  * IMPORTANT:
  273:  * Do not pass SQL using `psql -c` here.
  274:  * In the previous version, psql variables like :'app_surface_code'
  275:  * were not substituted and were sent to PostgreSQL as-is.
  276:  *
  277:  * This fixed version passes SQL via stdin.
  278:  */
  279: function psqlJson(sql, vars = {}) {
  280:   const args = [
  281:     databaseUrl,
  282:     "-X",
  283:     "-A",
  284:     "-t",
--- hit line 279 ---
  269: }
  270: 
  271: /**
  272:  * IMPORTANT:
  273:  * Do not pass SQL using `psql -c` here.
  274:  * In the previous version, psql variables like :'app_surface_code'
  275:  * were not substituted and were sent to PostgreSQL as-is.
  276:  *
  277:  * This fixed version passes SQL via stdin.
  278:  */
  279: function psqlJson(sql, vars = {}) {
  280:   const args = [
  281:     databaseUrl,
  282:     "-X",
  283:     "-A",
  284:     "-t",
  285:     "-v",
  286:     "ON_ERROR_STOP=1"
  287:   ];
  288: 
  289:   for (const [key, value] of Object.entries(vars)) {
--- hit line 281 ---
  271: /**
  272:  * IMPORTANT:
  273:  * Do not pass SQL using `psql -c` here.
  274:  * In the previous version, psql variables like :'app_surface_code'
  275:  * were not substituted and were sent to PostgreSQL as-is.
  276:  *
  277:  * This fixed version passes SQL via stdin.
  278:  */
  279: function psqlJson(sql, vars = {}) {
  280:   const args = [
  281:     databaseUrl,
  282:     "-X",
  283:     "-A",
  284:     "-t",
  285:     "-v",
  286:     "ON_ERROR_STOP=1"
  287:   ];
  288: 
  289:   for (const [key, value] of Object.entries(vars)) {
  290:     args.push("-v", `${key}=${value === null || value === undefined ? "" : String(value)}`);
  291:   }
--- hit line 293 ---
  283:     "-A",
  284:     "-t",
  285:     "-v",
  286:     "ON_ERROR_STOP=1"
  287:   ];
  288: 
  289:   for (const [key, value] of Object.entries(vars)) {
  290:     args.push("-v", `${key}=${value === null || value === undefined ? "" : String(value)}`);
  291:   }
  292: 
  293:   const result = spawnSync("psql", args, {
  294:     input: sql,
  295:     encoding: "utf8",
  296:     maxBuffer: 1024 * 1024 * 20
  297:   });
  298: 
  299:   if (result.status !== 0) {
  300:     const message = result.stderr || result.stdout || "psql failed";
  301:     const err = new Error(message.trim());
  302:     err.stderr = result.stderr;
  303:     err.stdout = result.stdout;
--- hit line 300 ---
  290:     args.push("-v", `${key}=${value === null || value === undefined ? "" : String(value)}`);
  291:   }
  292: 
  293:   const result = spawnSync("psql", args, {
  294:     input: sql,
  295:     encoding: "utf8",
  296:     maxBuffer: 1024 * 1024 * 20
  297:   });
  298: 
  299:   if (result.status !== 0) {
  300:     const message = result.stderr || result.stdout || "psql failed";
  301:     const err = new Error(message.trim());
  302:     err.stderr = result.stderr;
  303:     err.stdout = result.stdout;
  304:     err.status = result.status;
  305:     throw err;
  306:   }
  307: 
  308:   const text = (result.stdout || "").trim();
  309:   if (!text) return null;
  310: 
--- hit line 319 ---
  309:   if (!text) return null;
  310: 
  311:   try {
  312:     return JSON.parse(text);
  313:   } catch (e) {
  314:     throw new Error(`Failed to parse DB JSON: ${text}`);
  315:   }
  316: }
  317: 
  318: function endpointReady() {
  319:   return psqlJson(`
  320:     select coalesce(to_jsonb(t), '{}'::jsonb)::text
  321:     from (
  322:       select *
  323:       from aiworker.vw_app_aiworker_runtime_execution_endpoint_ready_v1
  324:     ) t;
  325:   `);
  326: }
  327: 
  328: function apiContracts() {
  329:   return psqlJson(`
--- hit line 329 ---
  319:   return psqlJson(`
  320:     select coalesce(to_jsonb(t), '{}'::jsonb)::text
  321:     from (
  322:       select *
  323:       from aiworker.vw_app_aiworker_runtime_execution_endpoint_ready_v1
  324:     ) t;
  325:   `);
  326: }
  327: 
  328: function apiContracts() {
  329:   return psqlJson(`
  330:     select coalesce(jsonb_agg(to_jsonb(t) order by sort_order), '[]'::jsonb)::text
  331:     from (
  332:       select *
  333:       from aiworker.vw_app_aiworker_runtime_execution_api_contract_v1
  334:     ) t;
  335:   `);
  336: }
  337: 
  338: function persistentSmoke() {
  339:   return psqlJson(`
--- hit line 339 ---
  329:   return psqlJson(`
  330:     select coalesce(jsonb_agg(to_jsonb(t) order by sort_order), '[]'::jsonb)::text
  331:     from (
  332:       select *
  333:       from aiworker.vw_app_aiworker_runtime_execution_api_contract_v1
  334:     ) t;
  335:   `);
  336: }
  337: 
  338: function persistentSmoke() {
  339:   return psqlJson(`
  340:     select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text
  341:     from (
  342:       select *
  343:       from aiworker.vw_app_aiworker_runtime_execution_persistent_smoke_board_v1
  344:     ) t;
  345:   `);
  346: }
  347: 
  348: function pipelineBoard(query) {
  349:   return psqlJson(`
--- hit line 349 ---
  339:   return psqlJson(`
  340:     select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text
  341:     from (
  342:       select *
  343:       from aiworker.vw_app_aiworker_runtime_execution_persistent_smoke_board_v1
  344:     ) t;
  345:   `);
  346: }
  347: 
  348: function pipelineBoard(query) {
  349:   return psqlJson(`
  350:     select coalesce(jsonb_agg(to_jsonb(t) order by request_created_at desc), '[]'::jsonb)::text
  351:     from (
  352:       select p.*, rr.source_route_code
  353:       from aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1 p
  354:       left join aiworker.runtime_execution_request rr
  355:         on rr.request_id = p.request_id
  356:       where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
  357:         and (nullif(:'request_code','') is null or p.request_code = :'request_code')
  358:         and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
  359:       order by p.request_created_at desc
--- hit line 371 ---
  361:     ) t;
  362:   `, {
  363:     request_id: query.get("request_id") || "",
  364:     request_code: query.get("request_code") || "",
  365:     app_surface_code: query.get("app_surface_code") || "",
  366:     limit: normalizeLimit(query.get("limit"))
  367:   });
  368: }
  369: 
  370: function appReadPayload(query) {
  371:   return psqlJson(`
  372:     select coalesce(jsonb_agg(to_jsonb(t) order by request_created_at desc), '[]'::jsonb)::text
  373:     from (
  374:       select p.*, rr.source_route_code
  375:       from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
  376:       left join aiworker.runtime_execution_request rr
  377:         on rr.request_id = p.request_id
  378:       where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
  379:         and (nullif(:'request_code','') is null or p.request_code = :'request_code')
  380:         and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
  381:       order by p.request_created_at desc
--- hit line 393 ---
  383:     ) t;
  384:   `, {
  385:     request_id: query.get("request_id") || "",
  386:     request_code: query.get("request_code") || "",
  387:     app_surface_code: query.get("app_surface_code") || "",
  388:     limit: normalizeLimit(query.get("limit"))
  389:   });
  390: }
  391: 
  392: function deliveryBoard(query) {
  393:   return psqlJson(`
  394:     select coalesce(jsonb_agg(to_jsonb(t) order by created_at desc), '[]'::jsonb)::text
  395:     from (
  396:       select *
  397:       from aiworker.vw_app_aiworker_runtime_delivery_board_v1
  398:       where (nullif(:'request_id','') is null or request_id::text = :'request_id')
  399:         and (nullif(:'request_code','') is null or request_code = :'request_code')
  400:       order by created_at desc
  401:       limit :'limit'
  402:     ) t;
  403:   `, {
--- hit line 425 ---
  415: 
  416:   Canon:
  417:   - This is not AICM-specific.
  418:   - AICM is one consumer among multiple requester apps / OSs.
  419:   - AIWorkerOS creates the deliverable body and first summary.
  420:   - Requester apps store summary_text plus deliverable_ref / deliverable_link.
  421:   - Robot performance differences are represented through robot_context and generation_basis.
  422: 
  423:   Boundary:
  424:   - No external execution.
  425:   - No PG apply.
  426:   - No destructive action.
  427:   - No AICM-side change in this patch.
  428:   - No CX22073JW access-control change in this patch.
  429: */
  430: function aiwB6R95R3R3Text(value) {
  431:   return String(value ?? "").replace(/\r\n/g, "\n").trim();
  432: }
  433: 
  434: function aiwB6R95R3R3OneLine(value, fallback) {
  435:   const text = aiwB6R95R3R3Text(value || fallback || "");
--- hit line 503 ---
  493:     "AIWorkerOS側で生成した一次成果物です。",
  494:     `設定ロボット: ${modelCode}`,
  495:     `役割レイヤー: ${roleLayerCode}`,
  496:     `タスク領域: ${taskDomainCode}`,
  497:     `CX参照深度: ${cxDepthCode}`,
  498:     `CX参照広さ: ${cxBreadthCode}`,
  499:     "今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。"
  500:   ]);
  501: 
  502:   const unresolvedIssues = aiwB6R95R3R3Lines([
  503:     "この段階では外部実行、PG apply、破壊的操作は行っていません。",
  504:     "追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。"
  505:   ]);
  506: 
  507:   const nextSteps = aiwB6R95R3R3Lines([
  508:     "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
  509:     "レビュー画面から成果物本文へ辿れるようにする。",
  510:     "差し戻し時は追加条件をAIWorkerOSへ再依頼する。"
  511:   ]);
  512: 
  513:   const bodyMarkdown = aiwB6R95R3R3Lines([
--- hit line 651 ---
  641: 
  642:   Canon:
  643:   - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  644:   - AIWorkerOS creates summary_text.
  645:   - AIWorkerOS bundles generated artifacts into one deliverable zip.
  646:   - Requester apps display summary_text and link to the zip.
  647:   - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
  648: 
  649:   Boundary:
  650:   - No external execution.
  651:   - No PG apply.
  652:   - No destructive action.
  653:   - No requester-app-specific contract.
  654: */
  655: function aiwB6R95R3D1SafeFilePart(value, fallback) {
  656:   const raw = String(value || fallback || "deliverable").trim();
  657:   const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  658:   return safe || String(fallback || "deliverable");
  659: }
  660: 
  661: function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
--- hit line 976 ---
  966:   for (const key of required) {
  967:     if (!payload[key] || String(payload[key]).trim() === "") {
  968:       const e = new Error(`Missing required field: ${key}`);
  969:       e.httpStatus = 400;
  970:       throw e;
  971:     }
  972:   }
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
  976:   const sql = [
  977:     "with created as (",
  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
  979:     "    :'app_surface_code',",
  980:     "    :'model_code',",
  981:     "    :'task_domain_code',",
  982:     "    :'task_title',",
  983:     "    :'task_instruction_ja',",
  984:     "    :'source_app_ref',",
  985:     "    :'source_request_ref',",
  986:     "    :'requested_by_ref',",
--- hit line 978 ---
  968:       const e = new Error(`Missing required field: ${key}`);
  969:       e.httpStatus = 400;
  970:       throw e;
  971:     }
  972:   }
  973: 
  974:   const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
  975: 
  976:   const sql = [
  977:     "with created as (",
  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
  979:     "    :'app_surface_code',",
  980:     "    :'model_code',",
  981:     "    :'task_domain_code',",
  982:     "    :'task_title',",
  983:     "    :'task_instruction_ja',",
  984:     "    :'source_app_ref',",
  985:     "    :'source_request_ref',",
  986:     "    :'requested_by_ref',",
  987:     "    :'idempotency_key',",
  988:     "    :'source_route_code'",
--- hit line 1063 ---
 1053:     "    )",
 1054:     "  ),",
 1055:     "  'safety', jsonb_build_object(",
 1056:     "    'external_execution_performed_flag', false,",
 1057:     "    'pg_apply_performed_flag', false,",
 1058:     "    'destructive_action_performed_flag', false",
 1059:     "  )",
 1060:     ")::text;",
 1061:   ].join("\n");
 1062: 
 1063:   const responsePayload = psqlJson(sql, {
 1064:     app_surface_code: payload.app_surface_code,
 1065:     model_code: payload.model_code,
 1066:     task_domain_code: payload.task_domain_code,
 1067:     task_title: payload.task_title,
 1068:     task_instruction_ja: payload.task_instruction_ja,
 1069:     source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
 1070:     source_request_ref: payload.source_request_ref || "",
 1071:     source_route_code: sourceRouteCode,
 1072:     requested_by_ref: payload.requested_by_ref || "human",
 1073:     idempotency_key: idempotencyKey,
--- hit line 1100 ---
 1090: }
 1091: 
 1092: const server = http.createServer(async (req, res) => {
 1093:   const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
 1094: 
 1095:   try {
 1096:     if (req.method === "GET" && url.pathname === "/health") {
 1097:       return sendJson(res, 200, {
 1098:         ok: true,
 1099:         service: "aiworker-runtime-execution-http-api",
 1100:         db: "PERSONA_DATABASE_URL",
 1101:         external_execution: false,
 1102:         pg_apply: false,
 1103:         destructive_action: false
 1104:       });
 1105:     }
 1106: 
 1107:     if (!requireAuth(req)) {
 1108:       return sendJson(res, 401, {
 1109:         result: "error",
 1110:         error_code: "UNAUTHORIZED",
SERVER_DB_RELEVANT_CONTEXT_END
BRIDGE_DB_RELEVANT_CONTEXT_BEGIN
--- hit line 1 ---
    1: const { execFileSync } = require("node:child_process");
    2: 
    3: const PROVIDER_VERSION = "lane10-selector-v2";
    4: const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";
    5: 
    6: function valueOf(input, keys, fallback = undefined) {
    7:   if (!input) return fallback;
    8: 
    9:   if (typeof input.get === "function") {
   10:     for (const key of keys) {
   11:       const value = input.get(key);
--- hit line 88 ---
   78: 
   79:   return {
   80:     modelCode: String(modelCode),
   81:     purposeCode: String(purposeCode),
   82:     domainCodes,
   83:     limitPerDomain,
   84:     totalLimit,
   85:   };
   86: }
   87: 
   88: function runPsqlJson(sql) {
   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
   91: 
   92:   const output = execFileSync(
   93:     "psql",
   94:     [
   95:       databaseUrl,
   96:       "-X",
   97:       "-q",
   98:       "-t",
--- hit line 89 ---
   79:   return {
   80:     modelCode: String(modelCode),
   81:     purposeCode: String(purposeCode),
   82:     domainCodes,
   83:     limitPerDomain,
   84:     totalLimit,
   85:   };
   86: }
   87: 
   88: function runPsqlJson(sql) {
   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
   91: 
   92:   const output = execFileSync(
   93:     "psql",
   94:     [
   95:       databaseUrl,
   96:       "-X",
   97:       "-q",
   98:       "-t",
   99:       "-A",
--- hit line 90 ---
   80:     modelCode: String(modelCode),
   81:     purposeCode: String(purposeCode),
   82:     domainCodes,
   83:     limitPerDomain,
   84:     totalLimit,
   85:   };
   86: }
   87: 
   88: function runPsqlJson(sql) {
   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
   91: 
   92:   const output = execFileSync(
   93:     "psql",
   94:     [
   95:       databaseUrl,
   96:       "-X",
   97:       "-q",
   98:       "-t",
   99:       "-A",
  100:       "-v",
--- hit line 92 ---
   82:     domainCodes,
   83:     limitPerDomain,
   84:     totalLimit,
   85:   };
   86: }
   87: 
   88: function runPsqlJson(sql) {
   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
   91: 
   92:   const output = execFileSync(
   93:     "psql",
   94:     [
   95:       databaseUrl,
   96:       "-X",
   97:       "-q",
   98:       "-t",
   99:       "-A",
  100:       "-v",
  101:       "ON_ERROR_STOP=1",
  102:       "-c",
--- hit line 93 ---
   83:     limitPerDomain,
   84:     totalLimit,
   85:   };
   86: }
   87: 
   88: function runPsqlJson(sql) {
   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
   91: 
   92:   const output = execFileSync(
   93:     "psql",
   94:     [
   95:       databaseUrl,
   96:       "-X",
   97:       "-q",
   98:       "-t",
   99:       "-A",
  100:       "-v",
  101:       "ON_ERROR_STOP=1",
  102:       "-c",
  103:       sql,
--- hit line 95 ---
   85:   };
   86: }
   87: 
   88: function runPsqlJson(sql) {
   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
   91: 
   92:   const output = execFileSync(
   93:     "psql",
   94:     [
   95:       databaseUrl,
   96:       "-X",
   97:       "-q",
   98:       "-t",
   99:       "-A",
  100:       "-v",
  101:       "ON_ERROR_STOP=1",
  102:       "-c",
  103:       sql,
  104:     ],
  105:     {
--- hit line 112 ---
  102:       "-c",
  103:       sql,
  104:     ],
  105:     {
  106:       encoding: "utf8",
  107:       maxBuffer: 1024 * 1024 * 32,
  108:       env: process.env,
  109:     }
  110:   ).trim();
  111: 
  112:   if (!output) throw new Error("psql returned empty JSON output");
  113: 
  114:   try {
  115:     return JSON.parse(output);
  116:   } catch (error) {
  117:     throw new Error(`Failed to parse brain-context JSON: ${error.message}\nOUTPUT=${output.slice(0, 2000)}`);
  118:   }
  119: }
  120: 
  121: function buildBrainContext(input = {}) {
  122:   const o = normalizeOptions(input);
--- hit line 124 ---
  114:   try {
  115:     return JSON.parse(output);
  116:   } catch (error) {
  117:     throw new Error(`Failed to parse brain-context JSON: ${error.message}\nOUTPUT=${output.slice(0, 2000)}`);
  118:   }
  119: }
  120: 
  121: function buildBrainContext(input = {}) {
  122:   const o = normalizeOptions(input);
  123: 
  124:   const sql = `
  125: WITH selected AS (
  126:   SELECT *
  127:   FROM ${SELECTOR_FUNCTION}(
  128:     ${sqlText(o.modelCode)},
  129:     ${sqlText(o.purposeCode)},
  130:     ${sqlTextArrayOrNull(o.domainCodes)},
  131:     ${o.limitPerDomain},
  132:     ${o.totalLimit}
  133:   )
  134: ),
--- hit line 211 ---
  201:       )
  202:       ORDER BY d.brain_domain_code
  203:     )
  204:     FROM domain_rows d
  205:   ), '[]'::jsonb),
  206:   'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOS selectorで選抜済み。読取は実行権限ではない。'
  207: )::text
  208: FROM summary;
  209: `;
  210: 
  211:   return runPsqlJson(sql);
  212: }
  213: 
  214: function renderPromptContext(context) {
  215:   const lines = [];
  216:   lines.push("[AIWORKER_BRAIN_CONTEXT]");
  217:   lines.push(`provider=${context.provider || "aiworker-brain-context-provider"}`);
  218:   lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
  219:   lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  220:   lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  221:   lines.push(`model_code=${context.modelCode || ""}`);
BRIDGE_DB_RELEVANT_CONTEXT_END
SERVER_PROCESS_ENV_NAMES_BEGIN
AIWORKEROS_DELIVERABLE_ZIP_DIR
PERSONA_AIWORKEROS_AUTH_TOKEN
PERSONA_AIWORKEROS_PORT
PERSONA_DATABASE_URL
SERVER_PROCESS_ENV_NAMES_END
BRIDGE_PROCESS_ENV_NAMES_BEGIN
AIWORKER_BRAIN_DOMAINS
AIWORKER_BRAIN_LIMIT_PER_DOMAIN
AIWORKER_BRAIN_TOTAL_LIMIT
AIWORKER_MODEL_CODE
AIWORKER_USE_PURPOSE_CODE
PERSONA_DATABASE_URL
BRIDGE_PROCESS_ENV_NAMES_END
SERVER_USES_PERSONA_DATABASE_URL=YES
SERVER_USES_DATABASE_URL=YES
SERVER_USES_AIWORKEROS_DATABASE_URL=NO
SERVER_USES_PGOPTIONS_OR_OPTIONS=NO
DIAGNOSIS=SERVER_HAS_PERSONA_DATABASE_URL_PATH
```

## Summary
```
# Runtime DB Connection Write-mode Shape Summary

## Session default without SET

```
1:            section             | transaction_read_only | default_transaction_read_only | session_replication_role | database_name | db_user  |                server_addr                 | server_port | pg_is_in_recovery 
3: 01_session_default_without_set | off                   | off                           | origin                   | postgres      | postgres | 2406:da12:b78:de00:8528:d827:b2b0:d897/128 |        5432 | f
7:              section              | transaction_read_only | default_transaction_read_only 
9: 02_inside_plain_begin_without_set | off                   | off
13:                            section                             |                                   note                                   
15: 03_runtime_create_function_can_be_called_only_in_write_session | No function call executed here. This audit only checks session defaults.
```

## Current shell / server process DB env shape

```
5:DATABASE_URL_PRESENT=YES
6:DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
7:DATABASE_URL_DDL_PRESENT=YES
8:DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
9:PERSONA_DATABASE_URL_PRESENT=YES
10:PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
11:PERSONA_DATABASE_URL_DDL_PRESENT=NO
12:AIWORKEROS_DATABASE_URL_PRESENT=NO
13:AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
14:AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
15:PGDATABASE_PRESENT=NO
16:PGHOST_PRESENT=NO
17:PGPORT_PRESENT=NO
18:PGUSER_PRESENT=NO
19:PGPASSWORD_PRESENT=NO
20:PGOPTIONS_PRESENT=NO
21:NODE_ENV_PRESENT=NO
22:AIWORKEROS_BASE_URL_PRESENT=YES
23:PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
24:PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
27:RUNTIME_SERVER_PROCESS_COUNT=2
31:DATABASE_URL_PRESENT=YES
32:DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
33:DATABASE_URL_DDL_PRESENT=YES
34:DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
35:PERSONA_DATABASE_URL_PRESENT=YES
36:PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
37:PERSONA_DATABASE_URL_DDL_PRESENT=NO
38:AIWORKEROS_DATABASE_URL_PRESENT=NO
39:AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
40:AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
41:PGDATABASE_PRESENT=NO
42:PGHOST_PRESENT=NO
43:PGPORT_PRESENT=NO
44:PGUSER_PRESENT=NO
45:PGPASSWORD_PRESENT=NO
46:PGOPTIONS_PRESENT=NO
47:NODE_ENV_PRESENT=NO
48:AIWORKEROS_BASE_URL_PRESENT=YES
49:PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
50:PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
55:DATABASE_URL_PRESENT=YES
56:DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
57:DATABASE_URL_DDL_PRESENT=YES
58:DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
59:PERSONA_DATABASE_URL_PRESENT=YES
60:PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
61:PERSONA_DATABASE_URL_DDL_PRESENT=NO
62:AIWORKEROS_DATABASE_URL_PRESENT=NO
63:AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
64:AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
65:PGDATABASE_PRESENT=NO
66:PGHOST_PRESENT=NO
67:PGPORT_PRESENT=NO
68:PGUSER_PRESENT=NO
69:PGPASSWORD_PRESENT=NO
70:PGOPTIONS_PRESENT=NO
71:NODE_ENV_PRESENT=NO
72:AIWORKEROS_BASE_URL_PRESENT=YES
73:PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
74:PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
77:FINAL_STATUS=ENV_AND_URL_SHAPE_AUDIT_DONE
```

## Server DB URL source

```
40:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
43:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
60:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
63:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
81:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
84:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
438:  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
458:  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
502: 1100:         db: "PERSONA_DATABASE_URL",
539:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
540:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
560:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
561:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
581:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
582:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
601:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
602:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
622:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
623:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
642:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
643:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
726:SERVER_PROCESS_ENV_NAMES_BEGIN
730:PERSONA_DATABASE_URL
731:SERVER_PROCESS_ENV_NAMES_END
738:PERSONA_DATABASE_URL
740:SERVER_USES_PERSONA_DATABASE_URL=YES
741:SERVER_USES_DATABASE_URL=YES
742:SERVER_USES_AIWORKEROS_DATABASE_URL=NO
743:SERVER_USES_PGOPTIONS_OR_OPTIONS=NO
744:DIAGNOSIS=SERVER_HAS_PERSONA_DATABASE_URL_PATH
```

## Decision guide

- If SESSION default is off, but server process env URL/PGOPTIONS contains read-only setting: restart/fix server env.
- If SESSION default is on even in fresh psql without SET: PERSONA_DATABASE_URL itself is read-only-shaped or DB/user default is read-only.
- If server uses DATABASE_URL instead of PERSONA_DATABASE_URL, it may be using the wrong env var for this work.
- If no read-only setting is visible, inspect the server DB helper around the generated SQL execution path next.
```

## AICM touch check
```
AICM_BASE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
```

## Runtime touch check
```
AIWORKER_ROOT=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os
```

## Secret scan
```
```
FINAL_STATUS=B6R95R3Z_R17_FRESH_PERSONA_DB_SESSION_IS_READONLY_REVIEW_REQUIRED
NEXT=R18: 結果に応じて server env修正 / DATABASE_URL選択修正 / DB helper詳細監査。まだPOST再試行しない。
