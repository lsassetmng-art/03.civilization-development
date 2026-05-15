const fs = require("fs");

const responsePath = process.argv[2];
const outPath = process.argv[3];

const raw = fs.existsSync(responsePath) ? fs.readFileSync(responsePath, "utf8") : "";
const lines = [];

lines.push("# parsed response");
lines.push("RAW_LENGTH=" + raw.length);

try {
  const json = JSON.parse(raw || "{}");
  lines.push("JSON_PARSE=PASS");
  lines.push("TOP_KEYS=" + Object.keys(json).join(","));
  for (const key of ["ok", "result", "reason", "message", "error", "details", "hint", "code", "stderr"]) {
    if (json[key] !== undefined) {
      lines.push(key.toUpperCase() + "=" + String(json[key]).slice(0, 3000));
    }
  }
  lines.push("");
  lines.push("JSON_PRETTY_BEGIN");
  lines.push(JSON.stringify(json, null, 2).slice(0, 8000));
  lines.push("JSON_PRETTY_END");
} catch (e) {
  lines.push("JSON_PARSE=FAIL");
  lines.push("ERROR=" + e.message);
  lines.push("RAW_PREVIEW=" + raw.slice(0, 4000));
}

fs.writeFileSync(outPath, lines.join("\n") + "\n");
