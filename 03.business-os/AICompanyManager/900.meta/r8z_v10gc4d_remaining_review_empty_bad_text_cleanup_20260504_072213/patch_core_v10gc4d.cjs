const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");
const before = src;
const log = [];
const analysis = [];

function countNeedle(text, needle) {
  return text.split(needle).length - 1;
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeMarkedBlock(marker) {
  const re = new RegExp(
    "\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?",
    "g"
  );
  const oldLen = src.length;
  src = src.replace(re, "\n");
  log.push("REMOVED_" + marker + "=" + (oldLen !== src.length));
}

const marker = "AICM_R8Z_V10GC4D_REMAINING_REVIEW_EMPTY_BAD_TEXT_CLEANUP";

analysis.push("BEFORE_BAD_TEXT_COUNT=" + countNeedle(src, "レビュー待ちが取得できません"));
analysis.push("BEFORE_GOOD_TEXT_COUNT=" + countNeedle(src, "レビュー・承認待ちはありません"));
analysis.push("BEFORE_V10GC4D_MARKER_COUNT=" + countNeedle(src, marker));

removeMarkedBlock(marker);

src = src.replace(/レビュー待ちが取得できません/g, "レビュー・承認待ちはありません");
src = src.replace(/レビュー待ちを取得できません/g, "レビュー・承認待ちはありません");

// 旧エラー空状態の赤枠が同じ表示ブロックに残っている場合の保険。
// 全体の危険な赤系style置換は避け、文字列置換後でも残りやすい代表styleだけを穏当化する。
src = src.replace(/border\s*:\s*3px\s+solid\s*#ef4444/g, "border:1px solid #e5e7eb");
src = src.replace(/border\s*:\s*3px\s+solid\s*#dc2626/g, "border:1px solid #e5e7eb");
src = src.replace(/border\s*:\s*3px\s+solid\s*red/g, "border:1px solid #e5e7eb");
src = src.replace(/background\s*:\s*#fef2f2/g, "background:#ffffff");
src = src.replace(/background\s*:\s*#fee2e2/g, "background:#ffffff");

src += `

// ${marker}_START
// Remaining old empty-state wording removed.
// pending=0 is a valid empty state, not a fetch failure.
// ${marker}_END
`;

analysis.push("AFTER_BAD_TEXT_COUNT=" + countNeedle(src, "レビュー待ちが取得できません"));
analysis.push("AFTER_GOOD_TEXT_COUNT=" + countNeedle(src, "レビュー・承認待ちはありません"));
analysis.push("AFTER_V10GC4D_MARKER_COUNT=" + countNeedle(src, marker));
analysis.push("PATCH_CHANGED=" + (src !== before));

if (src === before) {
  analysis.push("PATCH_DECISION=STOP_NO_CHANGE");
  fs.writeFileSync(logPath, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

analysis.push("PATCH_DECISION=PATCH_APPLIED");

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
