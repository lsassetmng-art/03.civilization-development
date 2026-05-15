const fs = require("fs");

const serverPath = process.argv[2];
let src = fs.readFileSync(serverPath, "utf8");

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

if (!src.includes("AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START")) {
  throw new Error("R1_MARKER_MISSING");
}

const block = findFunctionBlock(src, "createRuntimeRequest");
let text = block.text;

if (!text.includes("const sql = [")) {
  throw new Error("SQL_ARRAY_ANCHOR_MISSING");
}

let fixCount = 0;

function replaceOnce(pattern, replacement, label) {
  if (pattern.test(text)) {
    text = text.replace(pattern, (...args) => {
      fixCount += 1;
      return typeof replacement === "function" ? replacement(...args) : replacement;
    });
    console.log(`FIXED=${label}`);
  } else {
    console.log(`NO_HIT=${label}`);
  }
}

/*
  Fix 1:
  JS array element missing comma between adjacent SQL string lines:
    "    'deliverable_kind', 'document',"
    "    'package_kind', 'deliverable_zip',",
*/
replaceOnce(
  /("    'deliverable_kind', 'document',")\n("    'package_kind', 'deliverable_zip',",)/,
  '$1,\n$2',
  "deliverable_kind_to_package_kind_missing_js_comma"
);

/*
  Fix 2:
  Same pattern around body_format -> deliverable_package.
*/
replaceOnce(
  /("    'body_format', 'markdown',")\n("    'deliverable_package', :'deliverable_package_jsonb'::jsonb,")\n("    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,")\n("    'zip_link', :'deliverable_zip_link'",)/,
  '$1,\n$2,\n$3,\n$4',
  "body_format_deliverable_package_generated_artifacts_missing_js_commas"
);

/*
  Fix 3:
  Broken generated_artifacts SQL line with duplicated comma and missing quote.
*/
replaceOnce(
  /"    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,,/g,
  "\"    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,\"",
  "generated_artifacts_double_comma_missing_quote"
);

/*
  Fix 4:
  requester_delivery_payload block may have package_kind inserted without JS comma after deliverable_title.
*/
replaceOnce(
  /("    'deliverable_title', :'output_title_ja',")\n("    'package_kind', 'deliverable_zip',")\n("    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,")/,
  '$1,\n$2,\n$3,',
  "requester_payload_inserted_lines_missing_js_commas"
);

/*
  Generic scoped safety net:
  Inside createRuntimeRequest only, if a SQL string literal line lacks JS trailing comma
  and the next line is another SQL string literal, add the JS comma.
  This is intentionally scoped to one function block.
*/
const beforeGeneric = text;
text = text.replace(
  /^(\s*"[^"\n]*")\n(\s*"[^"\n]*",?)/gm,
  (m, a, b) => {
    if (a.trim().endsWith('",')) return m;
    if (!a.includes("'") && !a.includes("select") && !a.includes("with") && !a.includes("jsonb_build_object") && !a.includes("concat(")) return m;
    fixCount += 1;
    return `${a},\n${b}`;
  }
);
if (text !== beforeGeneric) {
  console.log("FIXED=generic_scoped_adjacent_sql_string_commas");
}

const patched = src.slice(0, block.start) + text + src.slice(block.end);

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
console.log(`TOTAL_FIX_COUNT=${fixCount}`);
