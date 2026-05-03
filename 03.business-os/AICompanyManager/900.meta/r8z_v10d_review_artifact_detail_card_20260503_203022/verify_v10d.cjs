const fs = require("fs");
const corePath = process.argv[2];
const outPath = process.argv[3];
const src = fs.readFileSync(corePath, "utf8");

const out = [];
out.push("V10D_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD/g) || []).length));
out.push("HAS_V10D_RENDER_FUNCTION=" + String(src.includes("function renderReviewList(appState)")));
out.push("V10D_OVERRIDES_V7_WINDOW_RENDERER=" + String(src.includes("window.aicmR8zV7RenderReviewList = renderReviewList")));
out.push("V10D_HAS_DETAIL_BUTTON=" + String(src.includes('data-core-action="review-v10d-open-detail"')));
out.push("V10D_HAS_DETAIL_CARD=" + String(src.includes("成果物確認")));
out.push("V10D_HAS_PREVIEW_APPROVE=" + String(src.includes('data-core-action="review-v10d-preview-approve"')));
out.push("V10D_HAS_PREVIEW_RETURN=" + String(src.includes('data-core-action="review-v10d-preview-return"')));
out.push("V10D_HAS_CLICK_BRIDGE=" + String(src.includes("__aicmR8zV10dReviewDetailClickBridge")));
out.push("V10D_HAS_NO_API_POST=" + String(!src.includes("review-v10d-approve-post")));
out.push("V10C_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER/g) || []).length));
out.push("V9G8B_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE/g) || []).length));
out.push("SERVER_PATCH_EXPECTED=NO");
fs.writeFileSync(outPath, out.join("\n") + "\n");
