import fs from 'node:fs';

const url = process.argv[2];
const outPath = process.argv[3];
const token = process.argv[4] || '';

const headers = {};
if (token) headers.authorization = 'Bearer ' + token;

try {
  const response = await fetch(url, { method: 'GET', headers });
  const text = await response.text();
  fs.writeFileSync(outPath, text, 'utf8');
  console.log(JSON.stringify({
    ok: response.ok,
    status: response.status,
    url,
    outPath
  }, null, 2));
  process.exit(response.ok ? 0 : 2);
} catch (error) {
  fs.writeFileSync(outPath, JSON.stringify({
    fetch_error: error && error.message ? error.message : String(error)
  }, null, 2), 'utf8');
  console.log(JSON.stringify({
    ok: false,
    fetch_error: error && error.message ? error.message : String(error),
    url,
    outPath
  }, null, 2));
  process.exit(3);
}
