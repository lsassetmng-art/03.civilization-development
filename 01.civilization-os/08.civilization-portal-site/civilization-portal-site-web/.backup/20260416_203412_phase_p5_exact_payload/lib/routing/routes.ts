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

export const buildOsDetailRoute = (osCode: string): string => `/os/${encodeURIComponent(osCode)}`;

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
