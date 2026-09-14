export const ROUTES = {
  home: "/",
  civilization: "/civilization",
  osCatalog: "/os",
  guide: "/guide",
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

  adminNoticesList: "/api/v1/portal/admin/notices/list",
  adminNoticePublish: "/api/v1/portal/admin/notices/publish",
  adminMaintenanceList: "/api/v1/portal/admin/maintenance/list",
  adminMaintenanceUpsert: "/api/v1/portal/admin/maintenance/upsert",
  adminListingList: "/api/v1/portal/admin/listing/list",
  adminListingUpsert: "/api/v1/portal/admin/listing/upsert",
} as const;

export const buildOsDetailRoute = (osCode: string): string =>
  `/os/${encodeURIComponent(osCode)}`;

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
