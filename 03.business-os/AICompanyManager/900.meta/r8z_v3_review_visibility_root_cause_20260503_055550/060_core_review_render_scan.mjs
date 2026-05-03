import fs from "fs";

const corePath = process.env.CORE;
const out = process.env.CORE_SCAN_JSON;
const src = fs.readFileSync(corePath, "utf8");

const patterns = [
  "review_wait_items",
  "renderReview",
  "review-list",
  "human-review",
  "delivery_summary",
  "納品サマリー",
  "レビュー・承認待ち"
];

const hits = [];
const lines = src.split(/\r?\n/);
for (let i = 0; i < lines.length; i += 1) {
  for (const p of patterns) {
    if (lines[i].includes(p)) {
      hits.push({
        line: i + 1,
        pattern: p,
        text: lines[i].slice(0, 260)
      });
      break;
    }
  }
}

const reviewWaitRefs = (src.match(/review_wait_items/g) || []).length;
const renderReviewRefs = (src.match(/renderReview/g) || []).length;
const reviewListRefs = (src.match(/review-list/g) || []).length;
const deliverySummaryRefs = (src.match(/delivery_summary/g) || []).length;

const result = {
  result: "ok",
  core_path: corePath,
  counts: {
    review_wait_items_refs: reviewWaitRefs,
    renderReview_refs: renderReviewRefs,
    review_list_refs: reviewListRefs,
    delivery_summary_refs: deliverySummaryRefs
  },
  hit_count: hits.length,
  hits: hits.slice(0, 120)
};

fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
