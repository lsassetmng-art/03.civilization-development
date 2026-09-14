import type { PortalContractTier, PortalSessionSummary } from "../../types/auth";
import type { PortalOsCard } from "../../types/os";
import type { PortalLaunchDecision } from "../../types/portal-api";
import { buildLoginRoute, buildOsDetailRoute, ROUTES } from "../../lib/routing/routes";

const tierRank: Record<PortalContractTier, number> = {
  none: 0,
  free: 1,
  personal: 2,
  pro: 3,
  business: 4,
};

export const evaluateOsEntry = (
  os: PortalOsCard,
  session: PortalSessionSummary,
): PortalLaunchDecision => {
  const target = os.launchUrl ?? buildOsDetailRoute(os.code);

  if (os.accessLevel === "public") {
    return {
      result: "launchable",
      reason: "Public entry is available.",
      target,
    };
  }

  if (!session.isLoggedIn) {
    return {
      result: "login_required",
      reason: "Login is required.",
      target: buildLoginRoute(target, os.code),
    };
  }

  if (os.accessLevel === "operator" && !session.affiliations.includes("operator")) {
    return {
      result: "denied",
      reason: "Operator access is required.",
      target: ROUTES.accessDenied,
    };
  }

  const minTier = os.eligibility?.minTier;
  if (minTier && tierRank[session.contractTier] < tierRank[minTier]) {
    return {
      result: "denied",
      reason: "The current contract tier is not sufficient.",
      target: ROUTES.accessDenied,
    };
  }

  return {
    result: "launchable",
    reason: "Session is allowed.",
    target,
  };
};
