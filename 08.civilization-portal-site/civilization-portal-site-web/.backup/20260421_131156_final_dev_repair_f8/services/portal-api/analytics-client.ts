import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalAdminAnalyticsReportGetRequest,
  PortalAdminAnalyticsReportGetResponse,
  PortalPublicAnalyticsEventAppendRequest,
  PortalPublicAnalyticsEventAppendResponse,
} from "../../types/portal-analytics-api";
import { fetchJson } from "./fetch-json";

export const requestPublicAnalyticsEventAppend = async (
  request: PortalPublicAnalyticsEventAppendRequest,
): Promise<PortalPublicAnalyticsEventAppendResponse> =>
  fetchJson<
    PortalPublicAnalyticsEventAppendRequest,
    PortalPublicAnalyticsEventAppendResponse
  >(API_ROUTES.publicAnalyticsEventAppend, {
    method: "POST",
    body: request,
  });

export const requestAdminAnalyticsReportGet = async (
  request: PortalAdminAnalyticsReportGetRequest,
): Promise<PortalAdminAnalyticsReportGetResponse> =>
  fetchJson<
    PortalAdminAnalyticsReportGetRequest,
    PortalAdminAnalyticsReportGetResponse
  >(API_ROUTES.adminAnalyticsReportGet, {
    method: "POST",
    body: request,
  });
