import { handleError, ok, readJson, type RouteHandler } from "../common/http.ts";
import { progressUpsert } from "../services/watchContinuityService.ts";

export const tryHandleWatchContinuityRoutes: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/streamwatch/progress/upsert") {
      return ok(req, await progressUpsert(await readJson(req)));
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
