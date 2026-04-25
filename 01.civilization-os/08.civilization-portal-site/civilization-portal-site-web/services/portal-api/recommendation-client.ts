import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminRecommendationRuleListRequest,
  PortalAdminRecommendationRuleListResponse,
  PortalAdminRecommendationRuleUpsertRequest,
  PortalAdminRecommendationRuleUpsertResponse,
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

export const requestAdminRecommendationRuleList = async (
  request: PortalAdminRecommendationRuleListRequest,
): Promise<PortalAdminRecommendationRuleListResponse> =>
  fetchJson<
    PortalAdminRecommendationRuleListRequest,
    PortalAdminRecommendationRuleListResponse
  >(API_ROUTES.adminRecommendationRuleList, {
    method: "POST",
    body: request,
  });

export const requestAdminRecommendationRuleUpsert = async (
  request: PortalAdminRecommendationRuleUpsertRequest,
): Promise<PortalAdminRecommendationRuleUpsertResponse> =>
  fetchJson<
    PortalAdminRecommendationRuleUpsertRequest,
    PortalAdminRecommendationRuleUpsertResponse
  >(API_ROUTES.adminRecommendationRuleUpsert, {
    method: "POST",
    body: request,
  });
