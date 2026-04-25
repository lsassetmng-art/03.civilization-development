import { fail, type RouteHandler } from "../common/http.ts";

export const tryHandleWatchModerationStubRoutes: RouteHandler = async (req) => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/streamwatch/comment/submit") {
    return fail(req, "DEFERRED_ROUTE", "comment_submit is deferred in phase1", {
      route: url.pathname,
      reason: "moderation and storage flow not fixed yet",
    }, 501);
  }

  if (req.method === "POST" && url.pathname === "/streamwatch/report/submit") {
    return fail(req, "DEFERRED_ROUTE", "report_submit is deferred in phase1", {
      route: url.pathname,
      reason: "abuse reporting storage flow not fixed yet",
    }, 501);
  }

  return null;
};
