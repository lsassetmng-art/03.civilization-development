import { findOsByCode } from "../../mocks/os/catalog";
import { evaluateOsEntry } from "../os-launch/evaluate-os-entry";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalLaunchEvaluateResponseData,
  PortalLaunchMatrixItem,
  PortalLaunchMatrixResponseData,
  PortalLaunchOsSummary,
} from "../../types/portal-api";

const toOsSummary = (osCode: string): PortalLaunchOsSummary => {
  const os = findOsByCode(osCode);
  if (!os) {
    throw new Error(`Unknown OS code: ${osCode}`);
  }

  return {
    code: os.code,
    name: os.name,
    category: os.category,
    tagline: os.tagline,
    summary: os.summary,
    availability: os.availability,
    accessLevel: os.accessLevel,
    featured: os.featured,
    launchUrl: os.launchUrl,
  };
};

export const buildPortalLaunchItem = (
  requestedOsCode: string,
  session: PortalSessionSummary,
): PortalLaunchMatrixItem => {
  const os = findOsByCode(requestedOsCode);
  if (!os) {
    throw new Error(`Unknown OS code: ${requestedOsCode}`);
  }

  return {
    os: toOsSummary(requestedOsCode),
    decision: evaluateOsEntry(os, session),
  };
};

export const buildPortalLaunchEvaluateData = (
  requestedOsCode: string,
  session: PortalSessionSummary,
): PortalLaunchEvaluateResponseData => ({
  item: buildPortalLaunchItem(requestedOsCode, session),
});

export const buildPortalLaunchMatrixData = (
  requestedOsCodes: string[],
  session: PortalSessionSummary,
): PortalLaunchMatrixResponseData => ({
  items: requestedOsCodes.map((code) => buildPortalLaunchItem(code, session)),
});
