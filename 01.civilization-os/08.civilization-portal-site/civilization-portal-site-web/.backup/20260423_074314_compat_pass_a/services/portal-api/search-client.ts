import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalSearchQueryRequest,
  PortalSearchQueryResponse,
} from "../../types/portal-search-api";
import { fetchJson } from "./fetch-json";

export const requestPublicSearchQuery = async (
  request: PortalSearchQueryRequest,
): Promise<PortalSearchQueryResponse> =>
  fetchJson<PortalSearchQueryRequest, PortalSearchQueryResponse>(
    API_ROUTES.publicSearchQuery,
    {
      method: "POST",
      body: request,
    },
  );
