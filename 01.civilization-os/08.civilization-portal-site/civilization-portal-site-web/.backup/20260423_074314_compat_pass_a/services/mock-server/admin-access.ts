import type { PortalSessionSummary } from "../../types/auth";

export const evaluatePortalAdminAccess = (
  session: PortalSessionSummary,
): {
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
      allowed: true,
      reason: "Operator access granted.",
      actorType: "operator",
    };
  }

  if (session.isLoggedIn) {
    return {
      allowed: false,
      reason: "Operator privileges are required.",
      actorType: "member",
    };
  }

  return {
    allowed: false,
    reason: "Login is required.",
    actorType: "guest",
  };
};
