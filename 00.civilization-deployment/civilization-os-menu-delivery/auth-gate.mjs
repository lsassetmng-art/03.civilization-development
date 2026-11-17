/**
 * Server-side, identity-only barrier for OS-owned public menu HTML/assets.
 * The Portal remains the R19 identity verifier; each OS owns its menu assets.
 * This does not authorize any OS application operation.
 */
const AUTH_CHECK_PATH = '/api/portal/menu-identity';

export function normalizeVerifyOrigin(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error('OS_MENU_AUTH_VERIFY_ORIGIN_REQUIRED');
  }
  let parsed;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error('OS_MENU_AUTH_VERIFY_ORIGIN_INVALID');
  }
  if (
    parsed.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname) ||
    parsed.username || parsed.password || parsed.pathname !== '/' ||
    parsed.search || parsed.hash
  ) {
    throw new Error('OS_MENU_AUTH_VERIFY_ORIGIN_MUST_BE_LOOPBACK');
  }
  return parsed.origin;
}

export async function verifyMenuIdentity(request, origin) {
  // Only the inbound Cookie header is sent to the trusted local identity verifier.
  const cookie = request.headers.cookie || '';
  try {
    const response = await fetch(new URL(AUTH_CHECK_PATH, origin), {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      headers: { cookie },
      signal: AbortSignal.timeout(2500)
    });
    // No body/identity material is consumed or logged.
    if (response.body) await response.body.cancel().catch(() => {});
    if (response.status === 204) return 'authorized';
    if (response.status === 401) return 'unauthenticated';
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export function denyMenuRequest(request, response, status, prefix, filename) {
  const headers = {
    'cache-control': 'private, no-store, max-age=0',
    'pragma': 'no-cache',
    'vary': 'Cookie',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer'
  };
  if (status === 'unauthenticated' && filename === 'index.html') {
    const location = '/api/persona/auth/start?return_to=' + encodeURIComponent(prefix);
    response.writeHead(302, { ...headers, location, 'content-length': 0 });
    response.end();
    return;
  }
  // Failure never sends OS markup or menu assets to unauthenticated users.
  const code = status === 'unauthenticated' ? 401 : 503;
  const body = code === 401 ? 'Unauthorized\n' : 'Service Unavailable\n';
  response.writeHead(code, {
    ...headers,
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body)
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}
