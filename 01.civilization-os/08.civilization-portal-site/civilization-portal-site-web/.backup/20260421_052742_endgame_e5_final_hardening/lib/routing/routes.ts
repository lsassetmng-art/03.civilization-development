export const ROUTES = {
  home: "/",
  civilization: "/civilization",
  osCatalog: "/os",
  guide: "/guide",
  help: "/help",
  policy: "/policy",
  terms: "/terms",
  contact: "/contact",
  search: "/search",
  login: "/login",
  signup: "/signup",
  authReturn: "/auth/return",
  accessDenied: "/access-denied",
  maintenance: "/maintenance",
  error: "/error",
  launcher: "/me/launcher",
  admin: "/admin",
} as const;

export const API_ROUTES = {
  portalLogin: "/api/v1/portal/auth/login",
  portalSignup: "/api/v1/portal/auth/signup",
  portalLaunchEvaluate: "/api/v1/portal/launch/evaluate",
  portalLaunchMatrix: "/api/v1/portal/launch/matrix",

  publicNoticesList: "/api/v1/portal/public/notices/list",
  publicMaintenanceList: "/api/v1/portal/public/maintenance/list",
  publicListingList: "/api/v1/portal/public/listing/list",
  publicNavigationManifestList: "/api/v1/portal/public/navigation/manifest/list",
  publicNavigationMenuResolve: "/api/v1/portal/public/navigation/menu/resolve",
  publicCmsPageGet: "/api/v1/portal/public/cms/page/get",
  publicAssetManifestList: "/api/v1/portal/public/asset/manifest/list",
  publicSeoPageGet: "/api/v1/portal/public/seo/page/get",
  publicSearchQuery: "/api/v1/portal/public/search/query",
  publicRecommendationResolve: "/api/v1/portal/public/recommendation/resolve",

  publicPersonalEntriesGet: "/api/v1/portal/public/personal/entries/get",
  publicPersonalShortcutUpsert: "/api/v1/portal/public/personal/shortcut/upsert",
  publicPersonalFavoriteUpsert: "/api/v1/portal/public/personal/favorite/upsert",
  publicPersonalRecentAppend: "/api/v1/portal/public/personal/recent/append",

  publicNotificationCenterGet: "/api/v1/portal/public/notification/center/get",
  publicNotificationAnnouncementAck: "/api/v1/portal/public/notification/announcement/ack",

  publicProfileSettingsGet: "/api/v1/portal/public/profile/settings/get",
  publicProfileSettingsUpsert: "/api/v1/portal/public/profile/settings/upsert",

  publicAnalyticsEventAppend: "/api/v1/portal/public/analytics/event/append",

  publicSupportCenterGet: "/api/v1/portal/public/support/center/get",
  publicSupportContactSubmit: "/api/v1/portal/public/support/contact/submit",

  adminAccessCheck: "/api/v1/portal/admin/access/check",
  adminAuditList: "/api/v1/portal/admin/audit/list",
  adminAuditAppend: "/api/v1/portal/admin/audit/append",

  adminNoticesList: "/api/v1/portal/admin/notices/list",
  adminNoticePublish: "/api/v1/portal/admin/notices/publish",
  adminMaintenanceList: "/api/v1/portal/admin/maintenance/list",
  adminMaintenanceUpsert: "/api/v1/portal/admin/maintenance/upsert",
  adminListingList: "/api/v1/portal/admin/listing/list",
  adminListingUpsert: "/api/v1/portal/admin/listing/upsert",
  adminNavigationManifestList: "/api/v1/portal/admin/navigation/manifest/list",
  adminNavigationManifestUpsert: "/api/v1/portal/admin/navigation/manifest/upsert",
  adminCmsPageList: "/api/v1/portal/admin/cms/page/list",
  adminCmsPageUpsert: "/api/v1/portal/admin/cms/page/upsert",
  adminAssetManifestList: "/api/v1/portal/admin/asset/manifest/list",
  adminAssetManifestUpsert: "/api/v1/portal/admin/asset/manifest/upsert",
  adminSeoPageList: "/api/v1/portal/admin/seo/page/list",
  adminSeoPageUpsert: "/api/v1/portal/admin/seo/page/upsert",
  adminSearchIndexList: "/api/v1/portal/admin/search/index/list",
  adminSearchIndexUpsert: "/api/v1/portal/admin/search/index/upsert",
  adminRecommendationRuleList: "/api/v1/portal/admin/recommendation/rule/list",
  adminRecommendationRuleUpsert: "/api/v1/portal/admin/recommendation/rule/upsert",
  adminNotificationCenterList: "/api/v1/portal/admin/notification/center/list",
  adminNotificationCenterUpsert: "/api/v1/portal/admin/notification/center/upsert",
  adminAnalyticsReportGet: "/api/v1/portal/admin/analytics/report/get",
} as const;

export const buildOsDetailRoute = (osCode: string): string =>
  `/os/${encodeURIComponent(osCode)}`;

export const buildSearchRoute = (query: string): string => {
  const params = new URLSearchParams();
  params.set("q", query);
  return `${ROUTES.search}?${params.toString()}`;
};

export const buildLoginRoute = (
  returnTarget: string = ROUTES.launcher,
  requestedOsCode?: string,
): string => {
  const params = new URLSearchParams();
  params.set("return_target", returnTarget);
  if (requestedOsCode) {
    params.set("requested_os_code", requestedOsCode);
  }
  return `${ROUTES.login}?${params.toString()}`;
};

export const buildSignupRoute = (
  returnTarget: string = ROUTES.launcher,
  requestedOsCode?: string,
): string => {
  const params = new URLSearchParams();
  params.set("return_target", returnTarget);
  if (requestedOsCode) {
    params.set("requested_os_code", requestedOsCode);
  }
  return `${ROUTES.signup}?${params.toString()}`;
};

export const buildAuthReturnRoute = (
  mode: "login" | "signup",
  returnTarget: string = ROUTES.launcher,
  requestedOsCode?: string,
  status: "success" | "error" = "success",
): string => {
  const params = new URLSearchParams();
  params.set("status", status);
  params.set("mode", mode);
  params.set("return_target", returnTarget);
  if (requestedOsCode) {
    params.set("requested_os_code", requestedOsCode);
  }
  return `${ROUTES.authReturn}?${params.toString()}`;
};
