import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createServer, parsePort } from '../server.mjs';
import { createGatewayServer, normalizeConfig } from '../../civilization-web-gateway/server.mjs';

const routes = [
  ['business', '/business-menu'],
  ['game', '/game-menu'],
  ['streaming', '/streaming-menu'],
  ['staticart', '/staticart-menu']
];
async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return 'http://127.0.0.1:' + server.address().port;
}
async function close(server) {
  if (server.listening) await new Promise((resolve, reject) =>
    server.close(error => error ? reject(error) : resolve()));
}

test('port validation', () => {
  assert.equal(parsePort('8787'), 8787);
  for (const value of ['0', '65536', '-1', 'abc', '1.5']) {
    assert.throws(() => parsePort(value));
  }
});

test('delivery, gateway routing and rollback', async () => {
  const delivery = createServer();
  const portal = http.createServer((_req, res) => res.end('PORTAL_FALLBACK'));
  let gateway;
  let fallback;
  try {
    const deliveryOrigin = await listen(delivery);
    const portalOrigin = await listen(portal);
    const osRoutes = Object.fromEntries(routes.map(([owner]) => [
      owner, { target: 'os', origin: deliveryOrigin }
    ]));
    gateway = createGatewayServer(normalizeConfig({
      host: '127.0.0.1', port: 8787, portalOrigin,
      personaOrigin: portalOrigin, personaRouteTarget: 'portal', osRoutes
    }));
    const origin = await listen(gateway);
    for (const [, prefix] of routes) {
      for (const suffix of ['', '/', '/index.html', '/menu.css', '/menu.js', '/menu-contract.json']) {
        const response = await fetch(origin + prefix + suffix);
        assert.equal(response.status, 200, prefix + suffix);
        assert.ok((await response.text()).length > 0);
      }
      const head = await fetch(origin + prefix + '/menu.js', { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
      for (const suffix of ['/secret.txt', '/%2e%2e%2fsecret.txt', '/%2fetc%2fpasswd', '/menu.js/extra']) {
        const response = await fetch(deliveryOrigin + prefix + suffix);
        assert.equal(response.status, 404, prefix + suffix);
      }
      assert.equal((await fetch(deliveryOrigin + prefix, { method: 'POST' })).status, 405);
    }
    for (const prefix of ['/lifeos', '/persona-menu', '/aiworker-menu']) {
      assert.equal(await (await fetch(origin + prefix)).text(), 'PORTAL_FALLBACK');
    }
    fallback = createGatewayServer(normalizeConfig({
      host: '127.0.0.1', port: 8787, portalOrigin,
      personaOrigin: portalOrigin, personaRouteTarget: 'portal'
    }));
    const fallbackOrigin = await listen(fallback);
    for (const [, prefix] of routes) {
      assert.equal(await (await fetch(fallbackOrigin + prefix)).text(), 'PORTAL_FALLBACK');
    }
  } finally {
    await close(fallback);
    await close(gateway);
    await close(portal);
    await close(delivery);
  }
});
