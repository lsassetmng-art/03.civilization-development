import { handleError, ok, readJson, type RouteHandler } from "../common/http.ts";
import {
  categoryTreeRead,
  followUpsert,
  homeFeedRead,
  libraryRead,
  notificationsRead,
  savedListMutate,
  search,
  seriesDetailRead,
  watchQueueMutate,
} from "../services/watchDiscoveryService.ts";

export const tryHandleWatchDiscoveryRoutes: RouteHandler = async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/streamwatch/home-feed/read") {
      return ok(req, await homeFeedRead(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/category-tree/read") {
      return ok(req, await categoryTreeRead(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/search") {
      return ok(req, await search(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/series/detail/read") {
      return ok(req, await seriesDetailRead(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/library/read") {
      return ok(req, await libraryRead(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/follow/upsert") {
      return ok(req, await followUpsert(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/saved-list/mutate") {
      return ok(req, await savedListMutate(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/watch-queue/mutate") {
      return ok(req, await watchQueueMutate(await readJson(req)));
    }
    if (req.method === "POST" && url.pathname === "/streamwatch/notifications/read") {
      return ok(req, await notificationsRead(await readJson(req)));
    }

    return null;
  } catch (error) {
    return handleError(req, error);
  }
};
