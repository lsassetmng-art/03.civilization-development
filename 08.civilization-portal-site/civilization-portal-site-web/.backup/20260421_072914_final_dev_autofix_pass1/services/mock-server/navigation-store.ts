import { ROUTES } from "../../lib/routing/routes";
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
    href: ROUTES.home,
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
    href: ROUTES.civilization,
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
    href: ROUTES.osCatalog,
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
    href: ROUTES.guide,
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
    id: "nav-help-header",
    code: "help",
    title: "Help",
    href: ROUTES.help,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 50,
    description: "Support help articles",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-search-header",
    code: "search",
    title: "Search",
    href: ROUTES.search,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 60,
    description: "Portal site search",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-contact-header",
    code: "contact",
    title: "Contact",
    href: ROUTES.contact,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 70,
    description: "Support contact entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-launcher-header",
    code: "launcher",
    title: "Launcher",
    href: ROUTES.launcher,
    placement: "header",
    audience: "member",
    visibility: "visible",
    sortOrder: 80,
    description: "Personal launcher entry",
    requiresLogin: true,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-login-header",
    code: "login",
    title: "Login",
    href: ROUTES.login,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 90,
    description: "Portal login entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-admin-header",
    code: "admin",
    title: "Admin",
    href: ROUTES.admin,
    placement: "header",
    audience: "operator",
    visibility: "visible",
    sortOrder: 100,
    description: "Portal admin workspace",
    requiresLogin: true,
    operatorOnly: true,
    lastUpdatedAt: nowIso(),
  },

  {
    id: "nav-guide-footer",
    code: "guide-footer",
    title: "Guide",
    href: ROUTES.guide,
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 10,
    description: "Footer guide entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-help-footer",
    code: "help-footer",
    title: "Help",
    href: ROUTES.help,
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 20,
    description: "Footer help entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-policy-footer",
    code: "policy-footer",
    title: "Policy",
    href: ROUTES.policy,
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 30,
    description: "Footer policy entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-terms-footer",
    code: "terms-footer",
    title: "Terms",
    href: ROUTES.terms,
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 40,
    description: "Footer terms entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-contact-footer",
    code: "contact-footer",
    title: "Contact",
    href: ROUTES.contact,
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 50,
    description: "Footer contact entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-search-footer",
    code: "search-footer",
    title: "Search",
    href: ROUTES.search,
    placement: "footer",
    audience: "public",
    visibility: "visible",
    sortOrder: 60,
    description: "Footer search entry",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "nav-admin-footer",
    code: "admin-footer",
    title: "Admin",
    href: ROUTES.admin,
    placement: "footer",
    audience: "operator",
    visibility: "visible",
    sortOrder: 70,
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
