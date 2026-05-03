const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

const marker = "AICM_R8Z_V10GC4E_REVIEW_EMPTY_RED_BORDER_CLEANUP";

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), "g")) || []).length;
}

function removeMarkedBlock() {
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  const oldLen = src.length;
  src = src.replace(re, "\n");
  log.push("REMOVED_" + marker + "=" + (oldLen !== src.length));
}

function patchWindowAroundNeedle(needle) {
  let patchedCount = 0;
  let pos = 0;

  while (true) {
    const idx = src.indexOf(needle, pos);
    if (idx < 0) break;

    const start = Math.max(0, idx - 2500);
    const end = Math.min(src.length, idx + 2500);
    const chunk = src.slice(start, end);

    const looksLikeEmptyReview =
      chunk.includes("レビュー・承認待ち") &&
      (
        chunk.includes("rows=0") ||
        chunk.includes("payloadRows=0") ||
        chunk.includes("V10D2") ||
        chunk.includes("承認待ち: 0件") ||
        chunk.includes("レビュー・承認待ちはありません")
      );

    const hasRedBorder =
      /border\s*:\s*(?:2px|3px|4px)\s+solid\s+(?:#ef4444|#dc2626|red)/.test(chunk) ||
      /border-color\s*:\s*(?:#ef4444|#dc2626|red)/.test(chunk);

    if (looksLikeEmptyReview && hasRedBorder) {
      let nextChunk = chunk;

      nextChunk = nextChunk.replace(/border\s*:\s*4px\s+solid\s*#ef4444/g, "border:1px solid #e5e7eb");
      nextChunk = nextChunk.replace(/border\s*:\s*3px\s+solid\s*#ef4444/g, "border:1px solid #e5e7eb");
      nextChunk = nextChunk.replace(/border\s*:\s*2px\s+solid\s*#ef4444/g, "border:1px solid #e5e7eb");

      nextChunk = nextChunk.replace(/border\s*:\s*4px\s+solid\s*#dc2626/g, "border:1px solid #e5e7eb");
      nextChunk = nextChunk.replace(/border\s*:\s*3px\s+solid\s*#dc2626/g, "border:1px solid #e5e7eb");
      nextChunk = nextChunk.replace(/border\s*:\s*2px\s+solid\s*#dc2626/g, "border:1px solid #e5e7eb");

      nextChunk = nextChunk.replace(/border\s*:\s*4px\s+solid\s*red/g, "border:1px solid #e5e7eb");
      nextChunk = nextChunk.replace(/border\s*:\s*3px\s+solid\s*red/g, "border:1px solid #e5e7eb");
      nextChunk = nextChunk.replace(/border\s*:\s*2px\s+solid\s*red/g, "border:1px solid #e5e7eb");

      nextChunk = nextChunk.replace(/border-color\s*:\s*#ef4444/g, "border-color:#e5e7eb");
      nextChunk = nextChunk.replace(/border-color\s*:\s*#dc2626/g, "border-color:#e5e7eb");
      nextChunk = nextChunk.replace(/border-color\s*:\s*red/g, "border-color:#e5e7eb");

      nextChunk = nextChunk.replace(/background\s*:\s*#fef2f2/g, "background:#ffffff");
      nextChunk = nextChunk.replace(/background\s*:\s*#fee2e2/g, "background:#ffffff");

      if (nextChunk !== chunk) {
        src = src.slice(0, start) + nextChunk + src.slice(end);
        patchedCount += 1;
        pos = start + nextChunk.length;
        continue;
      }
    }

    pos = idx + needle.length;
  }

  return patchedCount;
}

analysis.push("BEFORE_V10GC4E_MARKER_COUNT=" + count(src, marker));
analysis.push("BEFORE_BAD_EMPTY_TEXT_COUNT=" + count(src, "レビュー待ちが取得できません"));
analysis.push("BEFORE_GOOD_EMPTY_TEXT_COUNT=" + count(src, "レビュー・承認待ちはありません"));
analysis.push("BEFORE_RED_BORDER_EF_COUNT=" + count(src, "border:3px solid #ef4444") + count(src, "border:4px solid #ef4444"));
analysis.push("BEFORE_RED_BORDER_DC_COUNT=" + count(src, "border:3px solid #dc2626") + count(src, "border:4px solid #dc2626"));

removeMarkedBlock();

const patchedWindows = patchWindowAroundNeedle("レビュー・承認待ちはありません");

src += `

// ${marker}_START
// pending=0 review empty-state card should not look like an error.
// Red border cleanup is limited to the empty review-state window.
// ${marker}_END
`;

analysis.push("PATCHED_WINDOWS=" + patchedWindows);
analysis.push("AFTER_V10GC4E_MARKER_COUNT=" + count(src, marker));
analysis.push("AFTER_BAD_EMPTY_TEXT_COUNT=" + count(src, "レビュー待ちが取得できません"));
analysis.push("AFTER_GOOD_EMPTY_TEXT_COUNT=" + count(src, "レビュー・承認待ちはありません"));
analysis.push("AFTER_RED_BORDER_EF_COUNT=" + count(src, "border:3px solid #ef4444") + count(src, "border:4px solid #ef4444"));
analysis.push("AFTER_RED_BORDER_DC_COUNT=" + count(src, "border:3px solid #dc2626") + count(src, "border:4px solid #dc2626"));
analysis.push("PATCH_CHANGED=" + (src !== before));

if (patchedWindows < 1) {
  analysis.push("PATCH_DECISION=NO_EMPTY_RED_BORDER_WINDOW_FOUND_MARKER_ONLY");
} else {
  analysis.push("PATCH_DECISION=PATCH_APPLIED");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
