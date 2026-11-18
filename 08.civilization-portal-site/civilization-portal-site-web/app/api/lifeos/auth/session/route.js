import {NextResponse} from 'next/server';

import {
  checkLifeSession,
  readLifeCookie,
  clearLifeCookie
} from '../../../../../lib/auth/life-session-runtime.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const policy = await checkLifeSession(
    readLifeCookie(request)
  );

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
