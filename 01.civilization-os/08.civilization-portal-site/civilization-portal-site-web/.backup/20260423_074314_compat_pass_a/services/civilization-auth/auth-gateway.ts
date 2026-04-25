import { DEFAULT_PORTAL_SESSION, type PortalSessionSummary } from "../../types/auth";

const SESSION_KEY = "civilization.portal.session";

const safeParse = (value: string | null): PortalSessionSummary | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<PortalSessionSummary>;
    return {
      isLoggedIn: Boolean(parsed.isLoggedIn),
      civilizationUserId: parsed.civilizationUserId,
      displayName: parsed.displayName,
      entityType: parsed.entityType ?? DEFAULT_PORTAL_SESSION.entityType,
      affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations : [],
      contractTier: parsed.contractTier ?? DEFAULT_PORTAL_SESSION.contractTier,
      betaFlags: Array.isArray(parsed.betaFlags) ? parsed.betaFlags : [],
      region: parsed.region ?? DEFAULT_PORTAL_SESSION.region,
    };
  } catch {
    return null;
  }
};

export const getGatewaySessionSummary = (): PortalSessionSummary => {
  if (typeof window === "undefined") {
    return DEFAULT_PORTAL_SESSION;
  }

  return safeParse(window.localStorage.getItem(SESSION_KEY)) ?? DEFAULT_PORTAL_SESSION;
};

export const setGatewaySessionSummary = (session: PortalSessionSummary): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearGatewaySessionSummary = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
};

export const getActiveAuthBridgeMode = (): string =>
  typeof window === "undefined" ? "server-fallback" : "browser-storage";
