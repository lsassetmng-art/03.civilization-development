import { PORTAL_SEARCH_SEED_ITEMS } from "../../mocks/search/seed-index";
import type {
  PortalSearchIndexItem,
  PortalSearchResultItem,
} from "../../types/portal-search-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let indexItems: PortalSearchIndexItem[] = clone(PORTAL_SEARCH_SEED_ITEMS);

const sortIndex = (items: PortalSearchIndexItem[]): PortalSearchIndexItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

const sortResults = (items: PortalSearchResultItem[]): PortalSearchResultItem[] =>
  [...items].sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

const normalizeQuery = (value: string): string =>
  value.toLowerCase().trim().replace(/\s+/g, " ");

const splitTerms = (value: string): string[] =>
  normalizeQuery(value)
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const listAdminSearchIndex = (): PortalSearchIndexItem[] =>
  clone(sortIndex(indexItems));

export const upsertSearchIndex = (input: {
  code: string;
  kind: "page" | "os" | "auth" | "launcher" | "admin";
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  visibility: "public" | "admin";
  sortOrder: number;
}): PortalSearchIndexItem => {
  const index = indexItems.findIndex((item) => item.code === input.code);

  const item: PortalSearchIndexItem = {
    id: index >= 0 ? indexItems[index].id : crypto.randomUUID(),
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
    indexItems[index] = item;
  } else {
    indexItems = [...indexItems, item];
  }

  return clone(item);
};

export const queryPublicSearchIndex = (
  query: string,
  limit: number,
): {
  normalizedQuery: string;
  items: PortalSearchResultItem[];
} => {
  const normalizedQuery = normalizeQuery(query);
  const terms = splitTerms(query);

  if (normalizedQuery.length === 0 || terms.length === 0) {
    return {
      normalizedQuery,
      items: [],
    };
  }

  const items = indexItems
    .filter((item) => item.visibility === "public")
    .map((item) => {
      const haystack = [
        item.title,
        item.summary,
        ...item.keywords,
      ]
        .join(" ")
        .toLowerCase();

      const matchedTerms = terms.filter((term) => haystack.includes(term));
      if (matchedTerms.length === 0) {
        return null;
      }

      let score = matchedTerms.length * 10;
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        score += 20;
      }
      if (item.summary.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }

      const result: PortalSearchResultItem = {
        ...item,
        score,
        matchedTerms,
      };

      return result;
    })
    .filter((item): item is PortalSearchResultItem => Boolean(item));

  return {
    normalizedQuery,
    items: clone(sortResults(items).slice(0, limit)),
  };
};
