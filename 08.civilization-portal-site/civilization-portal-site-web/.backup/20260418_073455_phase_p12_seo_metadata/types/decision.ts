export type PortalDecisionResult =
  | "launchable"
  | "login_required"
  | "denied"
  | "maintenance"
  | "error";

export type PortalLaunchDecision = {
  result: PortalDecisionResult;
  reason: string;
  target: string;
};
