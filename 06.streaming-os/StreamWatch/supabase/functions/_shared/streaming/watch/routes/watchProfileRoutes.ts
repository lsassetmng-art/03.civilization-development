import { handleError, ok, readJson, type RouteHandler } from "../common/http.ts";
import { profileList, profileSelect } from "../services/watchProfileService.ts";

export const tryHandleWatchProfileRoutes: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/streamwatch/profile/list") {
      return ok(req, await profileList(url.searchParams));
    }

    if (req.method === "POST" && url.pathname === "/streamwatch/profile/select") {
      return ok(req, await profileSelect(await readJson(req)));
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
