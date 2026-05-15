const fs = require("fs");

const [,, serverPath, anchorJsonPath, anchorMdPath, windowsPath] = process.argv;
const src = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\r?\n/);

function findAll(pattern, label) {
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (pattern.test(lines[i])) {
      hits.push({
        line: i + 1,
        text: lines[i]
      });
    }
  }
  return { label, count: hits.length, hits };
}

const checks = [
  findAll(/\bfunction\s+sendJson\s*\(/, "function_sendJson"),
  findAll(/\bsendJson\s*\(/, "call_sendJson"),
  findAll(/\bfunction\s+json\s*\(/, "function_json"),
  findAll(/\bjson\s*\(/, "call_json"),
  findAll(/\brespondJson\s*\(/, "respondJson"),
  findAll(/\bwriteJson\s*\(/, "writeJson"),
  findAll(/\bsend\s*\(\s*res\s*,/, "send_res"),
  findAll(/res\.end\s*\(\s*JSON\.stringify\s*\(/, "res_end_JSON_stringify"),
  findAll(/res\.writeHead\s*\(/, "res_writeHead"),
  findAll(/JSON\.stringify\s*\(/, "JSON_stringify"),
  findAll(/requester_delivery_payload/, "requester_delivery_payload"),
  findAll(/app_read_payload_jsonb/, "app_read_payload_jsonb"),
  findAll(/REQUESTED_INTERNAL_ONLY/, "REQUESTED_INTERNAL_ONLY"),
  findAll(/accepted/, "accepted"),
  findAll(/request_id/, "request_id"),
  findAll(/fn_runtime_execution_create_request_with_route_v1/, "fn_runtime_execution_create_request_with_route_v1")
];

fs.writeFileSync(anchorJsonPath, JSON.stringify({
  serverPath,
  checks
}, null, 2));

const md = [];
md.push("# B6R96R1G0 response anchor inventory");
md.push("");
md.push("## Purpose");
md.push("R1G failed because `function sendJson(...)` was not found.");
md.push("This audit identifies the actual response anchor without patching.");
md.push("");
md.push("## Counts");
for (const c of checks) {
  md.push("- " + c.label + ": " + c.count);
}
md.push("");
md.push("## Important hits");
for (const c of checks) {
  md.push("");
  md.push("### " + c.label);
  for (const h of c.hits.slice(0, 30)) {
    md.push("- L" + h.line + ": " + h.text.trim());
  }
}
fs.writeFileSync(anchorMdPath, md.join("\n") + "\n");

const windowPatterns = [
  "res.end(JSON.stringify",
  "JSON.stringify",
  "res.writeHead",
  "REQUESTED_INTERNAL_ONLY",
  "accepted",
  "request_id",
  "app_read_payload_jsonb",
  "fn_runtime_execution_create_request_with_route_v1",
  "requester_delivery_payload",
  "return {",
  "return response",
  "return payload",
  "createRuntimeRequest",
  "task_instruction_ja",
  "task_title",
  "model_code"
];

const chunks = [];
chunks.push("# B6R96R1G0 response anchor windows");
chunks.push("FILE=" + serverPath);
chunks.push("");

for (const pattern of windowPatterns) {
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(pattern)) hits.push(i);
  }

  chunks.push("");
  chunks.push("============================================================");
  chunks.push("PATTERN=" + pattern);
  chunks.push("MATCH_COUNT=" + hits.length);
  chunks.push("============================================================");

  for (const idx of hits.slice(0, 35)) {
    const start = Math.max(0, idx - 45);
    const end = Math.min(lines.length, idx + 80);
    chunks.push("");
    chunks.push("--- WINDOW pattern=" + pattern + " line=" + (idx + 1) + " start=" + (start + 1) + " end=" + end + " ---");
    for (let i = start; i < end; i += 1) {
      chunks.push(String(i + 1).padStart(6, " ") + ": " + lines[i]);
    }
  }
}

fs.writeFileSync(windowsPath, chunks.join("\n") + "\n");

console.log("ANCHOR_JSON=" + anchorJsonPath);
console.log("ANCHOR_MD=" + anchorMdPath);
console.log("WINDOWS=" + windowsPath);
