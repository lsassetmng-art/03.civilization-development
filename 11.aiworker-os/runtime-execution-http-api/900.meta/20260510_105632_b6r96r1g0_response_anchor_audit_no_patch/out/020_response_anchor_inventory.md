# B6R96R1G0 response anchor inventory

## Purpose
R1G failed because `function sendJson(...)` was not found.
This audit identifies the actual response anchor without patching.

## Counts
- function_sendJson: 1
- call_sendJson: 14
- function_json: 0
- call_json: 0
- respondJson: 0
- writeJson: 0
- send_res: 0
- res_end_JSON_stringify: 1
- res_writeHead: 1
- JSON_stringify: 9
- requester_delivery_payload: 2
- app_read_payload_jsonb: 7
- REQUESTED_INTERNAL_ONLY: 0
- accepted: 0
- request_id: 16
- fn_runtime_execution_create_request_with_route_v1: 1

## Important hits

### function_sendJson
- L229: function sendJson(res, status, payload) {

### call_sendJson
- L229: function sendJson(res, status, payload) {
- L1426: return sendJson(res, 200, {
- L1437: return sendJson(res, 401, {
- L1445: return sendJson(res, 200, { result: "ok", data: endpointReady() });
- L1449: return sendJson(res, 200, { result: "ok", data: apiContracts() });
- L1453: return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
- L1457: return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
- L1461: return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
- L1465: return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
- L1492: return sendJson(res, 200, {
- L1510: return sendJson(res, 400, {
- L1519: return sendJson(res, 201, result);
- L1522: return sendJson(res, 404, {
- L1529: return sendJson(res, status, {

### function_json

### call_json

### respondJson

### writeJson

### send_res

### res_end_JSON_stringify
- L242: res.end(JSON.stringify(payload, null, 2));

### res_writeHead
- L238: res.writeHead(status, {

### JSON_stringify
- L242: res.end(JSON.stringify(payload, null, 2));
- L642: try { return JSON.stringify(value); } catch { return String(value); }
- L1230: { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
- L1409: deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
- L1411: generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
- L1412: robot_context_jsonb: JSON.stringify(deliverable.robotContext),
- L1413: generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
- L1414: output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
- L1415: artifacts_jsonb: JSON.stringify(deliverable.artifacts)

### requester_delivery_payload
- L1262: response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
- L1368: "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",

### app_read_payload_jsonb
- L24: const appRead = aiwB6R44fPlainObject(body.app_read_payload_jsonb);
- L96: const appRead = aiwB6R44fPlainObject(out.app_read_payload_jsonb);
- L100: app_read_payload_jsonb: aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, body || payload || requestBody || input || {}),
- L115: out.app_read_payload_jsonb = aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, route);
- L140: if (row.app_surface_code || row.app_read_payload_jsonb) return true;
- L148: const appRead = aiwB6R44gR4PlainObject(out.app_read_payload_jsonb);
- L1345: "  'payload', coalesce((select app_read_payload_jsonb from board limit 1), '{}'::jsonb),",

### REQUESTED_INTERNAL_ONLY

### accepted

### request_id
- L57: body.request_id ||
- L58: body.runtime_execution_request_id
- L138: if (row.request_id || row.runtime_execution_request_id || row.request_code) return true;
- L355: on rr.request_id = p.request_id
- L356: where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
- L363: request_id: query.get("request_id") || "",
- L377: on rr.request_id = p.request_id
- L378: where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
- L385: request_id: query.get("request_id") || "",
- L398: where (nullif(:'request_id','') is null or request_id::text = :'request_id')
- L404: request_id: query.get("request_id") || "",
- L1205: request_id: response.request_id || null,
- L1318: "  ) as request_id",
- L1322: "    (select request_id from created),",
- L1334: "    on c.request_id = p.request_id",
- L1339: "  'request_id', (select request_id from created),",

### fn_runtime_execution_create_request_with_route_v1
- L1307: "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
