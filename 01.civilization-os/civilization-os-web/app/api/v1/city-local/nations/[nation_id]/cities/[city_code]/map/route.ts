import {
  readCityMapApi
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
    nation_id: string;
    city_code: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params =
    await context.params;

  return readCityMapApi(
    request,
    params.nation_id,
    params.city_code
  );
}
