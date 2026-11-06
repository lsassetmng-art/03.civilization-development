import {
  DEFAULT_PORTAL_SESSION,
  type PortalSessionSummary,
} from "../../types/auth";
import type {
  PortalAuthMode,
  PortalAuthResponse,
  PortalLoginRequest,
  PortalSignupRequest,
} from "../../types/portal-api";

const SESSION_KEY = "civilization.portal.session";

export const getGatewaySessionSummary = (): PortalSessionSummary => {
  if (typeof window === "undefined") return DEFAULT_PORTAL_SESSION;
  return DEFAULT_PORTAL_SESSION;
};

export const setGatewaySessionSummary = (session: PortalSessionSummary): void => {
  if (typeof window === "undefined") return;
  // Client-side storage is not an authentication authority.
  void session;
};

export const clearGatewaySessionSummary = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
};

export const clearGatewaySession = (): void => {
  clearGatewaySessionSummary();
};

export const getActiveAuthBridgeMode = (): string =>
  "civilization-server-auth-required";

/** Authentication is owned by CivilizationOS. Never mint a Portal session here. */
export const startPortalAuth = async (
  _input: PortalLoginRequest | PortalSignupRequest,
): Promise<PortalAuthResponse> => {
  throw new Error("Portal authentication must be completed in CivilizationOS.");
};

/** Build a navigation-only handoff. This function does not authenticate a user. */
export function buildCivilizationLoginUrl(requestedOsCode?: string): string {
  if (requestedOsCode && requestedOsCode !== "civilization") {
    throw new Error("OS-specific handoff requires a verified authentication contract.");
  }
  const configured = process.env.NEXT_PUBLIC_CIVILIZATION_OS_BASE_URL;
  if (!configured) throw new Error("CivilizationOS login URL is not configured.");
  let base: URL;
  try { base = new URL(configured); } catch { throw new Error("Invalid CivilizationOS login URL."); }
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
    throw new Error("Invalid CivilizationOS login URL.");
  }
  const target = new URL("/login", base);
  target.searchParams.set("requested_os_code", "civilization");
  target.searchParams.set("after_login_path", "/civilization-menu");
  target.searchParams.set("return_to", "/");
  return target.toString();
}

export const resolvePortalAuthReturn = (input: {
  status?: string;
  mode?: PortalAuthMode;
  searchReturnTarget?: string;
  returnTarget?: string;
  requestedOsCode?: string;
}) => {
  const redirectTo =
    input.searchReturnTarget ??
    input.returnTarget ??
    "/me/launcher";

  return {
    status: "unauthenticated",
    mode: input.mode ?? "login",
    returnTarget: redirectTo,
    requestedOsCode: input.requestedOsCode,
    redirectTo,
    redirectUrl: redirectTo,
    message: "Authentication has not been verified by CivilizationOS.",
  };
};
