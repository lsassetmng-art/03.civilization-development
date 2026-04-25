const PORT = Number(Deno.env.get("AIOD_WEB_PORT") || "8087");
const ROOT = Deno.env.get("AIOD_WEB_ROOT") || `${Deno.cwd()}/030.frontend/web`;

function contentType(path: string): string {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

Deno.serve({ port: PORT }, async (req: Request) => {
  const url = new URL(req.url);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const fullPath = `${ROOT}${pathname}`;

  try {
    const data = await Deno.readFile(fullPath);
    return new Response(data, {
      status: 200,
      headers: {
        "content-type": contentType(fullPath),
        "cache-control": "no-store"
      }
    });
  } catch (_e) {
    return new Response(`not found: ${pathname}`, {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  }
});
