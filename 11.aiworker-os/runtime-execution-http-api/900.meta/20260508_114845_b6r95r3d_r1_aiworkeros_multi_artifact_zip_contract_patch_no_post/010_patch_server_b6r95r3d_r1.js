const fs = require("fs");

const serverPath = process.argv[2];
const afterPath = process.argv[3];

let src = fs.readFileSync(serverPath, "utf8");

if (!src.includes("AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_START")) {
  throw new Error("R3_MARKER_MISSING");
}
if (src.includes("AIWORKEROS_B6R95R3D_ZIP_PACKAGE_CONTRACT_START")) {
  throw new Error("OLD_FIXED_FILE_ZIP_MARKER_EXISTS");
}
if (src.includes("AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START")) {
  throw new Error("R1_MARKER_ALREADY_EXISTS");
}

const zipHelpers = [
"// AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START",
"/*",
"  B6R95R3D-R1:",
"  Multi-artifact deliverable zip package contract.",
"",
"  Canon:",
"  - AIWorkerOS creates one or more deliverable artifacts from the instruction.",
"  - AIWorkerOS creates summary_text.",
"  - AIWorkerOS bundles generated artifacts into one deliverable zip.",
"  - Requester apps display summary_text and link to the zip.",
"  - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.",
"",
"  Boundary:",
"  - No external execution.",
"  - No PG apply.",
"  - No destructive action.",
"  - No requester-app-specific contract.",
"*/",
"function aiwB6R95R3D1SafeFilePart(value, fallback) {",
"  const raw = String(value || fallback || \"deliverable\").trim();",
"  const safe = raw.replace(/[^A-Za-z0-9._-]+/g, \"_\").replace(/^_+|_+$/g, \"\").slice(0, 80);",
"  return safe || String(fallback || \"deliverable\");",
"}",
"",
"function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {",
"  const crypto = require(\"crypto\");",
"  const zipId = `${Date.now()}_${crypto.randomUUID()}`;",
"  const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, \"requester\");",
"  const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, \"deliverables\");",
"  const fileName = `${requesterPart}_${titlePart}_${zipId}.zip`;",
"  const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;",
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
"}",
"",
"function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {",
"  const seq = String(index + 1).padStart(2, \"0\");",
"  const kind = aiwB6R95R3R3OneLine(item?.artifact_kind_code || item?.kind || \"document\", \"document\");",
"  const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);",
"  const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || \"\");",
"  const suggestedName = item?.file_name || `${seq}_${aiwB6R95R3D1SafeFilePart(title, `artifact_${seq}`)}.md`;",
"  const fileName = aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`).endsWith(\".md\")",
"    ? aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`)",
"    : `${aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}`)}.md`;",
"  return {",
"    artifact_no: index + 1,",
"    artifact_kind_code: kind,",
"    title,",
"    file_name: fileName,",
"    body_markdown: body,",
"    body_format: \"markdown\"",
"  };",
"}",
"",
"function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {",
"  const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];",
"  if (provided.length > 0) {",
"    return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);",
"  }",
"",
"  const artifacts = [",
"    {",
"      kind: \"main_deliverable\",",
"      title: deliverable?.outputTitle || \"主成果物\",",
"      file_name: \"01_main_deliverable.md\",",
"      body_markdown: deliverable?.bodyMarkdown || \"\"",
"    }",
"  ];",
"",
"  if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {",
"    artifacts.push({",
"      kind: \"quality_notes\",",
"      title: \"品質メモ\",",
"      file_name: \"90_quality_notes.md\",",
"      body_markdown: deliverable.qualityNotes",
"    });",
"  }",
"",
"  if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {",
"    artifacts.push({",
"      kind: \"unresolved_issues\",",
"      title: \"未解決事項\",",
"      file_name: \"91_unresolved_issues.md\",",
"      body_markdown: deliverable.unresolvedIssues",
"    });",
"  }",
"",
"  if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {",
"    artifacts.push({",
"      kind: \"next_steps\",",
"      title: \"次工程\",",
"      file_name: \"92_next_steps.md\",",
"      body_markdown: deliverable.nextSteps",
"    });",
"  }",
"",
"  return artifacts.map(aiwB6R95R3D1NormalizeGeneratedArtifact);",
"}",
"",
"function aiwB6R95R3D1ZipCrc32(buffer) {",
"  let table = aiwB6R95R3D1ZipCrc32._table;",
"  if (!table) {",
"    table = new Uint32Array(256);",
"    for (let i = 0; i < 256; i++) {",
"      let c = i;",
"      for (let k = 0; k < 8; k++) {",
"        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);",
"      }",
"      table[i] = c >>> 0;",
"    }",
"    aiwB6R95R3D1ZipCrc32._table = table;",
"  }",
"  let crc = 0xffffffff;",
"  for (const byte of buffer) {",
"    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);",
"  }",
"  return (crc ^ 0xffffffff) >>> 0;",
"}",
"",
"function aiwB6R95R3D1ZipDosDateTime(date) {",
"  const year = Math.max(1980, date.getFullYear());",
"  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);",
"  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();",
"  return { dosTime, dosDate };",
"}",
"",
"function aiwB6R95R3D1ZipStored(entries) {",
"  const localParts = [];",
"  const centralParts = [];",
"  let offset = 0;",
"  const now = aiwB6R95R3D1ZipDosDateTime(new Date());",
"",
"  for (const entry of entries) {",
"    const nameBuffer = Buffer.from(entry.name, \"utf8\");",
"    const dataBuffer = Buffer.from(String(entry.content ?? \"\"), \"utf8\");",
"    const crc = aiwB6R95R3D1ZipCrc32(dataBuffer);",
"",
"    const local = Buffer.alloc(30);",
"    local.writeUInt32LE(0x04034b50, 0);",
"    local.writeUInt16LE(20, 4);",
"    local.writeUInt16LE(0, 6);",
"    local.writeUInt16LE(0, 8);",
"    local.writeUInt16LE(now.dosTime, 10);",
"    local.writeUInt16LE(now.dosDate, 12);",
"    local.writeUInt32LE(crc, 14);",
"    local.writeUInt32LE(dataBuffer.length, 18);",
"    local.writeUInt32LE(dataBuffer.length, 22);",
"    local.writeUInt16LE(nameBuffer.length, 26);",
"    local.writeUInt16LE(0, 28);",
"    localParts.push(local, nameBuffer, dataBuffer);",
"",
"    const central = Buffer.alloc(46);",
"    central.writeUInt32LE(0x02014b50, 0);",
"    central.writeUInt16LE(20, 4);",
"    central.writeUInt16LE(20, 6);",
"    central.writeUInt16LE(0, 8);",
"    central.writeUInt16LE(0, 10);",
"    central.writeUInt16LE(now.dosTime, 12);",
"    central.writeUInt16LE(now.dosDate, 14);",
"    central.writeUInt32LE(crc, 16);",
"    central.writeUInt32LE(dataBuffer.length, 20);",
"    central.writeUInt32LE(dataBuffer.length, 24);",
"    central.writeUInt16LE(nameBuffer.length, 28);",
"    central.writeUInt16LE(0, 30);",
"    central.writeUInt16LE(0, 32);",
"    central.writeUInt16LE(0, 34);",
"    central.writeUInt16LE(0, 36);",
"    central.writeUInt32LE(0, 38);",
"    central.writeUInt32LE(offset, 42);",
"    centralParts.push(central, nameBuffer);",
"",
"    offset += local.length + nameBuffer.length + dataBuffer.length;",
"  }",
"",
"  const localData = Buffer.concat(localParts);",
"  const centralDir = Buffer.concat(centralParts);",
"  const eocd = Buffer.alloc(22);",
"  eocd.writeUInt32LE(0x06054b50, 0);",
"  eocd.writeUInt16LE(0, 4);",
"  eocd.writeUInt16LE(0, 6);",
"  eocd.writeUInt16LE(entries.length, 8);",
"  eocd.writeUInt16LE(entries.length, 10);",
"  eocd.writeUInt32LE(centralDir.length, 12);",
"  eocd.writeUInt32LE(localData.length, 16);",
"  eocd.writeUInt16LE(0, 20);",
"",
"  return Buffer.concat([localData, centralDir, eocd]);",
"}",
"",
"function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {",
"  const fs = require(\"fs\");",
"  const path = require(\"path\");",
"",
"  const response = responsePayload && typeof responsePayload === \"object\" ? responsePayload : {};",
"  const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta(\"requester\", \"deliverables\");",
"  const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);",
"",
"  const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), \"runtime-deliverable-zips\");",
"  fs.mkdirSync(zipDir, { recursive: true });",
"",
"  const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, \"deliverables.zip\").endsWith(\".zip\")",
"    ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, \"deliverables.zip\")",
"    : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, \"deliverables\")}.zip`;",
"  const zipPath = path.join(zipDir, fileName);",
"",
"  const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || \"\";",
"  const manifest = {",
"    contract_version: \"B6R95R3D-R1\",",
"    contract_name: \"aiworkeros_common_requester_multi_artifact_zip_contract\",",
"    package_purpose: \"bundle_generated_artifacts_for_single_download\",",
"    request_id: response.request_id || null,",
"    output_id: response.output_id || null,",
"    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || \"成果物\",",
"    summary_text: summaryText,",
"    artifact_count: generatedArtifacts.length,",
"    generated_artifacts: generatedArtifacts.map((artifact) => ({",
"      artifact_no: artifact.artifact_no,",
"      artifact_kind_code: artifact.artifact_kind_code,",
"      title: artifact.title,",
"      file_name: artifact.file_name,",
"      body_format: artifact.body_format",
"    })),",
"    deliverable_ref: response.deliverable_ref || null,",
"    robot_context: response.robot_context || deliverable?.robotContext || null,",
"    generation_basis: response.generation_basis || deliverable?.generationBasis || null,",
"    safety: response.safety || null,",
"    created_at: new Date().toISOString()",
"  };",
"",
"  const entries = [",
"    { name: \"00_summary.md\", content: summaryText },",
"    ...generatedArtifacts.map((artifact) => ({",
"      name: artifact.file_name,",
"      content: artifact.body_markdown",
"    })),",
"    { name: \"manifest.json\", content: JSON.stringify(manifest, null, 2) }",
"  ];",
"",
"  const zipBuffer = aiwB6R95R3D1ZipStored(entries);",
"  fs.writeFileSync(zipPath, zipBuffer);",
"  const stat = fs.statSync(zipPath);",
"",
"  const zipPublic = {",
"    package_kind: \"deliverable_zip\",",
"    package_format: \"zip\",",
"    mime_type: \"application/zip\",",
"    zip_id: packageMeta.zip_id,",
"    file_name: fileName,",
"    zip_link: packageMeta.zip_link,",
"    zip_ref: packageMeta.zip_ref,",
"    byte_size: stat.size,",
"    entry_count: entries.length,",
"    artifact_count: generatedArtifacts.length,",
"    created_at: manifest.created_at",
"  };",
"",
"  response.generated_artifacts = generatedArtifacts.map((artifact) => ({",
"    artifact_no: artifact.artifact_no,",
"    artifact_kind_code: artifact.artifact_kind_code,",
"    title: artifact.title,",
"    file_name: artifact.file_name,",
"    body_format: artifact.body_format",
"  }));",
"  response.deliverable_package = zipPublic;",
"  response.deliverable_zip_ref = packageMeta.zip_ref;",
"  response.deliverable_link = packageMeta.zip_link;",
"",
"  response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {",
"    summary_text: summaryText,",
"    deliverable_link: packageMeta.zip_link,",
"    deliverable_package: zipPublic,",
"    deliverable_zip_ref: packageMeta.zip_ref,",
"    generated_artifacts: response.generated_artifacts",
"  });",
"",
"  response.deliverable = Object.assign({}, response.deliverable || {}, {",
"    deliverable_package: zipPublic,",
"    zip_link: packageMeta.zip_link,",
"    generated_artifacts: response.generated_artifacts",
"  });",
"",
"  return response;",
"}",
"// AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END",
""
].join("\n");

const endMarker = "// AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END";
if (!src.includes(endMarker)) {
  throw new Error("R3_END_MARKER_MISSING");
}
src = src.replace(endMarker, zipHelpers + endMarker);

const outputTitleAnchor = "  const outputTitle = `${taskTitle} 成果物`;";
if (!src.includes(outputTitleAnchor)) {
  throw new Error("OUTPUT_TITLE_ANCHOR_MISSING");
}
src = src.replace(
  outputTitleAnchor,
  [
    outputTitleAnchor,
    "  const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);"
  ].join("\n")
);

const nextStepsAnchor = "  const nextSteps = aiwB6R95R3R3Lines([";
if (!src.includes(nextStepsAnchor)) {
  throw new Error("NEXT_STEPS_ANCHOR_MISSING");
}

const generatedArtifactsBlock = [
"  const generatedArtifacts = [",
"    {",
"      kind: \"main_deliverable\",",
"      title: outputTitle,",
"      file_name: \"01_main_deliverable.md\",",
"      body_markdown: bodyMarkdown",
"    },",
"    {",
"      kind: \"quality_notes\",",
"      title: \"品質メモ\",",
"      file_name: \"90_quality_notes.md\",",
"      body_markdown: qualityNotes",
"    },",
"    {",
"      kind: \"unresolved_issues\",",
"      title: \"未解決事項\",",
"      file_name: \"91_unresolved_issues.md\",",
"      body_markdown: unresolvedIssues",
"    },",
"    {",
"      kind: \"next_steps\",",
"      title: \"次工程\",",
"      file_name: \"92_next_steps.md\",",
"      body_markdown: nextSteps",
"    }",
"  ];",
""
].join("\n");

const outputPayloadAnchor = "  const outputPayload = {";
if (!src.includes(outputPayloadAnchor)) {
  throw new Error("OUTPUT_PAYLOAD_ANCHOR_MISSING");
}
src = src.replace(outputPayloadAnchor, generatedArtifactsBlock + outputPayloadAnchor);

const payloadBodyFormatAnchor = "    body_format: \"markdown\",";
if (!src.includes(payloadBodyFormatAnchor)) {
  throw new Error("PAYLOAD_BODY_FORMAT_ANCHOR_MISSING");
}
src = src.replace(
  payloadBodyFormatAnchor,
  [
    payloadBodyFormatAnchor,
    "    deliverable_package: deliverablePackage,",
    "    deliverable_link: deliverablePackage.zip_link,",
    "    generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),"
  ].join("\n")
);

const artifactBodyFormatAnchor = "      body_format: \"markdown\",";
if (!src.includes(artifactBodyFormatAnchor)) {
  throw new Error("ARTIFACT_BODY_FORMAT_ANCHOR_MISSING");
}
src = src.replace(
  artifactBodyFormatAnchor,
  [
    artifactBodyFormatAnchor,
    "      deliverable_package: deliverablePackage,",
    "      deliverable_link: deliverablePackage.zip_link,",
    "      generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),"
  ].join("\n")
);

const returnAnchor = "    outputPayload,";
if (!src.includes(returnAnchor)) {
  throw new Error("RETURN_ANCHOR_MISSING");
}
src = src.replace(
  returnAnchor,
  [
    "    deliverablePackage,",
    "    generatedArtifacts,",
    returnAnchor
  ].join("\n")
);

src = src.replaceAll(
  "\"  'deliverable_link', concat('aiworkeros://runtime_worker_output/', (select output_id from worker_output)::text),\"",
  "\"  'deliverable_link', :'deliverable_zip_link',\""
);

src = src.replace(
  "\"    'output_id', (select output_id from worker_output)\"",
  [
    "\"    'output_id', (select output_id from worker_output),\"",
    "\"    'deliverable_package', :'deliverable_package_jsonb'::jsonb,\"",
    "\"    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,\"",
    "\"    'zip_link', :'deliverable_zip_link'\""
  ].join("\n")
);

src = src.replace(
  "\"    'deliverable_kind', 'document',\"",
  [
    "\"    'deliverable_kind', 'document',\"",
    "\"    'package_kind', 'deliverable_zip',\""
  ].join("\n")
);

src = src.replace(
  "\"    'deliverable_title', :'output_title_ja',\"",
  [
    "\"    'deliverable_title', :'output_title_ja',\"",
    "\"    'package_kind', 'deliverable_zip',\"",
    "\"    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,"
  ].join("\n")
);

src = src.replace(
  "    next_steps: deliverable.nextSteps,",
  [
    "    next_steps: deliverable.nextSteps,",
    "    deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),",
    "    deliverable_zip_link: deliverable.deliverablePackage.zip_link,",
    "    generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),"
  ].join("\n")
);

const oldReturn = [
"  return psqlJson(sql, {",
"    app_surface_code: payload.app_surface_code,",
"    model_code: payload.model_code,",
"    task_domain_code: payload.task_domain_code,",
"    task_title: payload.task_title,",
"    task_instruction_ja: payload.task_instruction_ja,",
"    source_app_ref: payload.source_app_ref || \"HTTP_LOCAL\",",
"    source_request_ref: payload.source_request_ref || \"\",",
"    source_route_code: sourceRouteCode,",
"    requested_by_ref: payload.requested_by_ref || \"human\",",
"    idempotency_key: idempotencyKey,",
"    output_title_ja: deliverable.outputTitle,",
"    output_body_ja: deliverable.bodyMarkdown,",
"    output_summary_ja: deliverable.summaryText,",
"    quality_notes: deliverable.qualityNotes,",
"    unresolved_issues: deliverable.unresolvedIssues,",
"    next_steps: deliverable.nextSteps,",
"    deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),",
"    deliverable_zip_link: deliverable.deliverablePackage.zip_link,",
"    generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),",
"    robot_context_jsonb: JSON.stringify(deliverable.robotContext),",
"    generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),",
"    output_payload_jsonb: JSON.stringify(deliverable.outputPayload),",
"    artifacts_jsonb: JSON.stringify(deliverable.artifacts)",
"  });"
].join("\n");

const newReturn = [
"  const responsePayload = psqlJson(sql, {",
"    app_surface_code: payload.app_surface_code,",
"    model_code: payload.model_code,",
"    task_domain_code: payload.task_domain_code,",
"    task_title: payload.task_title,",
"    task_instruction_ja: payload.task_instruction_ja,",
"    source_app_ref: payload.source_app_ref || \"HTTP_LOCAL\",",
"    source_request_ref: payload.source_request_ref || \"\",",
"    source_route_code: sourceRouteCode,",
"    requested_by_ref: payload.requested_by_ref || \"human\",",
"    idempotency_key: idempotencyKey,",
"    output_title_ja: deliverable.outputTitle,",
"    output_body_ja: deliverable.bodyMarkdown,",
"    output_summary_ja: deliverable.summaryText,",
"    quality_notes: deliverable.qualityNotes,",
"    unresolved_issues: deliverable.unresolvedIssues,",
"    next_steps: deliverable.nextSteps,",
"    deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),",
"    deliverable_zip_link: deliverable.deliverablePackage.zip_link,",
"    generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),",
"    robot_context_jsonb: JSON.stringify(deliverable.robotContext),",
"    generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),",
"    output_payload_jsonb: JSON.stringify(deliverable.outputPayload),",
"    artifacts_jsonb: JSON.stringify(deliverable.artifacts)",
"  });",
"",
"  return aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable);"
].join("\n");

if (!src.includes(oldReturn)) {
  throw new Error("RETURN_PSQL_JSON_BLOCK_NOT_FOUND");
}
src = src.replace(oldReturn, newReturn);

const required = [
  "AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START",
  "aiwB6R95R3D1CreateZipAndAttach",
  "aiwB6R95R3D1BuildGeneratedArtifacts",
  "generated_artifacts",
  "deliverable_zip_link",
  "deliverable_package_jsonb",
  "aiworkeros_common_requester_multi_artifact_zip_contract",
  "bundle_generated_artifacts_for_single_download",
  "00_summary.md",
  "manifest.json",
  "runtime-deliverable-zips"
];

for (const needle of required) {
  if (!src.includes(needle)) {
    throw new Error(`REQUIRED_NEEDLE_MISSING:${needle}`);
  }
}

if (src.includes("AIWORKEROS_B6R95R3D_ZIP_PACKAGE_CONTRACT_START")) {
  throw new Error("OLD_FIXED_FILE_MARKER_SHOULD_NOT_EXIST");
}

fs.writeFileSync(serverPath, src, "utf8");
fs.writeFileSync(afterPath, src, "utf8");

console.log("PATCH_OK");
console.log(`SERVER_PATH=${serverPath}`);
