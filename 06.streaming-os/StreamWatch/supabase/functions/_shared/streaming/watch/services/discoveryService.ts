import { buildHomeFeed, searchProjection, seriesDetailProjection } from "../repositories/projectionAdapters.ts";
import { readCategoryTree } from "../repositories/categoryRepository.ts";
import { coercePositiveLimit, requireKeyword, requireViewerProfileId } from "../validators/commonValidators.ts";

export async function readHomeFeed(input: {
  viewer_profile_id?: string;
  feed_scope?: string;
  limit?: number;
}) {
  const viewer_profile_id = requireViewerProfileId(input.viewer_profile_id);
  return await buildHomeFeed({
    viewer_profile_id,
    feed_scope: input.feed_scope ?? "personalized",
    limit: coercePositiveLimit(input.limit, 20)
  });
}

export async function readCategoryTreeService(input: {
  root_scope?: string;
}) {
  const root_scope = (input.root_scope ?? "root").trim();
  return {
    root_scope,
    nodes: await readCategoryTree(root_scope)
  };
}

export async function search(input: {
  keyword?: string;
  limit?: number;
  offset?: number;
}) {
  return await searchProjection({
    keyword: requireKeyword(input.keyword),
    limit: coercePositiveLimit(input.limit, 20),
    offset: Number(input.offset ?? 0)
  });
}

export async function readSeriesDetail(input: {
  series_id?: string;
}) {
  return await seriesDetailProjection((input.series_id ?? "").trim());
}
