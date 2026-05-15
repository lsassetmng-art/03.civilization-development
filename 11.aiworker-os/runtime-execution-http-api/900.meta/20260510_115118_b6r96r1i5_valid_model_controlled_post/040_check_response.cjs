const fs = require("fs");

const [,, responsePath, outPath] = process.argv;
const text = fs.existsSync(responsePath) ? fs.readFileSync(responsePath, "utf8") : "";
let parsed = null;

try {
  parsed = text ? JSON.parse(text) : null;
} catch (e) {
  fs.writeFileSync(outPath, "JSON_PARSE=FAIL\nERROR=" + e.message + "\nRAW_PREVIEW=" + text.slice(0, 1000) + "\n");
  process.exit(0);
}

function findPayload(obj, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 10) return null;

  if (obj.requester_delivery_payload && typeof obj.requester_delivery_payload === "object") {
    return obj.requester_delivery_payload;
  }

  if (obj.deliverable && typeof obj.deliverable === "object" && (obj.deliverable.body_markdown || obj.deliverable.body_text)) {
    return obj.deliverable;
  }

  for (const value of Object.values(obj)) {
    const found = findPayload(value, depth + 1);
    if (found) return found;
  }

  return null;
}

const payload = findPayload(parsed);
const body = payload ? String(payload.body_markdown || payload.body_text || "") : "";
const summary = payload ? String(payload.summary_text || "") : "";
const performance = payload && payload.performance_profile && typeof payload.performance_profile === "object";
const reference = payload && payload.reference_usage_profile && typeof payload.reference_usage_profile === "object";

const lines = [];
lines.push("JSON_PARSE=PASS");
lines.push("TOP_KEYS=" + (parsed && typeof parsed === "object" ? Object.keys(parsed).join(",") : ""));
lines.push("RESULT=" + String(parsed && parsed.result !== undefined ? parsed.result : ""));
lines.push("ERROR_CODE=" + String(parsed && parsed.error_code !== undefined ? parsed.error_code : ""));
lines.push("MESSAGE=" + String(parsed && parsed.message !== undefined ? parsed.message : "").slice(0, 2000));
lines.push("HAS_REQUESTER_DELIVERY_PAYLOAD=" + (payload ? "YES" : "NO"));
lines.push("BODY_MARKDOWN_LENGTH=" + body.length);
lines.push("SUMMARY_TEXT_LENGTH=" + summary.length);
lines.push("HAS_PERFORMANCE_PROFILE=" + (performance ? "YES" : "NO"));
lines.push("HAS_REFERENCE_USAGE_PROFILE=" + (reference ? "YES" : "NO"));

if (payload) {
  lines.push("");
  lines.push("DELIVERABLE_TITLE=" + String(payload.deliverable_title || ""));
  lines.push("DELIVERABLE_KIND=" + String(payload.deliverable_kind || ""));
  lines.push("MINIMUM_GUARANTEE_STATUS=" + String(payload.minimum_guarantee_status || ""));
  lines.push("");
  lines.push("BODY_PREVIEW_BEGIN");
  lines.push(body.slice(0, 1600));
  lines.push("BODY_PREVIEW_END");
}

fs.writeFileSync(outPath, lines.join("\n") + "\n");
