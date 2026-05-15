const fs = require("fs");

const file = process.argv[2];
const outFile = process.argv[3];

const src = fs.readFileSync(file, "utf8");
const lines = src.split(/\r?\n/);

const patterns = [
  "fn_runtime_execution_create_request_with_route_v1",
  "createRuntimeRequest",
  "runtime",
  "requester_delivery_payload",
  "deliverable",
  "body_markdown",
  "output_markdown",
  "content_text",
  "summary_text",
  "quality_notes",
  "accepted",
  "REQUESTED_INTERNAL_ONLY",
  "app_read_payload_jsonb",
  "task_instruction_ja",
  "task_title",
  "model_code",
  "role_code",
  "source_app_ref",
  "source_request_ref",
  "response",
  "return",
  "JSON.stringify",
  "res.end",
  "sendJson"
];

const chunks = [];
chunks.push("# AIWorkerOS server runtime response windows");
chunks.push("FILE=" + file);
chunks.push("");

for (const pattern of patterns) {
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(pattern)) hits.push(i);
  }

  chunks.push("");
  chunks.push("============================================================");
  chunks.push("PATTERN=" + pattern);
  chunks.push("MATCH_COUNT=" + hits.length);
  chunks.push("============================================================");

  for (const idx of hits.slice(0, 40)) {
    const start = Math.max(0, idx - 55);
    const end = Math.min(lines.length, idx + 95);
    chunks.push("");
    chunks.push("--- WINDOW pattern=" + pattern + " line=" + (idx + 1) + " start=" + (start + 1) + " end=" + end + " ---");
    for (let i = start; i < end; i += 1) {
      chunks.push(String(i + 1).padStart(6, " ") + ": " + lines[i]);
    }
  }
}

fs.writeFileSync(outFile, chunks.join("\n") + "\n");
console.log("WROTE=" + outFile);
