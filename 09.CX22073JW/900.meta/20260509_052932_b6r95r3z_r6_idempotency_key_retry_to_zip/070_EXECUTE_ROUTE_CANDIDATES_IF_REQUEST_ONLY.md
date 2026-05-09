# Execute route candidates if request route only

SELECTED_ROUTE=/aiworker/v1/runtime-execution/request

## POST key result
STATUS=400
HAS_ZIP_HINT=NO
HAS_GENERATED_ARTIFACTS=NO
LOOKS_REQUEST_ONLY=NO
RESPONSE_FILE=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_052932_b6r95r3z_r6_idempotency_key_retry_to_zip/052_post_response.json
DIAGNOSIS=POST_STATUS_NOT_2XX

## Candidate route lines
414:  Common requester-facing deliverable contract for AIWorkerOS runtime execution.
419:  - AIWorkerOS creates the deliverable body and first summary.
420:  - Requester apps store summary_text plus deliverable_ref / deliverable_link.
486:  const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
488:    `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
508:    "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
557:      kind: "main_deliverable",
559:      file_name: "01_main_deliverable.md",
583:    contract_name: "aiworkeros_common_requester_deliverable_contract",
584:    deliverable_kind: "document",
586:    deliverable_package: deliverablePackage,
587:    deliverable_link: deliverablePackage.zip_link,
588:    generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
608:      deliverable_package: deliverablePackage,
609:      deliverable_link: deliverablePackage.zip_link,
610:      generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
631:    deliverablePackage,
640:  Multi-artifact deliverable zip package contract.
643:  - AIWorkerOS creates one or more deliverable artifacts from the instruction.
645:  - AIWorkerOS bundles generated artifacts into one deliverable zip.
646:  - Requester apps display summary_text and link to the zip.
647:  - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.
656:  const raw = String(value || fallback || "deliverable").trim();
658:  return safe || String(fallback || "deliverable");
663:  const zipId = `${Date.now()}_${crypto.randomUUID()}`;
665:  const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
666:  const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;
669:  // The package metadata is saved to DB before the zip file is written.
670:  // Therefore file_name / zip_link must already use the exact sanitized filename
672:  const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
673:    ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
674:    : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
675:  const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
678:    package_kind: "deliverable_zip",
679:    package_format: "zip",
680:    mime_type: "application/zip",
681:    zip_id: zipId,
683:    zip_link: zipLink,
684:    zip_ref: {
686:      storage_code: "runtime-deliverable-zip",
711:function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
712:  const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
719:      kind: "main_deliverable",
720:      title: deliverable?.outputTitle || "主成果物",
721:      file_name: "01_main_deliverable.md",
722:      body_markdown: deliverable?.bodyMarkdown || ""
726:  if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
731:      body_markdown: deliverable.qualityNotes
735:  if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {
740:      body_markdown: deliverable.unresolvedIssues
744:  if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {
749:      body_markdown: deliverable.nextSteps
846:function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
851:  const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
852:  const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);
854:  const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
855:  fs.mkdirSync(zipDir, { recursive: true });
857:  const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
858:    ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
859:    : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
860:  const zipPath = path.join(zipDir, fileName);
863:  // Keep the returned zip link aligned with the actual sanitized filename written to disk.
864:  const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
865:  const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
867:    storage_code: "runtime-deliverable-zip",
871:  const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
874:    contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
875:    package_purpose: "bundle_generated_artifacts_for_single_download",
878:    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
881:    generated_artifacts: generatedArtifacts.map((artifact) => ({
888:    deliverable_ref: response.deliverable_ref || null,
889:    robot_context: response.robot_context || deliverable?.robotContext || null,
890:    generation_basis: response.generation_basis || deliverable?.generationBasis || null,
904:  const zipBuffer = aiwB6R95R3D1ZipStored(entries);
905:  fs.writeFileSync(zipPath, zipBuffer);
906:  const stat = fs.statSync(zipPath);
908:  const zipPublic = {
909:    package_kind: "deliverable_zip",
910:    package_format: "zip",
911:    mime_type: "application/zip",
912:    zip_id: packageMeta.zip_id,
914:    zip_link: actualZipLink,
915:    zip_ref: actualZipRef,
922:  response.generated_artifacts = generatedArtifacts.map((artifact) => ({
929:  response.deliverable_package = zipPublic;
930:  response.deliverable_zip_ref = actualZipRef;
931:  response.deliverable_link = actualZipLink;
935:    deliverable_link: actualZipLink,
936:    deliverable_package: zipPublic,
937:    deliverable_zip_ref: actualZipRef,
938:    generated_artifacts: response.generated_artifacts
941:  response.deliverable = Object.assign({}, response.deliverable || {}, {
942:    deliverable_package: zipPublic,
943:    zip_link: actualZipLink,
944:    generated_artifacts: response.generated_artifacts
974:  const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);
1018:    "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
1019:    "    'package_kind', 'deliverable_zip',",
1020:    "    'deliverable_kind', 'document',",
1023:    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
1024:    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
1031:    "    'zip_link', :'deliverable_zip_link'",
1033:    "  'deliverable_ref', jsonb_build_object(",
1039:    "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
1041:    "    'deliverable_title', :'output_title_ja',",
1042:    "    'package_kind', 'deliverable_zip',",
1043:    "    'deliverable_kind', 'document',",
1045:    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
1046:    "    'deliverable_link', :'deliverable_zip_link',",
1047:    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
1048:    "    'deliverable_ref', jsonb_build_object(",
1074:    output_title_ja: deliverable.outputTitle,
1075:    output_body_ja: deliverable.bodyMarkdown,
1076:    output_summary_ja: deliverable.summaryText,
1077:    quality_notes: deliverable.qualityNotes,
1078:    unresolved_issues: deliverable.unresolvedIssues,
1079:    next_steps: deliverable.nextSteps,
1080:    deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
1081:    deliverable_zip_link: deliverable.deliverablePackage.zip_link,
1082:    generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
1083:    robot_context_jsonb: JSON.stringify(deliverable.robotContext),
1084:    generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
1085:    output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
1086:    artifacts_jsonb: JSON.stringify(deliverable.artifacts)
1089:  return aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable);
