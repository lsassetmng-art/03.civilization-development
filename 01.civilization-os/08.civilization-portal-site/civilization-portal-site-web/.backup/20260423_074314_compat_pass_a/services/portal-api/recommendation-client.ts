import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalRecommendationResolveRequest,
  PortalRecommendationResolveResponse,
} from "../../types/portal-recommendation-api";
import { fetchJson } from "./fetch-json";

export const requestPublicRecommendationResolve = async (
  request: PortalRecommendationResolveRequest,
): Promise<PortalRecommendationResolveResponse> =>
  fetchJson<PortalRecommendationResolveRequest, PortalRecommendationResolveResponse>(
    API_ROUTES.publicRecommendationResolve,
    {
      method: "POST",
      body: request,
    },
  );
