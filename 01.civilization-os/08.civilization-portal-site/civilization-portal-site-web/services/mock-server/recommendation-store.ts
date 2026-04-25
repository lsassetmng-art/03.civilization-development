import { PORTAL_RECOMMENDATION_SEED_RULES } from "../../mocks/recommendation/seed-rules";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalRecommendationRule,
  PortalResolvedRecommendationItem,
} from "../../types/portal-recommendation-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let recommendationRules: PortalRecommendationRule[] = clone(PORTAL_RECOMMENDATION_SEED_RULES);

const isOperatorSession = (session: PortalSessionSummary): boolean =>
  session.isLoggedIn &&
  session.entityType === "human" &&
  session.contractTier === "business" &&
  session.affiliations.includes("operator");

const audienceAllowed = (
  audience: "public" | "member" | "operator",
  session: PortalSessionSummary,
): boolean => {
  if (audience === "public") {
    return true;
  }
  if (audience === "member") {
    return session.isLoggedIn;
  }
  return isOperatorSession(session);
};

export const resolvePublicRecommendations = (input: {
  anchorPage: string;
  session: PortalSessionSummary;
  limit: number;
  query?: string;
}): PortalResolvedRecommendationItem[] => {
  const query = (input.query ?? "").trim().toLowerCase();

  return recommendationRules
    .filter((item) => item.visibility === "visible")
    .filter((item) => item.anchorPage === input.anchorPage)
    .filter((item) => audienceAllowed(item.audience, input.session))
    .filter((item) => {
      if (query.length === 0) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.title.localeCompare(b.title);
    })
    .slice(0, input.limit)
    .map((item) => ({
      code: item.code,
      targetKind: item.targetKind,
      title: item.title,
      summary: item.summary,
      href: item.href,
      featured: item.featured,
      priority: item.priority,
    }));
};

export const listAdminRecommendationRules = (): PortalRecommendationRule[] =>
  clone(
    [...recommendationRules].sort((a, b) => {
      if (a.anchorPage !== b.anchorPage) {
        return a.anchorPage.localeCompare(b.anchorPage);
      }
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.title.localeCompare(b.title);
    }),
  );

export const upsertRecommendationRule = (input: {
  code: string;
  anchorPage: string;
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

  const base = index >= 0 ? recommendationRules[index] : undefined;

  const item: PortalRecommendationRule = {
    id: base?.id ?? crypto.randomUUID(),
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
