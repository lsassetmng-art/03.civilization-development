import type { PortalReturnContext, PortalSessionSummary } from "./auth";
import type { PortalOsCard } from "./os";

export type PortalApiMeta = {
  success: boolean;
  requestId: string;
  timestamp: string;
};

export type PortalAuthMode = "login" | "signup";

export type PortalAuthProfilePreset =
  | "guest"
  | "personal"
  | "business"
  | "business-operator"
  | "free-member"
  | "staticart-beta-creator";

export type PortalAuthRequestBase = {
  mode?: PortalAuthMode;
  operation?: PortalAuthMode | string;
  returnTarget?: string;
  requestedOsCode?: string;
  profilePreset?: PortalAuthProfilePreset;
  returnContext?: PortalReturnContext;
};

export type PortalLoginRequest = PortalAuthRequestBase & {
  email?: string;
  password?: string;
};

export type PortalSignupRequest = PortalAuthRequestBase & {
  email?: string;
  password?: string;
  displayName?: string;
};

export type PortalAuthResponseData = {
  session: PortalSessionSummary;
  redirectTo: string;
};

export type PortalAuthResponse = {
  meta: PortalApiMeta;
  data: PortalAuthResponseData;
  redirectUrl: string;
};

export type PortalLaunchResult =
  | "launchable"
  | "login_required"
  | "denied"
  | "maintenance"
  | "error";

export type PortalLaunchDecision = {
  result: PortalLaunchResult;
  reason: string;
  target: string;
};

export type PortalLaunchOsSummary = PortalOsCard;

export type PortalLaunchMatrixItem = {
  os: PortalOsCard;
  decision: PortalLaunchDecision;
};

export type PortalLaunchEvaluateRequest = {
  requestedOsCode: string;
  requestSource: string;
  session: PortalSessionSummary;
};

export type PortalLaunchEvaluateResponseData = {
  item: PortalLaunchMatrixItem;
};

export type PortalLaunchEvaluateResponse = {
  meta: PortalApiMeta;
  data: PortalLaunchEvaluateResponseData;
};

export type PortalLaunchMatrixRequest = {
  requestedOsCodes: string[];
  requestSource: string;
  session: PortalSessionSummary;
};

export type PortalLaunchMatrixResponseData = {
  items: PortalLaunchMatrixItem[];
};

export type PortalLaunchMatrixResponse = {
  meta: PortalApiMeta;
  data: PortalLaunchMatrixResponseData;
};
