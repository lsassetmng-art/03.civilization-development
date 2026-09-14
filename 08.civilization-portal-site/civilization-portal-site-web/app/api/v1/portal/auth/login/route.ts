import { NextResponse } from "next/server";
import type {
  PortalApiMeta,
  PortalAuthResponse,
  PortalLoginRequest,
} from "../../../../../../types/portal-api";
import { buildMockPortalAuthData } from "../../../../../../services/mock-server/auth-mock";

const createMeta = (): PortalApiMeta => ({
  success: true,
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export async function POST(request: Request): Promise<NextResponse<PortalAuthResponse>> {
  const body = (await request.json().catch(() => ({}))) as Partial<PortalLoginRequest>;
  const data = buildMockPortalAuthData("login", {
    ...body,
    mode: "login",
  });

  return NextResponse.json({
    meta: createMeta(),
    data,
    redirectUrl: data.redirectTo,
  });
}
