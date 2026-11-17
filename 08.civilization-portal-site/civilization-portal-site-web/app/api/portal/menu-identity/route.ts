/**
 * R21: identity-only verification for trusted loopback menu delivery.
 * Not an OS-specific authorization endpoint; application APIs must authorize.
 * Callers cannot supply arbitrary OS identities or redirect destinations.
 */
import { cookies } from 'next/headers';
import { readPersonaServerSession } from '../../../../lib/auth/persona-server-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const source = await cookies();
  const result = readPersonaServerSession({
    cookies: { get: name => source.get(name) }
  });
  const status = result.status === 'ok'
    ? 204
    : result.status === 'not_configured' ? 503 : 401;
  return new Response(null, {
    status,
    headers: {
      'cache-control': 'private, no-store, max-age=0',
      'pragma': 'no-cache',
      'vary': 'Cookie',
      'x-content-type-options': 'nosniff'
    }
  });
}
