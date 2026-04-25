import { AUTH_BRIDGE_CONFIG } from "../../config/bridge";
import { ROUTES } from "../../lib/routing/routes";
import type {
  CivilizationAuthBridge,
  PortalAuthReturnCommand,
  PortalAuthReturnResult,
  PortalAuthStartCommand,
  PortalAuthStartResult,
} from "../../types/bridge";
import type { PortalSessionSummary } from "../../types/auth";

const GUEST_SESSION: PortalSessionSummary = {
  isLoggedIn: false,
  entityType: "guest",
  affiliations: [],
  contractTier: "none",
  betaFlags: [],
  region: "JP",
};

const buildNotReadyMessage = (): string =>
  AUTH_BRIDGE_CONFIG.external.authorizeUrl
    ? "External auth bridge stub is selected, but the real bridge adapter has not been implemented yet."
    : "External auth bridge stub is selected, but NEXT_PUBLIC_CIVILIZATION_AUTH_AUTHORIZE_URL is not configured.";

export const externalCivilizationAuthStubBridge: CivilizationAuthBridge = {
  mode: "external_stub",

  async startAuth(_command: PortalAuthStartCommand): Promise<PortalAuthStartResult> {
    throw new Error(buildNotReadyMessage());
  },

  async resolveAuthReturn(
    command: PortalAuthReturnCommand,
  ): Promise<PortalAuthReturnResult> {
    return {
      bridgeMode: "external_stub",
      status: "error",
      mode: command.mode,
      returnTarget: ROUTES.error,
      message: buildNotReadyMessage(),
    };
  },

  getSessionSummary() {
    return GUEST_SESSION;
  },

  clearSession() {
    return;
  },
};
