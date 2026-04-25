export const ROUTES = {
  home: "/",
  civilization: "/civilization",
  osList: "/os",
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

export const osDetailRoute = (osCode: string) => `/os/${osCode}`;
