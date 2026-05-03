const base = String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const url = base + "/health";

try {
  const res = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
  const text = await res.text();
  console.log(JSON.stringify({
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    url,
    body_preview: text.slice(0, 1000)
  }, null, 2));
  process.exit(res.ok ? 0 : 1);
} catch (error) {
  console.log(JSON.stringify({
    ok: false,
    status: 0,
    url,
    error_message: String(error && error.message ? error.message : error)
  }, null, 2));
  process.exit(1);
}
