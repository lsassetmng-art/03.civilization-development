import { readContinueWatching, readHistorySection } from "./progressRepository.ts";

export async function buildHomeFeed(input: {
  viewer_profile_id: string;
  feed_scope: string;
  limit: number;
}) {
  const continueWatching = await readContinueWatching({
    viewer_profile_id: input.viewer_profile_id,
    limit: input.limit
  });

  const feed_items = continueWatching.map((row) => ({
    target_type: row.target_type,
    target_id: row.target_id,
    display_reason: "continue_watching"
  }));

  return {
    feed_scope: input.feed_scope,
    feed_items
  };
}

export async function buildLibrary(input: {
  viewer_profile_id: string;
  section: string;
  limit: number;
  offset: number;
}) {
  if (input.section === "history") {
    const items = await readHistorySection({
      viewer_profile_id: input.viewer_profile_id,
      limit: input.limit,
      offset: input.offset
    });

    return {
      section: "history",
      items,
      summary: {
        item_count: items.length,
        backing_mode: "progress_history_projection"
      }
    };
  }

  return {
    section: input.section,
    items: [],
    summary: {
      item_count: 0,
      backing_mode: "deferred_adapter_stub"
    }
  };
}

export async function resolveEntitlement(input: {
  target_type: string;
  target_id: string;
}) {
  const playback_cta = input.target_type === "live_session" ? "watch_live" : "watch_now";
  const entitlement_state = input.target_type === "channel" ? "membership_required" : "entitled_or_open";

  return {
    target_type: input.target_type,
    target_id: input.target_id,
    entitlement_state,
    playback_cta,
    archive_access_flag: true
  };
}

export async function searchProjection(input: {
  keyword: string;
  limit: number;
  offset: number;
}) {
  return {
    items: [],
    page: {
      next_cursor: null,
      limit: input.limit,
      offset: input.offset
    },
    adapter_state: "deferred_catalog_search_stub",
    keyword: input.keyword
  };
}

export async function seriesDetailProjection(series_id: string) {
  return {
    series: {
      series_id,
      title: "Deferred series detail projection",
      adapter_state: "deferred_series_projection_stub"
    },
    season_groups: [],
    next_up: null
  };
}
