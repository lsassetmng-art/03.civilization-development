import type { PortalSessionSummary } from "../../types/auth";
import type { PortalAuthResponseData } from "../../types/portal-api";

export const MOCK_GUEST_SESSION: PortalSessionSummary = {
  isLoggedIn: false,
  entityType: "guest",
  affiliations: [],
  contractTier: "none",
  betaFlags: [],
  region: "JP",
};

export const MOCK_MEMBER_SESSION: PortalSessionSummary = {
  isLoggedIn: true,
  civilizationUserId: "mock-member",
  displayName: "Mock Member",
  entityType: "human",
  affiliations: [],
  contractTier: "personal",
  betaFlags: [],
  region: "JP",
};

export const MOCK_OPERATOR_SESSION: PortalSessionSummary = {
  isLoggedIn: true,
  civilizationUserId: "mock-operator",
  displayName: "Mock Operator",
  entityType: "human",
  affiliations: ["operator"],
  contractTier: "business",
  betaFlags: [],
  region: "JP",
};

export const MOCK_PORTAL_AUTH_RESPONSE_DATA: PortalAuthResponseData = {
  session: MOCK_MEMBER_SESSION,
  redirectTo: "/me/launcher",
};
