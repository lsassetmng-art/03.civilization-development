import {
  readFacilityApi
} from "@/lib/city-local-read-api";

import type {
  NextRequest
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type RouteContext = {
  params: Promise<{
    facility_registry_id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params =
    await context.params;

  return readFacilityApi(
    request,
    params.facility_registry_id
  );
}
