import { ok, readJson } from "../common/http.ts";
import { readProfileList, selectProfile } from "../services/profileService.ts";
import { readHomeFeed, readCategoryTreeService, search, readSeriesDetail } from "../services/discoveryService.ts";
import { readLibrary, readEntitlement, followUpsert, savedListMutate, watchQueueMutate } from "../services/libraryService.ts";
import { progressUpsert } from "../services/playbackService.ts";
import { tvHandoffClaim, tvHandoffStart } from "../services/tvHandoffService.ts";

export async function routeWatchPhase1(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/streamwatch/profile/list") {
    return ok(req, await readProfileList({
      actor_civilization_id: url.searchParams.get("actor_civilization_id") ?? undefined
    }));
  }

  if (req.method === "POST" && pathname === "/streamwatch/profile/select") {
    return ok(req, await selectProfile(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/home-feed/read") {
    return ok(req, await readHomeFeed(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/category-tree/read") {
    return ok(req, await readCategoryTreeService(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/search") {
    return ok(req, await search(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/series/detail/read") {
    return ok(req, await readSeriesDetail(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/library/read") {
    return ok(req, await readLibrary(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/follow/upsert") {
    return ok(req, await followUpsert());
  }

  if (req.method === "POST" && pathname === "/streamwatch/saved-list/mutate") {
    return ok(req, await savedListMutate(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/watch-queue/mutate") {
    return ok(req, await watchQueueMutate(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/progress/upsert") {
    return ok(req, await progressUpsert(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/tv-handoff/start") {
    return ok(req, await tvHandoffStart(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/tv-handoff/claim") {
    return ok(req, await tvHandoffClaim(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/entitlement/read") {
    return ok(req, await readEntitlement(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/streamwatch/notifications/read") {
    return ok(req, { items: [], page: { next_cursor: null, limit: 20 }, backing_mode: "deferred_notification_stub" });
  }

  if (req.method === "POST" && pathname === "/streamwatch/purchase/quote") {
    return ok(req, { price_quote: { currency: "JPY", amount: 0, quote_state: "deferred_commerce_stub" } });
  }

  if (req.method === "POST" && pathname === "/streamwatch/purchase/execute") {
    return ok(req, { result: "ok", transaction_state: "delegated_stub", entitlement_refresh_required: true });
  }

  if (req.method === "POST" && pathname === "/streamwatch/rental/execute") {
    return ok(req, { result: "ok", transaction_state: "delegated_stub", entitlement_refresh_required: true });
  }

  if (req.method === "POST" && pathname === "/streamwatch/membership/join/execute") {
    return ok(req, { result: "ok", transaction_state: "delegated_stub", entitlement_refresh_required: true });
  }

  return null;
}
