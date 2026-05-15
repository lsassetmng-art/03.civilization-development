const fs = require("fs");

const serverPath = process.argv[2];
let src = fs.readFileSync(serverPath, "utf8");

if (!src.includes("function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle)")) {
  throw new Error("BUILD_ZIP_PACKAGE_META_MISSING");
}
if (!src.includes("AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX")) {
  throw new Error("B6R95R3F_MARKER_MISSING");
}
if (src.includes("AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX")) {
  throw new Error("B6R95R3H_ALREADY_APPLIED");
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

const fn = findFunctionBlock(src, "aiwB6R95R3D1BuildZipPackageMeta");

const replacement = [
"function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {",
"  const crypto = require(\"crypto\");",
"  const zipId = `${Date.now()}_${crypto.randomUUID()}`;",
"  const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, \"requester\");",
"  const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, \"deliverables\");",
"  const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;",
"",
"  // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX",
"  // The package metadata is saved to DB before the zip file is written.",
"  // Therefore file_name / zip_link must already use the exact sanitized filename",
"  // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.",
"  const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, \"deliverables.zip\").endsWith(\".zip\")",
"    ? aiwB6R95R3D1SafeFilePart(rawFileName, \"deliverables.zip\")",
"    : `${aiwB6R95R3D1SafeFilePart(rawFileName, \"deliverables\")}.zip`;",
"  const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;",
"",
"  return {",
"    package_kind: \"deliverable_zip\",",
"    package_format: \"zip\",",
"    mime_type: \"application/zip\",",
"    zip_id: zipId,",
"    file_name: fileName,",
"    zip_link: zipLink,",
"    zip_ref: {",
"      source: \"aiworkeros\",",
"      storage_code: \"runtime-deliverable-zip\",",
"      file_name: fileName",
"    }",
"  };",
"}"
].join("\n");

const patched = src.slice(0, fn.start) + replacement + src.slice(fn.end);

const required = [
  "AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX",
  "const rawFileName =",
  "const fileName = aiwB6R95R3D1SafeFilePart(rawFileName",
  "const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;",
  "file_name: fileName",
  "zip_link: zipLink"
];

for (const needle of required) {
  if (!patched.includes(needle)) {
    throw new Error(`REQUIRED_NEEDLE_MISSING:${needle}`);
  }
}

fs.writeFileSync(serverPath, patched, "utf8");
console.log("PATCH_OK");
