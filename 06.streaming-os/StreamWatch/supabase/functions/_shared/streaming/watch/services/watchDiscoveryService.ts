import { listCategoryNodes } from "../repositories/watchCategoryRepository.ts";
import { listProgressByProfile } from "../repositories/watchProgressRepository.ts";
import {
  validateCategoryTreeRead,
  validateHomeFeedRead,
  validateLibraryRead,
  validateNotificationsRead,
  validateSearch,
  validateSeriesDetailRead,
  validateSimpleMutation,
} from "../validators/watchDiscoveryValidator.ts";

export async function homeFeedRead(body: Record<string, unknown>) {
  const input = validateHomeFeedRead(body);
  const recent = await listProgressByProfile(input.viewer_profile_id, Math.min(input.limit, 10));
  return {
    feed_scope: input.feed_scope,
    feed_items: recent.map((row) => ({
      surface_kind: "continue_watching",
      target_type: row.target_type,
      target_id: row.target_id,
      resume_position_seconds: row.position_seconds,
      completion_ratio: row.completion_ratio,
    })),
  };
}

export async function categoryTreeRead(body: Record<string, unknown>) {
  const input = validateCategoryTreeRead(body);
  const nodes = await listCategoryNodes(input.root_scope);
  return {
    root_scope: input.root_scope,
    nodes,
  };
}

export async function search(body: Record<string, unknown>) {
  const input = validateSearch(body);
  return {
    items: [],
    page: {
      limit: input.limit,
      offset: input.offset,
      next_cursor: null,
    },
    note: "phase1_search_catalog_not_materialized",
  };
}

export async function seriesDetailRead(body: Record<string, unknown>) {
  const input = validateSeriesDetailRead(body);
  return {
    series: {
      series_id: input.series_id,
      title: "Phase1 placeholder series",
      watchability_note: "catalog stub until series projection lands",
    },
    season_groups: [],
    next_up: null,
  };
}

export async function libraryRead(body: Record<string, unknown>) {
  const input = validateLibraryRead(body);
  const items = await listProgressByProfile(input.viewer_profile_id, input.limit);
  return {
    section: input.section,
    items,
    summary: {
      source: "progress_projection_only",
      count: items.length,
    },
  };
}

export async function notificationsRead(body: Record<string, unknown>) {
  const input = validateNotificationsRead(body);
  return {
    items: [],
    page: {
      cursor: input.cursor,
      limit: input.limit,
      next_cursor: null,
    },
  };
}

export async function followUpsert(body: Record<string, unknown>) {
  const input = validateSimpleMutation(body);
  return {
    result: "deferred_storage_not_fixed_yet",
    follow_state: {
      target_type: input.target_type,
      target_id: input.target_id,
      follow_flag: Boolean(input.follow_flag),
    },
  };
}

export async function savedListMutate(body: Record<string, unknown>) {
  const input = validateSimpleMutation(body);
  return {
    result: "deferred_storage_not_fixed_yet",
    list_type: input.list_type ?? "watch_later",
    mutation: input.mutation ?? "noop",
  };
}

export async function watchQueueMutate(body: Record<string, unknown>) {
  const input = validateSimpleMutation(body);
  return {
    result: "deferred_storage_not_fixed_yet",
    queue_state: {
      target_type: input.target_type,
      target_id: input.target_id,
      mutation: input.mutation ?? "noop",
    },
  };
}
