const fs = require("fs");

const serverPath = process.argv[2];
let src = fs.readFileSync(serverPath, "utf8");

if (!src.includes("AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START")) {
  throw new Error("R1_MARKER_MISSING");
}

function findFunctionBlock(source, functionName) {
  const anchor = `function ${functionName}(`;
  const start = source.indexOf(anchor);
  if (start < 0) throw new Error(`${functionName}_START_NOT_FOUND`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`${functionName}_BRACE_NOT_FOUND`);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return { start, end: i + 1, text: source.slice(start, i + 1) };
  }
  throw new Error(`${functionName}_END_NOT_FOUND`);
}

const fn = findFunctionBlock(src, "createRuntimeRequest");
let text = fn.text;

if (!text.includes("const sql = [")) throw new Error("SQL_ARRAY_MISSING");
if (!text.includes("'deliverable', jsonb_build_object(")) throw new Error("DELIVERABLE_BLOCK_MISSING");
if (!text.includes("'requester_delivery_payload', jsonb_build_object(")) throw new Error("REQUESTER_PAYLOAD_BLOCK_MISSING");

let fixCount = 0;

const deliverableBlock = [
`    "  'deliverable', jsonb_build_object(",`,
`    "    'package_kind', 'deliverable_zip',",`,
`    "    'deliverable_kind', 'document',",`,
`    "    'title', :'output_title_ja',",`,
`    "    'body_format', 'markdown',",`,
`    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",`,
`    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",`,
`    "    'body_markdown', :'output_body_ja',",`,
`    "    'summary_text', :'output_summary_ja',",`,
`    "    'quality_notes', :'quality_notes',",`,
`    "    'unresolved_issues', :'unresolved_issues',",`,
`    "    'next_steps', :'next_steps',",`,
`    "    'output_id', (select output_id from worker_output),",`,
`    "    'zip_link', :'deliverable_zip_link'",`,
`    "  ),",`
].join("\n");

const deliverableRegex =
/\s*"  'deliverable', jsonb_build_object\(",[\s\S]*?\n\s*"  \),",\n\s*"  'deliverable_ref', jsonb_build_object\(",/;

if (!deliverableRegex.test(text)) {
  throw new Error("DELIVERABLE_BLOCK_REGEX_NO_MATCH");
}

text = text.replace(deliverableRegex, `${deliverableBlock}\n    "  'deliverable_ref', jsonb_build_object(",`);
fixCount += 1;

const requesterPayloadBlock = [
`    "  'requester_delivery_payload', jsonb_build_object(",`,
`    "    'summary_text', :'output_summary_ja',",`,
`    "    'deliverable_title', :'output_title_ja',",`,
`    "    'package_kind', 'deliverable_zip',",`,
`    "    'deliverable_kind', 'document',",`,
`    "    'body_format', 'markdown',",`,
`    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",`,
`    "    'deliverable_link', :'deliverable_zip_link',",`,
`    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",`,
`    "    'deliverable_ref', jsonb_build_object(",`,
`    "      'source', 'aiworkeros',",`,
`    "      'schema', 'aiworker',",`,
`    "      'table', 'runtime_worker_output',",`,
`    "      'id', (select output_id from worker_output)::text",`,
`    "    )",`,
`    "  ),",`
].join("\n");

const requesterRegex =
/\s*"  'requester_delivery_payload', jsonb_build_object\(",[\s\S]*?\n\s*"  \),",\n\s*"  'safety', jsonb_build_object\(",/;

if (!requesterRegex.test(text)) {
  throw new Error("REQUESTER_PAYLOAD_BLOCK_REGEX_NO_MATCH");
}

text = text.replace(requesterRegex, `${requesterPayloadBlock}\n    "  'safety', jsonb_build_object(",`);
fixCount += 1;

// Remove any literal $1/$2/$3 lines left by earlier broken replacement.
const beforeTokenCleanup = text;
text = text
  .split(/\r?\n/)
  .filter((line) => !/^\s*\$[0-9],?\s*$/.test(line))
  .join("\n");

if (text !== beforeTokenCleanup) {
  fixCount += 1;
}

// Scoped final safety: inside the sql array only, ensure adjacent SQL string literal lines have JS commas.
const sqlStart = text.indexOf("  const sql = [");
const sqlEndMarker = "  ].join(\"\\n\");";
const sqlEnd = text.indexOf(sqlEndMarker, sqlStart);
if (sqlStart < 0 || sqlEnd < 0) throw new Error("SQL_BLOCK_BOUNDS_MISSING");

const beforeSql = text.slice(0, sqlStart);
const sqlBlock = text.slice(sqlStart, sqlEnd + sqlEndMarker.length);
const afterSql = text.slice(sqlEnd + sqlEndMarker.length);

const normalizedSql = sqlBlock.split(/\r?\n/).map((line) => {
  const trimmed = line.trim();

  if (/^"[^"]*,,\s*$/.test(trimmed)) {
    fixCount += 1;
    const indent = line.match(/^\s*/)?.[0] || "";
    const body = trimmed.slice(1).replace(/,,\s*$/, ",");
    return `${indent}"${body}",`;
  }

  if (/^"[^"]+$/.test(trimmed)) {
    fixCount += 1;
    const indent = line.match(/^\s*/)?.[0] || "";
    const body = trimmed.slice(1);
    return `${indent}"${body}",`;
  }

  if (/^"[\s\S]*"$/.test(trimmed) && !trimmed.endsWith('",')) {
    fixCount += 1;
    return `${line},`;
  }

  return line;
}).join("\n");

text = beforeSql + normalizedSql + afterSql;

const patched = src.slice(0, fn.start) + text + src.slice(fn.end);

const required = [
  "AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START",
  "aiwB6R95R3D1CreateZipAndAttach",
  "generated_artifacts",
  "deliverable_zip_link",
  "deliverable_package_jsonb",
  "aiworkeros_common_requester_multi_artifact_zip_contract",
  "bundle_generated_artifacts_for_single_download",
  "00_summary.md",
  "01_main_deliverable.md",
  "manifest.json"
];

for (const needle of required) {
  if (!patched.includes(needle)) {
    throw new Error(`REQUIRED_NEEDLE_MISSING:${needle}`);
  }
}

if (/\n\s*\$[0-9],?\s*\n/.test(patched)) {
  throw new Error("LITERAL_REPLACEMENT_TOKEN_REMAINS");
}

fs.writeFileSync(serverPath, patched, "utf8");
console.log(`FIX_COUNT=${fixCount}`);
