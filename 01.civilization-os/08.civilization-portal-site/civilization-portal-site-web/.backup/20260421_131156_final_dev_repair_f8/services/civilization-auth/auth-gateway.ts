import { AUTH_BRIDGE_CONFIG } from "../../config/bridge";
import { externalCivilizationAuthStubBridge } from "./external-bridge-stub";
import { mockCivilizationAuthBridge } from "./mock-bridge-adapter";
import type {
  CivilizationAuthBridge,
  CivilizationAuthBridgeMode,
  PortalAuthReturnCommand,
  PortalAuthReturnResult,
  PortalAuthStartCommand,
  PortalAuthStartResult,
} from "../../types/bridge";
import type { PortalSessionSummary } from "../../types/auth";

const resolveBridge = (): CivilizationAuthBridge => {
  if (AUTH_BRIDGE_CONFIG.mode === "external_stub") {
    return externalCivilizationAuthStubBridge;
  }
  return mockCivilizationAuthBridge;
};

export const getActiveAuthBridgeMode = (): CivilizationAuthBridgeMode =>
  resolveBridge().mode;

export const startPortalAuth = async (
  command: PortalAuthStartCommand,
): Promise<PortalAuthStartResult> => resolveBridge().startAuth(command);

export const resolvePortalAuthReturn = async (
  command: PortalAuthReturnCommand,
): Promise<PortalAuthReturnResult> => resolveBridge().resolveAuthReturn(command);

export const getGatewaySessionSummary = (): PortalSessionSummary =>
  resolveBridge().getSessionSummary();

export const clearGatewaySession = (): void => {
  resolveBridge().clearSession();
};
