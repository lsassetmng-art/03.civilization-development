import type { PortalSessionSummary } from "./auth";
import type { PortalOsCard } from "./os";

export type PortalApiMeta = {
  success: boolean;
  requestId: string;
  timestamp: string;
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

export type PortalLaunchMatrixItem = {
  os: PortalOsCard;
  decision: PortalLaunchDecision;
};

export type PortalLaunchEvaluateRequest = {
  requestedOsCode: string;
  requestSource: string;
  session: PortalSessionSummary;
};

export type PortalLaunchEvaluateResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalLaunchMatrixItem;
  };
};

export type PortalLaunchMatrixRequest = {
  requestedOsCodes: string[];
  requestSource: string;
  session: PortalSessionSummary;
};

export type PortalLaunchMatrixResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalLaunchMatrixItem[];
  };
};
