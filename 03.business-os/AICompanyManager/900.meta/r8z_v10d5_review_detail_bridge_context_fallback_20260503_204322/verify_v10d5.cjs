const fs = require("fs");
const corePath = process.argv[2];
const outPath = process.argv[3];
const src = fs.readFileSync(corePath, "utf8");

const out = [];
out.push("V10D5_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK/g) || []).length));
out.push("V10D5_HAS_FETCH_ROWS=" + String(src.includes("fetchRowsByContextV10D5")));
out.push("V10D5_HAS_SYNC_XHR=" + String(src.includes('xhr.open("GET", url, false)')));
out.push("V10D5_USES_CONTEXT_ENDPOINT=" + String(src.includes("/api/aicm/v2/context?owner_civilization_id=")));
out.push("V10D5_USES_WINDOW_CACHE=" + String(src.includes("__aicmR8zV10d5ContextRows")));
out.push("V10D5_SETS_STATE_REVIEW_ITEMS=" + String(src.includes("s.context.review_wait_items = rows") && src.includes("s.review_wait_items = rows")));
out.push("V10D4_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE/g) || []).length));
out.push("V10D2_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW/g) || []).length));
out.push("V10D_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD/g) || []).length));
out.push("V10C_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER/g) || []).length));
out.push("V9G8B_MARKER_COUNT=" + ((src.match(/AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE/g) || []).length));
out.push("V10D5_HAS_NO_API_POST=" + String(!src.includes("review-v10d5-post")));
fs.writeFileSync(outPath, out.join("\n") + "\n");
