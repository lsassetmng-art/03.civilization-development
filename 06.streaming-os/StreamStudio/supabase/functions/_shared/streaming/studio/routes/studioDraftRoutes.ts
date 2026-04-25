import { handleError, ok, pathParts, readJson, type RouteHandler } from "../common/http.ts";
import { createVideoDraft, updateMetadata } from "../services/studioDraftService.ts";

export const tryHandleStudioDraftRoute: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);
    const parts = pathParts(req);

    if (req.method === "POST" && url.pathname === "/api/stream-studio/video-drafts") {
      return ok(req, await createVideoDraft(await readJson(req)), 201);
    }

    if (
      req.method === "PATCH" &&
      parts.length === 5 &&
      parts[0] === "api" &&
      parts[1] === "stream-studio" &&
      parts[2] === "video-drafts" &&
      parts[4] == "metadata"
    ) {
      return ok(req, await updateMetadata(parts[3], await readJson(req)));
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
