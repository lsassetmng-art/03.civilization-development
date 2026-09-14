import type { PortalSessionSummary, PortalContractTier } from "../../types/auth";
import type { PortalLaunchDecision } from "../../types/decision";
import type { PortalOsCard } from "../../types/os";
import { ROUTES, buildLoginRoute } from "../../lib/routing/routes";

const TIER_RANK: Record<PortalContractTier, number> = {
  none: 0,
  free: 1,
  pro: 2,
  business: 3,
};

export const evaluateOsEntry = (
  os: PortalOsCard,
  session: PortalSessionSummary,
): PortalLaunchDecision => {
  if (!os.launchUrl) {
    return {
      result: "error",
      reason: "Launch URL is not configured for this OS.",
      target: ROUTES.error,
    };
  }

  if (os.availability === "maintenance") {
    return {
      result: "maintenance",
      reason: "This OS is currently under maintenance.",
      target: ROUTES.maintenance,
    };
  }

  if (os.availability === "coming-soon") {
    return {
      result: "denied",
      reason: "This OS is not yet available.",
      target: ROUTES.accessDenied,
    };
  }

  if (os.accessLevel !== "public" && !session.isLoggedIn) {
    return {
      result: "login_required",
      reason: "Login is required before this OS can be opened.",
      target: buildLoginRoute(os.launchUrl, os.code),
    };
  }

  const eligibility = os.eligibility;
  if (!eligibility) {
    return {
      result: "launchable",
      reason: "Entry granted.",
      target: os.launchUrl,
    };
  }

  if (
    eligibility.allowedEntityTypes &&
    !eligibility.allowedEntityTypes.includes(session.entityType)
  ) {
    return {
      result: "denied",
      reason: "Your current entity type does not match this OS access policy.",
      target: ROUTES.accessDenied,
    };
  }

  if (
    eligibility.requiredContractTier &&
    TIER_RANK[session.contractTier] < TIER_RANK[eligibility.requiredContractTier]
  ) {
    return {
      result: "denied",
      reason: `This OS requires at least the ${eligibility.requiredContractTier} contract tier.`,
      target: ROUTES.accessDenied,
    };
  }

  if (
    eligibility.requiredAffiliation &&
    !session.affiliations.includes(eligibility.requiredAffiliation)
  ) {
    return {
      result: "denied",
      reason: `This OS requires the ${eligibility.requiredAffiliation} affiliation.`,
      target: ROUTES.accessDenied,
    };
  }

  if (
    eligibility.betaFlag &&
    !session.betaFlags.includes(eligibility.betaFlag)
  ) {
    return {
      result: "denied",
      reason: `This OS requires the ${eligibility.betaFlag} beta flag.`,
      target: ROUTES.accessDenied,
    };
  }

  return {
    result: "launchable",
    reason: "Entry granted.",
    target: os.launchUrl,
  };
};
