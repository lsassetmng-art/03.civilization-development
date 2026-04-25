import { handleError, ok, readJson, type RouteHandler } from "../common/http.ts";
import { tvHandoffClaim, tvHandoffStart } from "../services/watchHandoffService.ts";

export const tryHandleWatchHandoffRoutes: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/streamwatch/tv-handoff/start") {
      return ok(req, await tvHandoffStart(await readJson(req)), 201);
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/tv-handoff/claim") {
      return ok(req, await tvHandoffClaim(await readJson(req)));
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
