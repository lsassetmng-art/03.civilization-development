import fs from "fs";

const serverPath = process.env.AIWORKER_SERVER;
const outJson = process.env.SERVER_SCAN_JSON;
const outSnippets = process.env.SERVER_SNIPPETS;

const text = fs.readFileSync(serverPath, "utf8");
const lines = text.split(/\r?\n/);

const patterns = [
  "runtime-execution/request",
  "runtime-execution/app-read-payload",
  "runtime-execution/pipeline-board",
  "runtime-execution/delivery",
  "runtime-execution/output",
  "runtime-execution/result",
  "output_title",
  "output_status",
  "output_result",
  "delivery_status",
  "delivery_result",
  "delivery_summary",
  "result_summary",
  "request_status",
  "REQUESTED_INTERNAL_ONLY",
  "INSERT INTO",
  "UPDATE ",
  "SELECT ",
  "FROM ",
  "writeFile",
  "appendFile",
  "idempotency",
  "request_log"
];

function lineHits(pattern) {
  const hits = [];
  const lowerPattern = pattern.toLowerCase();
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].toLowerCase().includes(lowerPattern)) {
      hits.push({ line: i + 1, text: lines[i] });
    }
  }
  return hits;
}

function snippetAround(lineNo, radius) {
  const start = Math.max(1, lineNo - radius);
  const end = Math.min(lines.length, lineNo + radius);
  const chunk = [];
  for (let n = start; n <= end; n += 1) {
    chunk.push(String(n).padStart(5, " ") + ": " + lines[n - 1]);
  }
  return chunk.join("\n");
}

const routeHits = {};
for (const p of patterns) routeHits[p] = lineHits(p);

const tableSet = new Set();
const tableRegex = /\b(?:FROM|JOIN|INSERT\s+INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/g;
let m;
while ((m = tableRegex.exec(text)) !== null) tableSet.add(m[1]);

const endpointLines = [
  ...routeHits["runtime-execution/request"],
  ...routeHits["runtime-execution/app-read-payload"],
  ...routeHits["runtime-execution/pipeline-board"],
  ...routeHits["runtime-execution/delivery"],
  ...routeHits["runtime-execution/output"],
  ...routeHits["runtime-execution/result"]
].map(x => x.line);

const uniqueEndpointLines = [...new Set(endpointLines)].sort((a, b) => a - b);

const result = {
  result: "ok",
  server_path: serverPath,
  line_count: lines.length,
  route_hits: routeHits,
  sql_table_refs: [...tableSet].sort(),
  endpoint_line_count: uniqueEndpointLines.length,
  endpoint_lines: uniqueEndpointLines
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2));

const md = [];
md.push("# AIWorkerOS server route snippets");
md.push("");
md.push("## Table refs");
for (const t of result.sql_table_refs) md.push("- " + t);
md.push("");
for (const lineNo of uniqueEndpointLines) {
  md.push("## Around line " + lineNo);
  md.push("");
  md.push(snippetAround(lineNo, 45));
  md.push("");
}
fs.writeFileSync(outSnippets, md.join("\n"));

console.log(JSON.stringify({
  result: "ok",
  endpoint_line_count: result.endpoint_line_count,
  sql_table_ref_count: result.sql_table_refs.length,
  sql_table_refs: result.sql_table_refs,
  request_route_hits: routeHits["runtime-execution/request"].length,
  delivery_route_hits: routeHits["runtime-execution/delivery"].length,
  output_route_hits: routeHits["runtime-execution/output"].length,
  result_route_hits: routeHits["runtime-execution/result"].length,
  request_status_hits: routeHits["REQUESTED_INTERNAL_ONLY"].length
}, null, 2));
