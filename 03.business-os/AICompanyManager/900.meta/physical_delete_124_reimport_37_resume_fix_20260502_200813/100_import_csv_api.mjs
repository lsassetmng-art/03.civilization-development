import fs from "node:fs";

const csvPath = process.argv[2];
const ownerId = process.argv[3];
const companyId = process.argv[4];
const port = process.argv[5];

const csvText = fs.readFileSync(csvPath, "utf8");
const endpoint = `http://127.0.0.1:${port}/api/aicm/v2/manager-major/import-csv`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    owner_civilization_id: ownerId,
    aicm_user_company_id: companyId,
    csv_text: csvText,
    csvText: csvText
  })
});

const text = await response.text();
let json = null;

try {
  json = text ? JSON.parse(text) : null;
} catch (_) {
  json = { raw_response_text: text };
}

const result = {
  http_status: response.status,
  ok: response.ok,
  endpoint,
  json
};

console.log(JSON.stringify(result, null, 2));

if (!response.ok || !json || json.result !== "ok") {
  process.exit(1);
}
