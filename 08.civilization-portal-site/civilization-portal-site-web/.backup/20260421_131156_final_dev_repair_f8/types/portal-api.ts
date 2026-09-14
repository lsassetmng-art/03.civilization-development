import type { PortalReturnContext, PortalSessionSummary } from "./auth";
import type { PortalLaunchDecision } from "./decision";
import type { PortalOsAccessLevel, PortalOsAvailability } from "./os";

export type PortalApiVersion = "2026-04-16.portal.v1";

export type PortalApiMeta = {
  requestId: string;
  timestamp: string;
  version: PortalApiVersion;
  success: boolean;
};

export type PortalErrorBody = {
  code: string;
  message: string;
  details?: Record<string, string>;
};

export type PortalErrorResponse = {
  meta: PortalApiMeta;
  error: PortalErrorBody;
};

export type PortalAuthMode = "login" | "signup";

export type PortalAuthProfilePreset =
  | "free-member"
  | "business-operator"
  | "staticart-beta-creator";

export type PortalAuthRequestBase = {
  operation: PortalAuthMode;
  profilePreset: PortalAuthProfilePreset;
  returnContext: PortalReturnContext;
};

export type PortalLoginRequest = PortalAuthRequestBase & {
  operation: "login";
};

export type PortalSignupRequest = PortalAuthRequestBase & {
  operation: "signup";
};

export type PortalAuthResponseData = {
  status: "authenticated";
  mode: PortalAuthMode;
  session: PortalSessionSummary;
  authReturnUrl: string;
  returnContext: PortalReturnContext;
};

export type PortalAuthResponse = {
  meta: PortalApiMeta;
  data: PortalAuthResponseData;
};

export type PortalLaunchOsSummary = {
  code: string;
  name: string;
  category: string;
  tagline: string;
  summary: string;
  availability: PortalOsAvailability;
  accessLevel: PortalOsAccessLevel;
  featured: boolean;
  launchUrl: string;
};

export type PortalLaunchEvaluateRequest = {
  requestedOsCode: string;
  requestSource: "os-detail" | "launcher";
  session: PortalSessionSummary;
};

export type PortalLaunchEvaluateResponseData = {
  item: {
    os: PortalLaunchOsSummary;
    decision: PortalLaunchDecision;
  };
};

export type PortalLaunchEvaluateResponse = {
  meta: PortalApiMeta;
  data: PortalLaunchEvaluateResponseData;
};

export type PortalLaunchMatrixRequest = {
  requestedOsCodes: string[];
  requestSource: "launcher";
  session: PortalSessionSummary;
};

export type PortalLaunchMatrixItem = {
  os: PortalLaunchOsSummary;
  decision: PortalLaunchDecision;
};

export type PortalLaunchMatrixResponseData = {
  items: PortalLaunchMatrixItem[];
};

export type PortalLaunchMatrixResponse = {
  meta: PortalApiMeta;
  data: PortalLaunchMatrixResponseData;
};
