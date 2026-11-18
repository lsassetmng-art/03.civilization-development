import {NextResponse} from 'next/server';

import {
  revokeLifeSession,
  readLifeCookie,
  clearLifeCookie,
  trustedPortalOrigin
} from '../../../../../lib/auth/life-session-runtime.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const expectedOrigin = trustedPortalOrigin();

  const policy = expectedOrigin
    ? await revokeLifeSession({
        token: readLifeCookie(request),
        origin: request.headers.get('origin'),
        expectedOrigin
      })
    : {
        status: 503,
        headers: {'cache-control':'no-store'},
        body: {
          ok: false,
          error: 'service_unavailable'
        },
        clearCookie: false
      };

  const response = NextResponse.json(
    policy.body,
    {
      status: policy.status,
      headers: policy.headers
    }
  );

  if (policy.clearCookie) {
    clearLifeCookie(response);
  }

  return response;
}
