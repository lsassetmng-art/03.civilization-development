import { optionsResponse, jsonResponse } from "../aiod_http_response.js";
import { handleHealthRoute } from "./health_route.js";
import { handleReadRoute } from "./read_routes.js";
import { handleWriteRoute } from "./write_routes.js";

function notFound(path, method) {
  return jsonResponse(
    {
      ok: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found.",
        details: { path, method }
      }
    },
    404
  );
}

export async function dispatchRoute(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method.toUpperCase();

  if (method === "OPTIONS") {
    return optionsResponse();
  }

  if (method === "GET" && path === "/api/ai-operation-desk/health") {
    return handleHealthRoute();
  }

  if (method === "GET") {
    const readRes = await handleReadRoute(path);
    if (readRes) {
      return readRes;
    }
  }

  if (method === "POST" || method === "PUT") {
    const writeRes = await handleWriteRoute(req, path, method);
    if (writeRes) {
      return writeRes;
    }
  }

  return notFound(path, method);
}
