const url = process.argv[2];
const token = process.argv[3] || "";
const method = process.argv[4] || "GET";
const bodyText = process.argv[5] || "";

async function main() {
  const headers = { "accept": "application/json" };

  if (token) {
    headers.authorization = "Bearer " + token;
  }

  if (bodyText) {
    headers["content-type"] = "application/json";
  }

  const options = { method, headers };
  if (bodyText) options.body = bodyText;

  try {
    const response = await fetch(url, options);
    const text = await response.text();

    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (_) {
      json = null;
    }

    console.log(JSON.stringify({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url,
      body_preview: text.slice(0, 2000),
      json
    }, null, 2));

    process.exit(response.ok ? 0 : 2);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      fetch_error: error && error.message ? error.message : String(error),
      url
    }, null, 2));
    process.exit(3);
  }
}

main();
