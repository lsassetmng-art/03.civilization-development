const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];
const analysisPath = process.argv[4];

const src = fs.readFileSync(corePath, "utf8");
const analysis = fs.existsSync(analysisPath) ? fs.readFileSync(analysisPath, "utf8") : "";

const out = [];
out.push("V10F2G_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE/g) || []).length));
out.push("V10F2G_HAS_HELPER=" + String(src.includes("function aicmR8zV10f2gClearSectionNewEntryState")));
out.push("V10F2G_CLEARS_SELECTED_SECTION=" + String(src.includes('state.selectedSectionId = ""') && src.includes("state.selectedSection = null") && src.includes("state.currentSection = null")));
out.push("V10F2G_CLEARS_PLACEMENT_DRAFTS=" + String(src.includes("state.sectionPlacementDraft = []") && src.includes("state.workerPlacementDraft = []")));
out.push("V10F2G_HAS_GO_OR_RENDER_CALL=" + String(src.includes("AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_GO_CALL") || src.includes("AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE_RENDER_BRANCH_CALL")));
out.push("V10F2G_HAS_NO_HTML_POST_REPLACE=" + String(!src.includes("v10f2SanitizeSectionNewWorkerBlock")));
out.push("V10F2G_HAS_NO_RENDER_SECTION_NEW_WRAP=" + String(!src.includes("renderSectionNewV10F2Guarded")));
out.push("V10F2G_HAS_NO_SELECTED_SECTION_BACKUP=" + String(!src.includes("backup.selectedSectionId")));
out.push("V10F2G_HAS_NO_API_POST=" + String(!src.includes("section-new-worker-post-v10f2g")));
out.push("PATCH_DECISION=" + ((analysis.match(/^PATCH_DECISION=(.*)$/m) || [,""])[1]));
out.push("GO_ASSIGNMENT_CANDIDATE_COUNT=" + ((analysis.match(/^GO_ASSIGNMENT_CANDIDATE_COUNT=(.*)$/m) || [,"0"])[1]));
out.push("V10F_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10F_REVIEW_APPROVE_RETURN_CONFIRM_UI/g) || []).length));
out.push("V10D5_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK/g) || []).length));
out.push("V9G8B_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE/g) || []).length));

fs.writeFileSync(outPath, out.join("\n") + "\n");
