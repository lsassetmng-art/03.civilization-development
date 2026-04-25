import { handleError, ok, pathParts, readJson, type RouteHandler } from "../common/http.ts";
import {
  createPublishRequest,
  getPublishHistory,
  savePublishSetting,
  schedulePublish,
  validatePublishReadiness,
} from "../services/studioPublishService.ts";

export const tryHandleStudioPublishRoute: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);
    const parts = pathParts(req);

    if (req.method === "POST" && url.pathname === "/api/stream-studio/publish-requests") {
      return ok(req, await createPublishRequest(await readJson(req)), 201);
    }

    if (req.method === "POST" && url.pathname === "/api/stream-studio/publish-requests/schedule") {
      return ok(req, await schedulePublish(await readJson(req)));
    }

    if (req.method === "GET" && url.pathname === "/api/stream-studio/publish-history") {
      return ok(req, await getPublishHistory(url.searchParams));
    }

    if (
      parts.length >= 4 &&
      parts[0] === "api" &&
      parts[1] === "stream-studio" &&
      parts[2] === "publish-settings"
    ) {
      const publish_ref = parts[3];
      if (req.method === "PUT" && parts.length === 4) {
        return ok(req, await savePublishSetting(publish_ref, await readJson(req)));
      }
      if (req.method === "POST" && parts.length === 5 && parts[4] === "validate") {
        return ok(req, await validatePublishReadiness(publish_ref));
      }
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
