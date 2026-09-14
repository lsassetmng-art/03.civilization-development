import { API_ROUTES } from "../../lib/routing/routes";
import type {
  PortalNavigationMenuResolveRequest,
  PortalNavigationMenuResolveResponse,
} from "../../types/portal-navigation-api";
import { fetchJson } from "./fetch-json";

export const requestPublicMenuResolve = async (
  request: PortalNavigationMenuResolveRequest,
): Promise<PortalNavigationMenuResolveResponse> =>
  fetchJson<PortalNavigationMenuResolveRequest, PortalNavigationMenuResolveResponse>(
    API_ROUTES.publicNavigationMenuResolve,
    {
      method: "POST",
      body: request,
    },
  );
