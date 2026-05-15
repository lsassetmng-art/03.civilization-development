const fs = require("fs");

const serverPath = process.argv[2];
let src = fs.readFileSync(serverPath, "utf8");

if (!src.includes("AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START")) {
  throw new Error("R1_MARKER_MISSING");
}

const fnAnchor = "function createRuntimeRequest(payload, idempotencyKeyFromHeader)";
const fnStart = src.indexOf(fnAnchor);
if (fnStart < 0) throw new Error("CREATE_RUNTIME_REQUEST_NOT_FOUND");

const sqlStart = src.indexOf("  const sql = [", fnStart);
if (sqlStart < 0) throw new Error("SQL_ARRAY_START_NOT_FOUND");

const sqlEndMarker = "  ].join(\"\\n\");";
const sqlEnd = src.indexOf(sqlEndMarker, sqlStart);
if (sqlEnd < 0) throw new Error("SQL_ARRAY_END_NOT_FOUND");

const before = src.slice(0, sqlStart);
const sqlBlock = src.slice(sqlStart, sqlEnd + sqlEndMarker.length);
const after = src.slice(sqlEnd + sqlEndMarker.length);

const lines = sqlBlock.split(/\r?\n/);
let fixCount = 0;

const normalized = lines.map((line) => {
  const trimmed = line.trim();

  // Fix malformed SQL string line like:
  //   "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,,
  if (/^"[^"]*,,\s*$/.test(trimmed)) {
    fixCount += 1;
    const indent = line.match(/^\s*/)?.[0] || "";
    const body = trimmed.slice(1).replace(/,,\s*$/, ",");
    return `${indent}"${body}",`;
  }

  // Fix malformed SQL string line that starts with a quote but has no closing quote.
  if (/^"[^"]+$/.test(trimmed)) {
    fixCount += 1;
    const indent = line.match(/^\s*/)?.[0] || "";
    const body = trimmed.slice(1);
    return `${indent}"${body}",`;
  }

  // For SQL array entries, every plain string literal line may safely have a JS trailing comma.
  // This is scoped to const sql = [...] only.
  if (/^"[\s\S]*"$/.test(trimmed) && !/",$/.test(trimmed)) {
    fixCount += 1;
    return `${line},`;
  }

  return line;
}).join("\n");

const patched = before + normalized + after;

const required = [
  "AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START",
  "aiwB6R95R3D1CreateZipAndAttach",
  "generated_artifacts",
  "deliverable_zip_link",
  "deliverable_package_jsonb",
  "aiworkeros_common_requester_multi_artifact_zip_contract",
  "00_summary.md",
  "01_main_deliverable.md",
  "manifest.json"
];

for (const needle of required) {
  if (!patched.includes(needle)) {
    throw new Error(`REQUIRED_NEEDLE_MISSING:${needle}`);
  }
}

fs.writeFileSync(serverPath, patched, "utf8");
console.log(`SQL_ARRAY_NORMALIZE_FIX_COUNT=${fixCount}`);
console.log(`SQL_ARRAY_START_INDEX=${sqlStart}`);
console.log(`SQL_ARRAY_END_INDEX=${sqlEnd}`);
