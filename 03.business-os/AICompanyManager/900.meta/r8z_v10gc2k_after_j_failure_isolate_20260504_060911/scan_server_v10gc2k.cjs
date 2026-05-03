const fs = require("fs");

const serverPath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(serverPath, "utf8");
const lines = src.split(/\n/);

function count(s) {
  return (src.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function around(pattern, before = 25, after = 35) {
  const out = [];
  lines.forEach((line, idx) => {
    if (line.includes(pattern)) {
      const s = Math.max(0, idx - before);
      const e = Math.min(lines.length, idx + after);
      out.push("---- hit line " + (idx + 1) + " pattern=" + pattern + " ----\n" + lines.slice(s, e).join("\n"));
    }
  });
  return out.join("\n\n");
}

let out = "";
out += "SERVER_APPROVE_FUNCTION_COUNT=" + count("function approveHumanReviewItem") + "\n";
out += "SERVER_RETURN_FUNCTION_COUNT=" + count("function returnHumanReviewItem") + "\n";
out += "SERVER_APPROVE_ROUTE_COUNT=" + count("/api/aicm/v2/human-review/approve") + "\n";
out += "SERVER_RETURN_ROUTE_COUNT=" + count("/api/aicm/v2/human-review/return") + "\n";
out += "SERVER_REQUIRES_OWNER_COUNT=" + count("owner_civilization_id") + "\n";
out += "SERVER_REQUIRES_REVIEWER_COUNT=" + count("human_reviewer_label") + "\n";
out += "SERVER_REQUIRES_REVIEW_ITEM_ID_COUNT=" + count("aicm_human_review_item_id") + "\n";
out += "\n============================================================\n";
out += "approveHumanReviewItem around\n";
out += "============================================================\n";
out += around("function approveHumanReviewItem", 5, 80) || "NO_HIT";
out += "\n\n============================================================\n";
out += "returnHumanReviewItem around\n";
out += "============================================================\n";
out += around("function returnHumanReviewItem", 5, 80) || "NO_HIT";
out += "\n\n============================================================\n";
out += "routes around\n";
out += "============================================================\n";
out += around("/api/aicm/v2/human-review/approve", 20, 35) || "NO_HIT";

fs.writeFileSync(outPath, out, "utf8");
