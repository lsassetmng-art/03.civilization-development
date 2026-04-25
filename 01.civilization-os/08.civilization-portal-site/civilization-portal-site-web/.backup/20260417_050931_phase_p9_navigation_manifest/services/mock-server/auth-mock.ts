import { buildAuthReturnRoute } from "../../lib/routing/routes";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAuthMode,
  PortalAuthProfilePreset,
  PortalAuthRequestBase,
  PortalAuthResponseData,
} from "../../types/portal-api";

const buildSessionFromPreset = (
  preset: PortalAuthProfilePreset,
  mode: PortalAuthMode,
): PortalSessionSummary => {
  if (preset === "business-operator") {
    return {
      isLoggedIn: true,
      civilizationUserId: "mock-user-business-001",
      displayName: "Portal Operator",
      entityType: "human",
      affiliations: ["public", "operator"],
      contractTier: "business",
      betaFlags: [],
      region: "JP",
    };
  }

  if (preset === "staticart-beta-creator") {
    return {
      isLoggedIn: true,
      civilizationUserId:
        mode === "signup"
          ? "mock-user-staticart-signup-001"
          : "mock-user-staticart-login-001",
      displayName:
        mode === "signup" ? "StaticArt Creator" : "StaticArt Beta Creator",
      entityType: "human",
      affiliations: ["public"],
      contractTier: "pro",
      betaFlags: ["staticart-beta"],
      region: "JP",
    };
  }

  return {
    isLoggedIn: true,
    civilizationUserId:
      mode === "signup" ? "mock-user-free-signup-001" : "mock-user-free-login-001",
    displayName: mode === "signup" ? "New Explorer" : "Free Member",
    entityType: "human",
    affiliations: ["public"],
    contractTier: "free",
    betaFlags: [],
    region: "JP",
  };
};

export const buildMockPortalAuthData = (
  mode: PortalAuthMode,
  request: PortalAuthRequestBase,
): PortalAuthResponseData => {
  const session = buildSessionFromPreset(request.profilePreset, mode);
  const requestedOsCode = request.returnContext.requestedOsCode;

  return {
    status: "authenticated",
    mode,
    session,
    authReturnUrl: buildAuthReturnRoute(
      mode,
      request.returnContext.returnTarget,
      requestedOsCode,
      "success",
    ),
    returnContext: request.returnContext,
  };
};
