import type { PortalSessionSummary } from "../../types/auth";

export const evaluatePortalAdminAccess = (
  session: PortalSessionSummary,
): {
  area: "portal-admin";
  allowed: boolean;
  reason: string;
  actorType: "guest" | "member" | "operator";
} => {
  if (
    session.isLoggedIn &&
    session.entityType === "human" &&
    session.contractTier === "business" &&
    session.affiliations.includes("operator")
  ) {
    return {
      area: "portal-admin",
      allowed: true,
      reason: "Operator access granted.",
      actorType: "operator",
    };
  }

  if (session.isLoggedIn) {
    return {
      area: "portal-admin",
      allowed: false,
      reason: "Operator privileges are required.",
      actorType: "member",
    };
  }

  return {
    area: "portal-admin",
    allowed: false,
    reason: "Login is required.",
    actorType: "guest",
  };
};
