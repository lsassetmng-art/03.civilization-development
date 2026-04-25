import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAdminAccessCheckResponse,
  PortalAdminActorType,
} from "../../types/portal-admin-security-api";

const actorTypeFromSession = (
  session: PortalSessionSummary,
): PortalAdminActorType => {
  if (!session.isLoggedIn) {
    return "guest";
  }

  if (session.affiliations.includes("operator")) {
    return "operator";
  }

  return "member";
};

export const evaluatePortalAdminAccess = (
  session: PortalSessionSummary,
): PortalAdminAccessCheckResponse["data"] => {
  const actorType = actorTypeFromSession(session);

  if (!session.isLoggedIn) {
    return {
      area: "portal-admin",
      allowed: false,
      actorType,
      reason: "Login is required for the portal admin workspace.",
    };
  }

  if (session.entityType !== "human") {
    return {
      area: "portal-admin",
      allowed: false,
      actorType,
      reason: "Portal admin access is limited to human operators.",
    };
  }

  if (!session.affiliations.includes("operator")) {
    return {
      area: "portal-admin",
      allowed: false,
      actorType,
      reason: "The operator affiliation is required for portal admin access.",
    };
  }

  if (session.contractTier !== "business") {
    return {
      area: "portal-admin",
      allowed: false,
      actorType,
      reason: "The business contract tier is required for portal admin access.",
    };
  }

  return {
    area: "portal-admin",
    allowed: true,
    actorType,
    reason: "Portal admin access granted.",
  };
};
