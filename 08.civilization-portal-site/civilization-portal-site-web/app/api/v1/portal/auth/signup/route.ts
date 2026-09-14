import { NextResponse } from "next/server";
import type {
  PortalApiMeta,
  PortalAuthResponse,
  PortalSignupRequest,
} from "../../../../../../types/portal-api";
import { buildMockPortalAuthData } from "../../../../../../services/mock-server/auth-mock";

const createMeta = (): PortalApiMeta => ({
  success: true,
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export async function POST(request: Request): Promise<NextResponse<PortalAuthResponse>> {
  const body = (await request.json().catch(() => ({}))) as Partial<PortalSignupRequest>;
  const data = buildMockPortalAuthData("signup", {
    ...body,
    mode: "signup",
  });

  return NextResponse.json({
    meta: createMeta(),
    data,
    redirectUrl: data.redirectTo,
  });
}
