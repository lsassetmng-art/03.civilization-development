const fs = require("fs");
const corePath = process.argv[2];
const outPath = process.argv[3];
const src = fs.readFileSync(corePath, "utf8");

const out = [];
out.push("V10C_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER/g) || []).length));
out.push("HAS_V10C_RENDER_FUNCTION=" + String(src.includes("function v10cRenderReviewList")));
out.push("V10C_OVERRIDES_V7_WINDOW_RENDERER=" + String(src.includes("window.aicmR8zV7RenderReviewList = v10cRenderReviewList")));
out.push("V10C_USES_SYNC_XHR=" + String(src.includes('xhr.open("GET", url, false)')));
out.push("V10C_USES_REVIEW_WAIT_ITEMS=" + String(src.includes("review_wait_items")));
out.push("V10C_HAS_APPROVE_BUTTON=" + String(src.includes('data-core-action="human-review-approve"')));
out.push("V10C_HAS_RETURN_BUTTON=" + String(src.includes('data-core-action="human-review-return"')));
out.push("V9G8B_DELETE_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE/g) || []).length));
out.push("SERVER_PATCH_EXPECTED=NO");
fs.writeFileSync(outPath, out.join("\n") + "\n");
