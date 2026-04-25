import {
  DEFAULT_PORTAL_SESSION,
  type PortalSessionSummary,
} from "../../types/auth";
import type {
  PortalAuthMode,
  PortalAuthProfilePreset,
  PortalAuthResponse,
  PortalLoginRequest,
  PortalSignupRequest,
} from "../../types/portal-api";

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

export const clearGatewaySession = (): void => {
  clearGatewaySessionSummary();
};

export const getActiveAuthBridgeMode = (): string =>
  typeof window === "undefined" ? "server-fallback" : "browser-storage";

const presetToTier = (preset?: PortalAuthProfilePreset): PortalSessionSummary["contractTier"] => {
  if (preset === "business") {
    return "business";
  }
  if (preset === "personal") {
    return "personal";
  }
  return "free";
};

export const startPortalAuth = async (
  input: PortalLoginRequest | PortalSignupRequest,
): Promise<PortalAuthResponse> => {
  const session: PortalSessionSummary = {
    isLoggedIn: true,
    civilizationUserId: "mock-user",
    displayName:
      "displayName" in input && input.displayName
        ? input.displayName
        : "Portal User",
    entityType: "human",
    affiliations: [],
    contractTier: presetToTier(input.profilePreset),
    betaFlags: [],
    region: "JP",
  };

  setGatewaySessionSummary(session);

  return {
    meta: {
      success: true,
      requestId: "mock-auth",
      timestamp: new Date().toISOString(),
    },
    data: {
      session,
      redirectTo: input.returnTarget ?? "/me/launcher",
    },
  };
};

export const resolvePortalAuthReturn = (input: {
  status?: string;
  mode?: PortalAuthMode;
  returnTarget?: string;
  requestedOsCode?: string;
}) => ({
  status: input.status ?? "success",
  mode: input.mode ?? "login",
  returnTarget: input.returnTarget ?? "/me/launcher",
  requestedOsCode: input.requestedOsCode,
  redirectTo: input.returnTarget ?? "/me/launcher",
});
