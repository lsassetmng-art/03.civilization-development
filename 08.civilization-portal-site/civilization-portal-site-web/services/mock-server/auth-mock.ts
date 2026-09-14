import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAuthMode,
  PortalAuthProfilePreset,
  PortalAuthRequestBase,
  PortalAuthResponse,
  PortalAuthResponseData,
} from "../../types/portal-api";

const presetToTier = (preset?: PortalAuthProfilePreset): PortalSessionSummary["contractTier"] => {
  if (preset === "business" || preset === "business-operator") return "business";
  if (preset === "personal" || preset === "staticart-beta-creator") return "personal";
  if (preset === "free-member") return "free";
  return "free";
};

const presetToAffiliations = (preset?: PortalAuthProfilePreset): string[] =>
  preset === "business" || preset === "business-operator" ? ["operator"] : [];

export const createMockPortalSession = (
  input: Partial<PortalAuthRequestBase> = {},
): PortalSessionSummary => ({
  isLoggedIn: true,
  civilizationUserId: "mock-user",
  displayName: input.profilePreset === "business-operator" ? "Business Operator" : "Portal User",
  entityType: "human",
  affiliations: presetToAffiliations(input.profilePreset),
  contractTier: presetToTier(input.profilePreset),
  betaFlags: [],
  region: "JP",
});

export const createMockPortalAuthResponseData = (
  _mode: PortalAuthMode,
  input: Partial<PortalAuthRequestBase> = {},
): PortalAuthResponseData => ({
  session: createMockPortalSession(input),
  redirectTo: input.returnContext?.returnTarget ?? input.returnTarget ?? "/me/launcher",
});

export const createMockPortalAuthResponse = (
  mode: PortalAuthMode,
  input: Partial<PortalAuthRequestBase> = {},
): PortalAuthResponse => {
  const data = createMockPortalAuthResponseData(mode, input);
  return {
    meta: {
      success: true,
      requestId: `mock-${mode}`,
      timestamp: new Date().toISOString(),
    },
    data,
    redirectUrl: data.redirectTo,
  };
};

export const buildMockPortalAuthData = (
  modeOrInput: PortalAuthMode | Partial<PortalAuthRequestBase> = "login",
  maybeInput: Partial<PortalAuthRequestBase> = {},
): PortalAuthResponseData => {
  const mode =
    typeof modeOrInput === "string"
      ? modeOrInput
      : modeOrInput.mode ?? "login";

  const input =
    typeof modeOrInput === "string"
      ? maybeInput
      : modeOrInput;

  return createMockPortalAuthResponseData(mode, input);
};

export const resolveMockPortalAuth = createMockPortalAuthResponse;
export const startMockPortalAuth = createMockPortalAuthResponse;
