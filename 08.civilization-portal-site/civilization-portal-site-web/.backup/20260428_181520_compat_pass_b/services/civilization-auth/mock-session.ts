import type { PortalSessionSummary } from "../../types/auth";
import type { PortalAuthResponseData } from "../../types/portal-api";

const SESSION_KEY = "civilization.portal.session.v1";
const PENDING_AUTH_KEY = "civilization.portal.pending-auth.v1";

export const PORTAL_GUEST_SESSION: PortalSessionSummary = {
  isLoggedIn: false,
  entityType: "guest",
  affiliations: [],
  contractTier: "none",
  betaFlags: [],
  region: "JP",
};

export const getPortalSessionSummary = (): PortalSessionSummary => {
  if (typeof window === "undefined") {
    return PORTAL_GUEST_SESSION;
  }

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return PORTAL_GUEST_SESSION;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PortalSessionSummary>;
    return {
      ...PORTAL_GUEST_SESSION,
      ...parsed,
      affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations : [],
      betaFlags: Array.isArray(parsed.betaFlags) ? parsed.betaFlags : [],
    };
  } catch {
    return PORTAL_GUEST_SESSION;
  }
};

export const savePortalSession = (session: PortalSessionSummary): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearPortalSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(SESSION_KEY);
};

export const savePendingAuthResponse = (data: PortalAuthResponseData): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(data));
};

export const readPendingAuthResponse = (): PortalAuthResponseData | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(PENDING_AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PortalAuthResponseData;
  } catch {
    return null;
  }
};

export const clearPendingAuthResponse = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(PENDING_AUTH_KEY);
};
