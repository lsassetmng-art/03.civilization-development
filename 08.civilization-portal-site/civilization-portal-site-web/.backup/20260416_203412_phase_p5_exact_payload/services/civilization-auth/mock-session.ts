import type { PortalSessionSummary } from "../../types/auth";
import { ROUTES } from "../../lib/routing/routes";

const SESSION_KEY = "civilization.portal.mock-session";

const DEFAULT_SESSION: PortalSessionSummary = {
  isLoggedIn: false,
  entityType: "guest",
  affiliations: [],
  contractTier: "none",
  betaFlags: [],
  region: "JP",
};

export const getPortalSessionSummary = (): PortalSessionSummary => {
  if (typeof window === "undefined") {
    return DEFAULT_SESSION;
  }

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return DEFAULT_SESSION;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PortalSessionSummary>;
    return {
      ...DEFAULT_SESSION,
      ...parsed,
      affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations : [],
      betaFlags: Array.isArray(parsed.betaFlags) ? parsed.betaFlags : [],
    };
  } catch {
    return DEFAULT_SESSION;
  }
};

export const setMockPortalSession = (
  partial: Partial<PortalSessionSummary>,
): PortalSessionSummary => {
  const session: PortalSessionSummary = {
    ...DEFAULT_SESSION,
    isLoggedIn: true,
    civilizationUserId: "mock-user-001",
    displayName: "Portal User",
    entityType: "human",
    affiliations: ["public"],
    contractTier: "free",
    betaFlags: [],
    region: "JP",
    ...partial,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
};

export const clearPortalSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(SESSION_KEY);
};

export const buildMockAuthReturnUrl = (
  mode: "login" | "signup",
  returnTarget: string = ROUTES.launcher,
  requestedOsCode?: string,
): string => {
  const params = new URLSearchParams();
  params.set("status", "success");
  params.set("mode", mode);
  params.set("return_target", returnTarget);

  if (requestedOsCode) {
    params.set("requested_os_code", requestedOsCode);
  }

  return `${ROUTES.authReturn}?${params.toString()}`;
};
