import {
  readDistrictApi
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
    district_registry_id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params =
    await context.params;

  return readDistrictApi(
    request,
    params.district_registry_id
  );
}
