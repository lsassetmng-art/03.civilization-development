import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAuthMode,
  PortalAuthProfilePreset,
  PortalAuthRequestBase,
  PortalAuthResponse,
  PortalAuthResponseData,
} from "../../types/portal-api";

const presetToTier = (preset?: PortalAuthProfilePreset): PortalSessionSummary["contractTier"] => {
  if (preset === "business") return "business";
  if (preset === "personal") return "personal";
  return "free";
};

export const createMockPortalSession = (
  input: Partial<PortalAuthRequestBase> = {},
): PortalSessionSummary => ({
  isLoggedIn: true,
  civilizationUserId: "mock-user",
  displayName: input.profilePreset === "business" ? "Business Operator" : "Portal User",
  entityType: "human",
  affiliations: input.profilePreset === "business" ? ["operator"] : [],
  contractTier: presetToTier(input.profilePreset),
  betaFlags: [],
  region: "JP",
});

export const createMockPortalAuthResponseData = (
  mode: PortalAuthMode,
  input: Partial<PortalAuthRequestBase> = {},
): PortalAuthResponseData => ({
  session: createMockPortalSession(input),
  redirectTo: input.returnTarget ?? "/me/launcher",
});

export const createMockPortalAuthResponse = (
  mode: PortalAuthMode,
  input: Partial<PortalAuthRequestBase> = {},
): PortalAuthResponse => ({
  meta: {
    success: true,
    requestId: `mock-${mode}`,
    timestamp: new Date().toISOString(),
  },
  data: createMockPortalAuthResponseData(mode, input),
});

export const resolveMockPortalAuth = createMockPortalAuthResponse;
export const startMockPortalAuth = createMockPortalAuthResponse;
