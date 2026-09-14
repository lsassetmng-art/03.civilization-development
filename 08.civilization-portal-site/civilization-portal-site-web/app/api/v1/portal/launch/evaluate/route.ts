import { NextResponse } from "next/server";
import { DEFAULT_PORTAL_SESSION } from "../../../../../../types/auth";
import type {
  PortalApiMeta,
  PortalLaunchEvaluateRequest,
  PortalLaunchEvaluateResponse,
} from "../../../../../../types/portal-api";
import { buildPortalLaunchEvaluateData } from "../../../../../../services/mock-server/launch-mock";

const createMeta = (): PortalApiMeta => ({
  success: true,
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export async function POST(request: Request): Promise<NextResponse<PortalLaunchEvaluateResponse>> {
  const body = (await request.json().catch(() => ({}))) as Partial<PortalLaunchEvaluateRequest>;
  const session = body.session ?? DEFAULT_PORTAL_SESSION;

  return NextResponse.json({
    meta: createMeta(),
    data: buildPortalLaunchEvaluateData({
      requestedOsCode: body.requestedOsCode ?? "civilization-os",
      requestSource: body.requestSource ?? "api",
      session,
    }),
  });
}
