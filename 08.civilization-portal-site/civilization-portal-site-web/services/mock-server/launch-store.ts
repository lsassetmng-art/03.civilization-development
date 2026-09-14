import { buildLoginRoute, buildOsDetailRoute, ROUTES } from "../../lib/routing/routes";
import { OS_CATALOG } from "../../mocks/os/catalog";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalLaunchDecision,
  PortalLaunchMatrixItem,
} from "../../types/portal-api";

const isOperatorSession = (session: PortalSessionSummary): boolean =>
  session.isLoggedIn &&
  session.entityType === "human" &&
  session.contractTier === "business" &&
  session.affiliations.includes("operator");

const evaluateDecision = (
  osCode: string,
  session: PortalSessionSummary,
): PortalLaunchDecision => {
  const os = OS_CATALOG.find((item) => item.code === osCode);

  if (!os) {
    return {
      result: "error",
      reason: "OS entry was not found.",
      target: ROUTES.error,
    };
  }

  const target = os.launchUrl ?? buildOsDetailRoute(os.code);

  if (os.accessLevel === "public") {
    return {
      result: "launchable",
      reason: "Public OS entry is available.",
      target,
    };
  }

  if (os.accessLevel === "member" && !session.isLoggedIn) {
    return {
      result: "login_required",
      reason: "Login is required for this OS entry.",
      target: buildLoginRoute(buildOsDetailRoute(os.code), os.code),
    };
  }

  if (os.accessLevel === "operator" && !isOperatorSession(session)) {
    return {
      result: session.isLoggedIn ? "denied" : "login_required",
      reason: session.isLoggedIn
        ? "Operator privileges are required."
        : "Login is required for this OS entry.",
      target: session.isLoggedIn
        ? ROUTES.accessDenied
        : buildLoginRoute(buildOsDetailRoute(os.code), os.code),
    };
  }

  return {
    result: "launchable",
    reason: "Session is allowed to continue.",
    target,
  };
};

export const evaluatePortalLaunchDecision = (
  inputOrRequestedOsCode:
    | {
        requestedOsCode: string;
        session: PortalSessionSummary;
      }
    | string,
  maybeSession?: PortalSessionSummary,
  _maybeSource?: string,
): PortalLaunchMatrixItem => {
  const requestedOsCode =
    typeof inputOrRequestedOsCode === "string"
      ? inputOrRequestedOsCode
      : inputOrRequestedOsCode.requestedOsCode;

  const session =
    typeof inputOrRequestedOsCode === "string"
      ? (maybeSession as PortalSessionSummary)
      : inputOrRequestedOsCode.session;

  const os =
    OS_CATALOG.find((item) => item.code === requestedOsCode) ??
    OS_CATALOG[0];

  return {
    os,
    decision: evaluateDecision(os.code, session),
  };
};

export const evaluatePortalLaunchMatrix = (
  inputOrRequestedOsCodes:
    | {
        requestedOsCodes: string[];
        session: PortalSessionSummary;
      }
    | string[],
  maybeSession?: PortalSessionSummary,
  _maybeSource?: string,
): PortalLaunchMatrixItem[] => {
  const requestedOsCodes = Array.isArray(inputOrRequestedOsCodes)
    ? inputOrRequestedOsCodes
    : inputOrRequestedOsCodes.requestedOsCodes;

  const session = Array.isArray(inputOrRequestedOsCodes)
    ? (maybeSession as PortalSessionSummary)
    : inputOrRequestedOsCodes.session;

  return requestedOsCodes
    .map((code) => {
      const os = OS_CATALOG.find((item) => item.code === code);
      if (!os) {
        return null;
      }
      return {
        os,
        decision: evaluateDecision(os.code, session),
      };
    })
    .filter((item): item is PortalLaunchMatrixItem => Boolean(item));
};

export const resolveLaunchDecision = evaluatePortalLaunchDecision;
export const resolveLaunchMatrix = evaluatePortalLaunchMatrix;
