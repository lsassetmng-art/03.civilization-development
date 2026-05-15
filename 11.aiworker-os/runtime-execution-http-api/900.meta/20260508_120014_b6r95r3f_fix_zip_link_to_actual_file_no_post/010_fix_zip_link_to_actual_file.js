const fs = require("fs");

const serverPath = process.argv[2];
let src = fs.readFileSync(serverPath, "utf8");

if (!src.includes("function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable)")) {
  throw new Error("ZIP_ATTACH_FUNCTION_MISSING");
}
if (!src.includes("AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START")) {
  throw new Error("R1_MARKER_MISSING");
}
if (src.includes("AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX")) {
  throw new Error("B6R95R3F_ALREADY_APPLIED");
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

const fn = findFunctionBlock(src, "aiwB6R95R3D1CreateZipAndAttach");
let text = fn.text;

const zipPathLine = "  const zipPath = path.join(zipDir, fileName);";
if (!text.includes(zipPathLine)) {
  throw new Error("ZIP_PATH_LINE_MISSING");
}

text = text.replace(
  zipPathLine,
  [
    zipPathLine,
    "",
    "  // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX",
    "  // Keep the returned zip link aligned with the actual sanitized filename written to disk.",
    "  const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;",
    "  const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {",
    "    source: \"aiworkeros\",",
    "    storage_code: \"runtime-deliverable-zip\",",
    "    file_name: fileName",
    "  });"
  ].join("\n")
);

text = text.replaceAll("zip_link: packageMeta.zip_link", "zip_link: actualZipLink");
text = text.replaceAll("zip_ref: packageMeta.zip_ref", "zip_ref: actualZipRef");
text = text.replaceAll("response.deliverable_zip_ref = packageMeta.zip_ref;", "response.deliverable_zip_ref = actualZipRef;");
text = text.replaceAll("response.deliverable_link = packageMeta.zip_link;", "response.deliverable_link = actualZipLink;");
text = text.replaceAll("deliverable_link: packageMeta.zip_link,", "deliverable_link: actualZipLink,");
text = text.replaceAll("deliverable_zip_ref: packageMeta.zip_ref,", "deliverable_zip_ref: actualZipRef,");

const patched = src.slice(0, fn.start) + text + src.slice(fn.end);

const required = [
  "AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX",
  "const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;",
  "const actualZipRef = Object.assign",
  "zip_link: actualZipLink",
  "zip_ref: actualZipRef",
  "response.deliverable_link = actualZipLink",
  "deliverable_link: actualZipLink"
];

for (const needle of required) {
  if (!patched.includes(needle)) {
    throw new Error(`REQUIRED_NEEDLE_MISSING:${needle}`);
  }
}

if (patched.includes("zip_link: packageMeta.zip_link")) {
  throw new Error("OLD_PACKAGE_META_ZIP_LINK_REMAINS");
}

fs.writeFileSync(serverPath, patched, "utf8");
console.log("PATCH_OK");
