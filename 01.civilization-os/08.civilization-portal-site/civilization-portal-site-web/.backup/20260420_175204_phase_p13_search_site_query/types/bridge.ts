import type { PortalReturnContext, PortalSessionSummary } from "./auth";
import type { PortalAuthMode, PortalAuthProfilePreset } from "./portal-api";

export type CivilizationAuthBridgeMode = "mock" | "external_stub";

export type PortalAuthStartCommand = {
  mode: PortalAuthMode;
  profilePreset: PortalAuthProfilePreset;
  returnContext: PortalReturnContext;
};

export type PortalAuthStartResult = {
  bridgeMode: CivilizationAuthBridgeMode;
  redirectUrl: string;
};

export type PortalAuthReturnCommand = {
  status: "success" | "error";
  mode: PortalAuthMode;
  searchReturnTarget?: string;
  requestedOsCode?: string;
};

export type PortalAuthReturnResult = {
  bridgeMode: CivilizationAuthBridgeMode;
  status: "authenticated" | "error";
  mode: PortalAuthMode;
  returnTarget: string;
  session?: PortalSessionSummary;
  message: string;
};

export interface CivilizationAuthBridge {
  readonly mode: CivilizationAuthBridgeMode;
  startAuth(command: PortalAuthStartCommand): Promise<PortalAuthStartResult>;
  resolveAuthReturn(command: PortalAuthReturnCommand): Promise<PortalAuthReturnResult>;
  getSessionSummary(): PortalSessionSummary;
  clearSession(): void;
}
