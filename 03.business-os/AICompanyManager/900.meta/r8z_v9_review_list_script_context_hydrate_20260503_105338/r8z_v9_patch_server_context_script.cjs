const fs = require('fs');

const serverPath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE';
const log = [];

let src = fs.readFileSync(serverPath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

const contextRouteNeedle = 'if (route === "/api/aicm/v2/context" && req.method === "GET") {';

if (!src.includes(contextRouteNeedle)) {
  log.push('ERROR: context route needle not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

const routePatch = `
    // ${marker}: review-list script transport for local browser hydration
    if (route === "/api/aicm/v2/context-script" && req.method === "GET") {
      const owner = url.searchParams.get("owner_civilization_id") || "";
      const callbackRaw = url.searchParams.get("callback") || "__aicmR8zV9ReviewContextCallback";
      const callback = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(callbackRaw)
        ? callbackRaw
        : "__aicmR8zV9ReviewContextCallback";
      const payload = getContext(owner);
      const js = [
        "/* ${marker} */",
        "try {",
        callback + "(" + JSON.stringify(payload) + ");",
        "} catch (error) {",
        "  try { window.__aicmR8zV9ReviewContextError = String(error && error.message ? error.message : error); } catch (_) {}",
        "}"
      ].join("\\n");

      res.writeHead(200, {
        "content-type": "application/javascript; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      });
      res.end(js);
      return true;
    }

`;

src = src.replace(contextRouteNeedle, routePatch + contextRouteNeedle);

fs.writeFileSync(serverPath, src, 'utf8');

log.push('PATCH_APPLIED: context-script route inserted before context route');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
