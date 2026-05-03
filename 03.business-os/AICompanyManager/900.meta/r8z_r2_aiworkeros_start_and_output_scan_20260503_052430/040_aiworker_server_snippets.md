# AIWorkerOS server route snippets

## Table refs

## Around line 302

  257:     task_domain_code: payload.task_domain_code,
  258:     task_title: payload.task_title,
  259:     task_instruction_ja: payload.task_instruction_ja,
  260:     source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
  261:     source_request_ref: payload.source_request_ref || "",
  262:     requested_by_ref: payload.requested_by_ref || "human",
  263:     idempotency_key: idempotencyKey
  264:   });
  265: }
  266: 
  267: const server = http.createServer(async (req, res) => {
  268:   const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  269: 
  270:   try {
  271:     if (req.method === "GET" && url.pathname === "/health") {
  272:       return sendJson(res, 200, {
  273:         ok: true,
  274:         service: "aiworker-runtime-execution-http-api",
  275:         db: "PERSONA_DATABASE_URL",
  276:         external_execution: false,
  277:         pg_apply: false,
  278:         destructive_action: false
  279:       });
  280:     }
  281: 
  282:     if (!requireAuth(req)) {
  283:       return sendJson(res, 401, {
  284:         result: "error",
  285:         error_code: "UNAUTHORIZED",
  286:         message: "Missing or invalid Authorization bearer token."
  287:       });
  288:     }
  289: 
  290:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/endpoint-ready") {
  291:       return sendJson(res, 200, { result: "ok", data: endpointReady() });
  292:     }
  293: 
  294:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/api-contract") {
  295:       return sendJson(res, 200, { result: "ok", data: apiContracts() });
  296:     }
  297: 
  298:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/persistent-smoke") {
  299:       return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
  300:     }
  301: 
  302:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/pipeline-board") {
  303:       return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
  304:     }
  305: 
  306:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/app-read-payload") {
  307:       return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
  308:     }
  309: 
  310:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/delivery") {
  311:       return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
  312:     }
  313: 
  314:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
  315:       const bodyText = await readBody(req);
  316:       let payload;
  317:       try {
  318:         payload = bodyText ? JSON.parse(bodyText) : {};
  319:       } catch (e) {
  320:         return sendJson(res, 400, {
  321:           result: "error",
  322:           error_code: "INVALID_JSON",
  323:           message: "Request body must be valid JSON."
  324:         });
  325:       }
  326: 
  327:       const idempotencyKey = req.headers["idempotency-key"] || "";
  328:       const result = createRuntimeRequest(payload, idempotencyKey);
  329:       return sendJson(res, 201, result);
  330:     }
  331: 
  332:     return sendJson(res, 404, {
  333:       result: "error",
  334:       error_code: "NOT_FOUND",
  335:       path: url.pathname
  336:     });
  337:   } catch (err) {
  338:     const status = err.httpStatus || 500;
  339:     return sendJson(res, status, {
  340:       result: "error",
  341:       error_code: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR",
  342:       message: err.message,
  343:       safety: {
  344:         external_execution_performed_flag: false,
  345:         pg_apply_performed_flag: false,
  346:         destructive_action_performed_flag: false
  347:       }

## Around line 306

  261:     source_request_ref: payload.source_request_ref || "",
  262:     requested_by_ref: payload.requested_by_ref || "human",
  263:     idempotency_key: idempotencyKey
  264:   });
  265: }
  266: 
  267: const server = http.createServer(async (req, res) => {
  268:   const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  269: 
  270:   try {
  271:     if (req.method === "GET" && url.pathname === "/health") {
  272:       return sendJson(res, 200, {
  273:         ok: true,
  274:         service: "aiworker-runtime-execution-http-api",
  275:         db: "PERSONA_DATABASE_URL",
  276:         external_execution: false,
  277:         pg_apply: false,
  278:         destructive_action: false
  279:       });
  280:     }
  281: 
  282:     if (!requireAuth(req)) {
  283:       return sendJson(res, 401, {
  284:         result: "error",
  285:         error_code: "UNAUTHORIZED",
  286:         message: "Missing or invalid Authorization bearer token."
  287:       });
  288:     }
  289: 
  290:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/endpoint-ready") {
  291:       return sendJson(res, 200, { result: "ok", data: endpointReady() });
  292:     }
  293: 
  294:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/api-contract") {
  295:       return sendJson(res, 200, { result: "ok", data: apiContracts() });
  296:     }
  297: 
  298:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/persistent-smoke") {
  299:       return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
  300:     }
  301: 
  302:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/pipeline-board") {
  303:       return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
  304:     }
  305: 
  306:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/app-read-payload") {
  307:       return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
  308:     }
  309: 
  310:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/delivery") {
  311:       return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
  312:     }
  313: 
  314:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
  315:       const bodyText = await readBody(req);
  316:       let payload;
  317:       try {
  318:         payload = bodyText ? JSON.parse(bodyText) : {};
  319:       } catch (e) {
  320:         return sendJson(res, 400, {
  321:           result: "error",
  322:           error_code: "INVALID_JSON",
  323:           message: "Request body must be valid JSON."
  324:         });
  325:       }
  326: 
  327:       const idempotencyKey = req.headers["idempotency-key"] || "";
  328:       const result = createRuntimeRequest(payload, idempotencyKey);
  329:       return sendJson(res, 201, result);
  330:     }
  331: 
  332:     return sendJson(res, 404, {
  333:       result: "error",
  334:       error_code: "NOT_FOUND",
  335:       path: url.pathname
  336:     });
  337:   } catch (err) {
  338:     const status = err.httpStatus || 500;
  339:     return sendJson(res, status, {
  340:       result: "error",
  341:       error_code: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR",
  342:       message: err.message,
  343:       safety: {
  344:         external_execution_performed_flag: false,
  345:         pg_apply_performed_flag: false,
  346:         destructive_action_performed_flag: false
  347:       }
  348:     });
  349:   }
  350: });
  351: 

## Around line 310

  265: }
  266: 
  267: const server = http.createServer(async (req, res) => {
  268:   const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  269: 
  270:   try {
  271:     if (req.method === "GET" && url.pathname === "/health") {
  272:       return sendJson(res, 200, {
  273:         ok: true,
  274:         service: "aiworker-runtime-execution-http-api",
  275:         db: "PERSONA_DATABASE_URL",
  276:         external_execution: false,
  277:         pg_apply: false,
  278:         destructive_action: false
  279:       });
  280:     }
  281: 
  282:     if (!requireAuth(req)) {
  283:       return sendJson(res, 401, {
  284:         result: "error",
  285:         error_code: "UNAUTHORIZED",
  286:         message: "Missing or invalid Authorization bearer token."
  287:       });
  288:     }
  289: 
  290:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/endpoint-ready") {
  291:       return sendJson(res, 200, { result: "ok", data: endpointReady() });
  292:     }
  293: 
  294:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/api-contract") {
  295:       return sendJson(res, 200, { result: "ok", data: apiContracts() });
  296:     }
  297: 
  298:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/persistent-smoke") {
  299:       return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
  300:     }
  301: 
  302:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/pipeline-board") {
  303:       return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
  304:     }
  305: 
  306:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/app-read-payload") {
  307:       return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
  308:     }
  309: 
  310:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/delivery") {
  311:       return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
  312:     }
  313: 
  314:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
  315:       const bodyText = await readBody(req);
  316:       let payload;
  317:       try {
  318:         payload = bodyText ? JSON.parse(bodyText) : {};
  319:       } catch (e) {
  320:         return sendJson(res, 400, {
  321:           result: "error",
  322:           error_code: "INVALID_JSON",
  323:           message: "Request body must be valid JSON."
  324:         });
  325:       }
  326: 
  327:       const idempotencyKey = req.headers["idempotency-key"] || "";
  328:       const result = createRuntimeRequest(payload, idempotencyKey);
  329:       return sendJson(res, 201, result);
  330:     }
  331: 
  332:     return sendJson(res, 404, {
  333:       result: "error",
  334:       error_code: "NOT_FOUND",
  335:       path: url.pathname
  336:     });
  337:   } catch (err) {
  338:     const status = err.httpStatus || 500;
  339:     return sendJson(res, status, {
  340:       result: "error",
  341:       error_code: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR",
  342:       message: err.message,
  343:       safety: {
  344:         external_execution_performed_flag: false,
  345:         pg_apply_performed_flag: false,
  346:         destructive_action_performed_flag: false
  347:       }
  348:     });
  349:   }
  350: });
  351: 
  352: server.listen(port, "127.0.0.1", () => {
  353:   console.log(`AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:${port}`);
  354: });
  355: 

## Around line 314

  269: 
  270:   try {
  271:     if (req.method === "GET" && url.pathname === "/health") {
  272:       return sendJson(res, 200, {
  273:         ok: true,
  274:         service: "aiworker-runtime-execution-http-api",
  275:         db: "PERSONA_DATABASE_URL",
  276:         external_execution: false,
  277:         pg_apply: false,
  278:         destructive_action: false
  279:       });
  280:     }
  281: 
  282:     if (!requireAuth(req)) {
  283:       return sendJson(res, 401, {
  284:         result: "error",
  285:         error_code: "UNAUTHORIZED",
  286:         message: "Missing or invalid Authorization bearer token."
  287:       });
  288:     }
  289: 
  290:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/endpoint-ready") {
  291:       return sendJson(res, 200, { result: "ok", data: endpointReady() });
  292:     }
  293: 
  294:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/api-contract") {
  295:       return sendJson(res, 200, { result: "ok", data: apiContracts() });
  296:     }
  297: 
  298:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/persistent-smoke") {
  299:       return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
  300:     }
  301: 
  302:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/pipeline-board") {
  303:       return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
  304:     }
  305: 
  306:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/app-read-payload") {
  307:       return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
  308:     }
  309: 
  310:     if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/delivery") {
  311:       return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
  312:     }
  313: 
  314:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
  315:       const bodyText = await readBody(req);
  316:       let payload;
  317:       try {
  318:         payload = bodyText ? JSON.parse(bodyText) : {};
  319:       } catch (e) {
  320:         return sendJson(res, 400, {
  321:           result: "error",
  322:           error_code: "INVALID_JSON",
  323:           message: "Request body must be valid JSON."
  324:         });
  325:       }
  326: 
  327:       const idempotencyKey = req.headers["idempotency-key"] || "";
  328:       const result = createRuntimeRequest(payload, idempotencyKey);
  329:       return sendJson(res, 201, result);
  330:     }
  331: 
  332:     return sendJson(res, 404, {
  333:       result: "error",
  334:       error_code: "NOT_FOUND",
  335:       path: url.pathname
  336:     });
  337:   } catch (err) {
  338:     const status = err.httpStatus || 500;
  339:     return sendJson(res, status, {
  340:       result: "error",
  341:       error_code: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR",
  342:       message: err.message,
  343:       safety: {
  344:         external_execution_performed_flag: false,
  345:         pg_apply_performed_flag: false,
  346:         destructive_action_performed_flag: false
  347:       }
  348:     });
  349:   }
  350: });
  351: 
  352: server.listen(port, "127.0.0.1", () => {
  353:   console.log(`AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:${port}`);
  354: });
  355: 
