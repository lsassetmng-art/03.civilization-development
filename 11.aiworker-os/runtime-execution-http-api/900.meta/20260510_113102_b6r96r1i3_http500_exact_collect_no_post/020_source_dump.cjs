const fs = require("fs");

const file = process.argv[2];
const outDir = process.argv[3];
const src = fs.readFileSync(file, "utf8");
const lines = src.split(/\r?\n/);

function dumpWindows(outFile, patterns, before, after) {
  const chunks = [];
  chunks.push("# source windows");
  chunks.push("FILE=" + file);
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
    for (const idx of hits.slice(0, 30)) {
      const start = Math.max(0, idx - before);
      const end = Math.min(lines.length, idx + after);
      chunks.push("");
      chunks.push("--- WINDOW pattern=" + pattern + " line=" + (idx + 1) + " start=" + (start + 1) + " end=" + end + " ---");
      for (let i = start; i < end; i += 1) {
        chunks.push(String(i + 1).padStart(6, " ") + ": " + lines[i]);
      }
    }
  }
  fs.writeFileSync(outFile, chunks.join("\n") + "\n");
}

dumpWindows(
  outDir + "/030_request_route_and_db_windows.txt",
  [
    "/aiworker/v1/runtime-execution/request",
    "fn_runtime_execution_create_request_with_route_v1",
    "REQUESTED_INTERNAL_ONLY",
    "app_read_payload_jsonb",
    "task_instruction_ja",
    "requester_delivery_payload",
    "aiwB6R96R1G2EnsureRequesterDeliveryPayload",
    "res.end(JSON.stringify",
    "JSON.stringify",
    "catch",
    "SERVER_ERROR"
  ],
  70,
  120
);

console.log("SOURCE_DUMP_DONE");
