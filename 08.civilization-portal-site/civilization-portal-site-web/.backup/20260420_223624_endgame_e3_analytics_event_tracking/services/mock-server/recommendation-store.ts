import { PORTAL_RECOMMENDATION_SEED_RULES } from "../../mocks/recommendation/seed-rules";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalRecommendationRule,
  PortalResolvedRecommendationItem,
} from "../../types/portal-recommendation-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let recommendationRules: PortalRecommendationRule[] = clone(
  PORTAL_RECOMMENDATION_SEED_RULES,
);

const normalize = (value: string): string =>
  value.toLowerCase().trim().replace(/\s+/g, " ");

const splitTerms = (value: string): string[] =>
  normalize(value)
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const audienceFits = (
  audience: "public" | "member" | "operator",
  session: PortalSessionSummary,
): boolean => {
  if (audience === "public") {
    return true;
  }

  if (audience === "member") {
    return session.isLoggedIn;
  }

  return (
    session.isLoggedIn &&
    session.entityType === "human" &&
    session.contractTier === "business" &&
    session.affiliations.includes("operator")
  );
};

const sortRules = (items: PortalRecommendationRule[]): PortalRecommendationRule[] =>
  [...items].sort((a, b) => {
    if (a.anchorPage !== b.anchorPage) {
      return a.anchorPage.localeCompare(b.anchorPage);
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title);
  });

const sortResolved = (
  items: PortalResolvedRecommendationItem[],
): PortalResolvedRecommendationItem[] =>
  [...items].sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title);
  });

export const listAdminRecommendationRules = (): PortalRecommendationRule[] =>
  clone(sortRules(recommendationRules));

export const upsertRecommendationRule = (input: {
  code: string;
  anchorPage: "home" | "search" | "launcher";
  targetKind: "page" | "os" | "auth" | "launcher" | "admin";
  title: string;
  summary: string;
  href: string;
  audience: "public" | "member" | "operator";
  keywords: string[];
  featured: boolean;
  priority: number;
  visibility: "visible" | "hidden";
}): PortalRecommendationRule => {
  const index = recommendationRules.findIndex((item) => item.code === input.code);

  const item: PortalRecommendationRule = {
    id: index >= 0 ? recommendationRules[index].id : crypto.randomUUID(),
    code: input.code,
    anchorPage: input.anchorPage,
    targetKind: input.targetKind,
    title: input.title,
    summary: input.summary,
    href: input.href,
    audience: input.audience,
    keywords: input.keywords,
    featured: input.featured,
    priority: input.priority,
    visibility: input.visibility,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    recommendationRules[index] = item;
  } else {
    recommendationRules = [...recommendationRules, item];
  }

  return clone(item);
};

export const resolvePublicRecommendations = (input: {
  anchorPage: "home" | "search" | "launcher";
  query?: string;
  session: PortalSessionSummary;
  limit: number;
}): PortalResolvedRecommendationItem[] => {
  const query = normalize(input.query || "");
  const terms = splitTerms(query);

  const results = recommendationRules
    .filter((item) => item.visibility === "visible")
    .filter((item) => item.anchorPage === input.anchorPage)
    .filter((item) => audienceFits(item.audience, input.session))
    .map((item) => {
      const haystack = [item.title, item.summary, ...item.keywords]
        .join(" ")
        .toLowerCase();

      const matchedTerms = terms.filter((term) => haystack.includes(term));

      let score = Math.max(0, 500 - item.priority);
      if (item.featured) {
        score += 60;
      }
      if (matchedTerms.length > 0) {
        score += matchedTerms.length * 25;
      }
      if (query.length > 0 && item.title.toLowerCase().includes(query)) {
        score += 40;
      }
      if (query.length > 0 && item.summary.toLowerCase().includes(query)) {
        score += 20;
      }
      if (input.session.isLoggedIn && item.audience === "member") {
        score += 10;
      }
      if (
        input.session.isLoggedIn &&
        input.session.affiliations.includes("operator") &&
        item.audience === "operator"
      ) {
        score += 20;
      }

      let reason = "Suggested portal entry.";
      if (matchedTerms.length > 0) {
        reason = `Matched query terms: ${matchedTerms.join(", ")}`;
      } else if (item.featured) {
        reason = "Featured recommendation.";
      } else if (item.audience === "member" && input.session.isLoggedIn) {
        reason = "Available for the current signed-in session.";
      } else if (item.audience === "operator") {
        reason = "Available for the current operator session.";
      }

      const resolved: PortalResolvedRecommendationItem = {
        ...item,
        reason,
        score,
      };

      return resolved;
    });

  return clone(sortResolved(results).slice(0, input.limit));
};
