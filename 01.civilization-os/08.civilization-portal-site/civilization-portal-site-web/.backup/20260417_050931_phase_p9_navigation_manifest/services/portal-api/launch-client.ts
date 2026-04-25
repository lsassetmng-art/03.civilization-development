import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalLaunchEvaluateRequest,
  PortalLaunchEvaluateResponse,
  PortalLaunchMatrixRequest,
  PortalLaunchMatrixResponse,
} from "../../types/portal-api";
import { fetchJson } from "./fetch-json";

export const requestPortalLaunchDecision = async (
  request: PortalLaunchEvaluateRequest,
): Promise<PortalLaunchEvaluateResponse> =>
  fetchJson<PortalLaunchEvaluateRequest, PortalLaunchEvaluateResponse>(
    API_ROUTES.portalLaunchEvaluate,
    {
      method: "POST",
      body: request,
    },
  );

export const requestPortalLaunchMatrix = async (
  request: PortalLaunchMatrixRequest,
): Promise<PortalLaunchMatrixResponse> =>
  fetchJson<PortalLaunchMatrixRequest, PortalLaunchMatrixResponse>(
    API_ROUTES.portalLaunchMatrix,
    {
      method: "POST",
      body: request,
    },
  );
