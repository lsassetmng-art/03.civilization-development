import { PORTAL_SEARCH_SEED_ITEMS } from "../../mocks/search/seed-index";
import type {
  PortalSearchIndexItem,
  PortalSearchResultItem,
} from "../../types/portal-search-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();
const normalize = (value: string): string => value.trim().toLowerCase();

let searchIndexItems: PortalSearchIndexItem[] = clone(PORTAL_SEARCH_SEED_ITEMS);

export const queryPublicSearchIndex = (
  inputOrQuery: { query: string; limit: number } | string,
  maybeLimit?: number,
): {
  normalizedQuery: string;
  items: PortalSearchResultItem[];
} => {
  const query =
    typeof inputOrQuery === "string" ? inputOrQuery : inputOrQuery.query;
  const limit =
    typeof inputOrQuery === "string" ? (maybeLimit ?? 20) : inputOrQuery.limit;

  const normalizedQuery = normalize(query);

  if (normalizedQuery.length === 0) {
    return {
      normalizedQuery,
      items: [],
    };
  }

  const scoreItem = (item: PortalSearchIndexItem): number => {
    let score = 0;

    if (normalize(item.title).includes(normalizedQuery)) {
      score += 30;
    }

    if (normalize(item.summary).includes(normalizedQuery)) {
      score += 15;
    }

    if (item.code.toLowerCase().includes(normalizedQuery)) {
      score += 20;
    }

    item.keywords.forEach((keyword) => {
      if (normalize(keyword).includes(normalizedQuery)) {
        score += 10;
      }
    });

    return score;
  };

  const items = searchIndexItems
    .map((item) => ({
      ...item,
      score: scoreItem(item),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if ((b.score ?? 0) !== (a.score ?? 0)) {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, limit);

  return {
    normalizedQuery,
    items,
  };
};

export const listAdminSearchIndex = (): PortalSearchIndexItem[] =>
  clone(
    [...searchIndexItems].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.title.localeCompare(b.title);
    }),
  );

export const upsertSearchIndex = (input: {
  code: string;
  kind: "page" | "os" | "auth" | "launcher" | "admin" | "search";
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  visibility: "public" | "admin";
  sortOrder: number;
}): PortalSearchIndexItem => {
  const index = searchIndexItems.findIndex((item) => item.code === input.code);
  const base = index >= 0 ? searchIndexItems[index] : undefined;

  const item: PortalSearchIndexItem = {
    id: base?.id ?? crypto.randomUUID(),
    code: input.code,
    kind: input.kind,
    title: input.title,
    summary: input.summary,
    href: input.href,
    keywords: input.keywords,
    visibility: input.visibility,
    sortOrder: input.sortOrder,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    searchIndexItems[index] = item;
  } else {
    searchIndexItems = [...searchIndexItems, item];
  }

  return clone(item);
};
