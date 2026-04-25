import { handleError, ok, readJson, type RouteHandler } from "../common/http.ts";
import {
  entitlementRead,
  membershipJoinExecute,
  purchaseExecute,
  purchaseQuote,
  rentalExecute,
} from "../services/watchEntitlementService.ts";

export const tryHandleWatchEntitlementRoutes: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/streamwatch/entitlement/read") {
      return ok(req, await entitlementRead(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/purchase/quote") {
      return ok(req, await purchaseQuote(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/purchase/execute") {
      return ok(req, await purchaseExecute(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/rental/execute") {
      return ok(req, await rentalExecute(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/membership/join/execute") {
      return ok(req, await membershipJoinExecute(await readJson(req)));
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
