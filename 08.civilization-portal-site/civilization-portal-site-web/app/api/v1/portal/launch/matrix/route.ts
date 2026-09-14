import { NextResponse } from "next/server";
import { DEFAULT_PORTAL_SESSION } from "../../../../../../types/auth";
import type {
  PortalApiMeta,
  PortalLaunchMatrixRequest,
  PortalLaunchMatrixResponse,
} from "../../../../../../types/portal-api";
import { buildPortalLaunchMatrixData } from "../../../../../../services/mock-server/launch-mock";

const createMeta = (): PortalApiMeta => ({
  success: true,
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

export async function POST(request: Request): Promise<NextResponse<PortalLaunchMatrixResponse>> {
  const body = (await request.json().catch(() => ({}))) as Partial<PortalLaunchMatrixRequest>;
  const session = body.session ?? DEFAULT_PORTAL_SESSION;

  return NextResponse.json({
    meta: createMeta(),
    data: buildPortalLaunchMatrixData({
      requestedOsCodes: body.requestedOsCodes ?? ["civilization-os"],
      requestSource: body.requestSource ?? "api",
      session,
    }),
  });
}
