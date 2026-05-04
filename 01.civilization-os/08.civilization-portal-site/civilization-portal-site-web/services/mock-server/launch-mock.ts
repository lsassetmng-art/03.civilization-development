import { buildLoginRoute, buildOsDetailRoute, ROUTES } from "../../lib/routing/routes";
import { findOsByCode, OS_CATALOG } from "../../mocks/os/catalog";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalLaunchDecision,
  PortalLaunchEvaluateResponseData,
  PortalLaunchMatrixItem,
  PortalLaunchMatrixResponseData,
  PortalLaunchOsSummary,
} from "../../types/portal-api";

const isOperator = (session: PortalSessionSummary): boolean =>
  session.isLoggedIn &&
  session.entityType === "human" &&
  session.contractTier === "business" &&
  session.affiliations.includes("operator");

export const summarizeLaunchOs = (code: string): PortalLaunchOsSummary =>
  findOsByCode(code) ?? OS_CATALOG[0];

export const evaluateMockLaunchDecision = (
  osCode: string,
  session: PortalSessionSummary,
): PortalLaunchDecision => {
  const os = findOsByCode(osCode);

  if (!os) {
    return { result: "error", reason: "OS not found.", target: ROUTES.error };
  }

  if (os.accessLevel === "public") {
    return {
      result: "launchable",
      reason: "Public OS entry is available.",
      target: os.launchUrl ?? buildOsDetailRoute(os.code),
    };
  }

  if (!session.isLoggedIn) {
    return {
      result: "login_required",
      reason: "Login is required.",
      target: buildLoginRoute(buildOsDetailRoute(os.code), os.code),
    };
  }

  if (os.accessLevel === "operator" && !isOperator(session)) {
    return {
      result: "denied",
      reason: "Operator access is required.",
      target: ROUTES.accessDenied,
    };
  }

  return {
    result: "launchable",
    reason: "Session is allowed.",
    target: os.launchUrl ?? buildOsDetailRoute(os.code),
  };
};

export const resolveLaunchDecision = (
  osCode: string,
  session: PortalSessionSummary,
  _source?: string,
): PortalLaunchEvaluateResponseData => ({
  item: {
    os: summarizeLaunchOs(osCode),
    decision: evaluateMockLaunchDecision(osCode, session),
  },
});

export const resolveLaunchMatrix = (
  osCodes: string[],
  session: PortalSessionSummary,
  _source?: string,
): PortalLaunchMatrixResponseData => ({
  items: osCodes.map(
    (code): PortalLaunchMatrixItem => ({
      os: summarizeLaunchOs(code),
      decision: evaluateMockLaunchDecision(code, session),
    }),
  ),
});

// COMPAT_PASS_C_START
export const buildPortalLaunchEvaluateData = (
  inputOrOsCode:
    | string
    | {
        requestedOsCode?: string;
        osCode?: string;
        session: PortalSessionSummary;
        requestSource?: string;
      },
  maybeSession?: PortalSessionSummary,
  maybeSource?: string,
): PortalLaunchEvaluateResponseData => {
  const osCode =
    typeof inputOrOsCode === "string"
      ? inputOrOsCode
      : inputOrOsCode.requestedOsCode ?? inputOrOsCode.osCode ?? "civilization-os";

  const session =
    typeof inputOrOsCode === "string"
      ? maybeSession
      : inputOrOsCode.session;

  if (!session) {
    throw new Error("session is required");
  }

  return resolveLaunchDecision(osCode, session, maybeSource);
};

export const buildPortalLaunchMatrixData = (
  inputOrOsCodes:
    | string[]
    | {
        requestedOsCodes?: string[];
        osCodes?: string[];
        session: PortalSessionSummary;
        requestSource?: string;
      },
  maybeSession?: PortalSessionSummary,
  maybeSource?: string,
): PortalLaunchMatrixResponseData => {
  const osCodes = Array.isArray(inputOrOsCodes)
    ? inputOrOsCodes
    : inputOrOsCodes.requestedOsCodes ?? inputOrOsCodes.osCodes ?? [];

  const session = Array.isArray(inputOrOsCodes)
    ? maybeSession
    : inputOrOsCodes.session;

  if (!session) {
    throw new Error("session is required");
  }

  return resolveLaunchMatrix(osCodes, session, maybeSource);
};
// COMPAT_PASS_C_END
