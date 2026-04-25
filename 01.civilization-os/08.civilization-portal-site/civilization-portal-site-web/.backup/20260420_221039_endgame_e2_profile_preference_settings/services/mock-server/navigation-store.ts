import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalNavigationAudience,
  PortalNavigationPlacement,
  PortalPageManifestItem,
} from "../../types/portal-navigation-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let manifestItems: PortalPageManifestItem[] = [
  {
    id: "nav-home-header",
    code: "home",
    title: "Home",
    href: "/",
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 10,
    description: "Portal home entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-civilization-header",
    code: "civilization",
    title: "Civilization",
    href: "/civilization",
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 20,
    description: "Civilization overview",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-os-header",
    code: "os-catalog",
    title: "OS Catalog",
    href: "/os",
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 30,
    description: "Official OS entry directory",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-guide-header",
    code: "guide",
    title: "Guide",
    href: "/guide",
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 40,
    description: "Portal usage guide",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-search-header",
    code: "search",
    title: "Search",
    href: "/search",
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 50,
    description: "Portal site search",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-launcher-header",
    code: "launcher",
    title: "Launcher",
    href: "/me/launcher",
    placement: "header",
    audience: "member",
    visibility: "visible",
    sortOrder: 60,
    description: "Personal launcher entry",
    requiresLogin: true,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-login-header",
    code: "login",
    title: "Login",
    href: "/login",
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 70,
    description: "Portal login entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-admin-header",
    code: "admin",
    title: "Admin",
    href: "/admin",
    placement: "header",
    audience: "operator",
    visibility: "visible",
    sortOrder: 80,
    description: "Portal admin workspace",
    requiresLogin: true,
    operatorOnly: true,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-os-footer",
    code: "os-catalog-footer",
    title: "OS Catalog",
    href: "/os",
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 10,
    description: "Footer OS catalog entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-guide-footer",
    code: "guide-footer",
    title: "Guide",
    href: "/guide",
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 20,
    description: "Footer guide entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-search-footer",
    code: "search-footer",
    title: "Search",
    href: "/search",
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 30,
    description: "Footer search entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-admin-footer",
    code: "admin-footer",
    title: "Admin",
    href: "/admin",
    placement: "footer",
    audience: "operator",
    visibility: "visible",
    sortOrder: 40,
    description: "Footer admin entry",
    requiresLogin: true,
    operatorOnly: true,
    lastUpdatedAt: nowIso(),
  },
];

const sortItems = (items: PortalPageManifestItem[]): PortalPageManifestItem[] =>
  [...items].sort((a, b) => {
    if (a.placement !== b.placement) {
      return a.placement.localeCompare(b.placement);
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

const isOperatorSession = (session: PortalSessionSummary): boolean =>
  session.isLoggedIn &&
  session.entityType === "human" &&
  session.contractTier === "business" &&
  session.affiliations.includes("operator");

const audienceAllowed = (
  audience: PortalNavigationAudience,
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

const canSeeManifestItem = (
  item: PortalPageManifestItem,
  session: PortalSessionSummary,
): boolean => {
  if (item.visibility !== "visible") {
    return false;
  }
  if (!audienceAllowed(item.audience, session)) {
    return false;
  }
  if (item.requiresLogin && !session.isLoggedIn) {
    return false;
  }
  if (item.operatorOnly && !isOperatorSession(session)) {
    return false;
  }
  return true;
};

export const listPublicNavigationManifest = (
  placement: PortalNavigationPlacement | "all",
): PortalPageManifestItem[] => {
  const items =
    placement === "all"
      ? manifestItems
      : manifestItems.filter((item) => item.placement === placement);

  return clone(sortItems(items.filter((item) => item.visibility === "visible")));
};

export const resolvePublicMenuItems = (
  placement: "header" | "footer",
  session: PortalSessionSummary,
): PortalPageManifestItem[] =>
  clone(
    sortItems(
      manifestItems.filter(
        (item) =>
          item.placement === placement && canSeeManifestItem(item, session),
      ),
    ),
  );

export const listAdminNavigationManifest = (): PortalPageManifestItem[] =>
  clone(sortItems(manifestItems));

export const upsertNavigationManifest = (input: {
  code: string;
  title: string;
  href: string;
  placement: PortalNavigationPlacement;
  audience: PortalNavigationAudience;
  visibility: "visible" | "hidden";
  sortOrder: number;
  description: string;
  requiresLogin: boolean;
  operatorOnly: boolean;
}): PortalPageManifestItem => {
  const index = manifestItems.findIndex((item) => item.code === input.code);

  const item: PortalPageManifestItem = {
    id: index >= 0 ? manifestItems[index].id : crypto.randomUUID(),
    code: input.code,
    title: input.title,
    href: input.href,
    placement: input.placement,
    audience: input.audience,
    visibility: input.visibility,
    sortOrder: input.sortOrder,
    description: input.description,
    requiresLogin: input.requiresLogin,
    operatorOnly: input.operatorOnly,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    manifestItems[index] = item;
  } else {
    manifestItems = [...manifestItems, item];
  }

  return clone(item);
};
