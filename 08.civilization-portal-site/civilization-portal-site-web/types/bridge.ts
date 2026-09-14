import type { PortalReturnContext, PortalSessionSummary } from "./auth";
import type {
  PortalAuthMode,
  PortalAuthProfilePreset,
  PortalAuthResponse,
} from "./portal-api";

export type { PortalReturnContext, PortalAuthMode, PortalAuthProfilePreset };

export type PortalAuthStartCommand = {
  mode: PortalAuthMode;
  profilePreset?: PortalAuthProfilePreset;
  returnContext?: PortalReturnContext;
  returnTarget?: string;
  requestedOsCode?: string;
};

export type PortalAuthStartResult = {
  ok?: boolean;
  redirectUrl?: string;
  message?: string;
  bridgeMode?: string;
  mode?: PortalAuthMode | string;
  status?: string;
  returnTarget?: string;
};

export type PortalAuthReturnCommand = {
  searchReturnTarget?: string;
  returnTarget?: string;
  requestedOsCode?: string;
  status?: string;
  mode?: PortalAuthMode;
};

export type PortalAuthReturnResult = {
  ok?: boolean;
  redirectUrl?: string;
  message?: string;
  bridgeMode?: string;
  mode?: PortalAuthMode | string;
  status?: string;
  returnTarget?: string;
  requestedOsCode?: string;
  response?: PortalAuthResponse;
};

export type CivilizationAuthBridge = {
  mode?: string;
  bridgeMode?: string;
  startAuth: (command: PortalAuthStartCommand) => Promise<PortalAuthStartResult>;
  resolveReturn?: (command: PortalAuthReturnCommand) => Promise<PortalAuthReturnResult>;
  resolveAuthReturn?: (command: PortalAuthReturnCommand) => Promise<PortalAuthReturnResult>;
  getSessionSummary?: () => PortalSessionSummary;
  clearSession?: () => void;
};
