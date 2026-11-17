import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createServer as menuServer } from '../server.mjs';
import { normalizeVerifyOrigin } from '../auth-gate.mjs';

const routes = ['/business-menu', '/game-menu', '/streaming-menu', '/staticart-menu'];
async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return 'http://127.0.0.1:' + server.address().port;
}
async function close(server) {
  if (server?.listening) await new Promise((resolve, reject) =>
    server.close(error => error ? reject(error) : resolve()));
}
function fixture() {
  return http.createServer((req, res) => {
    if (req.url !== '/api/portal/menu-identity') {
      res.writeHead(404); res.end(); return;
    }
    const cookie = req.headers.cookie || '';
    if (cookie === 'test_menu=valid') res.writeHead(204);
    else if (cookie === 'test_menu=unavailable') res.writeHead(503);
    else res.writeHead(401);
    res.end();
  });
}

test('fail-closed config is mandatory and loopback-only', () => {
  assert.throws(() => menuServer({authVerifyOrigin: ''}), /REQUIRED/);
  for (const value of [
    'https://example.org', 'http://169.254.169.254',
    'http://127.0.0.1:1234/secret', 'http://localhost@evil.com'
  ]) assert.throws(() => normalizeVerifyOrigin(value));
});

test('four owned menus never render before verified identity', async () => {
  const auth = fixture();
  let delivery;
  try {
    const origin = await listen(auth);
    delivery = menuServer({authVerifyOrigin: origin});
    const base = await listen(delivery);
    for (const route of routes) {
      for (const path of [route, route + '/', route + '/index.html']) {
        const res = await fetch(base + path, {redirect: 'manual'});
        assert.equal(res.status, 302, path);
        assert.equal(res.headers.get('location'),
          '/api/persona/auth/start?return_to=' + encodeURIComponent(route));
        assert.ok(!(await res.text()).includes('<main'), path);
      }
      for (const file of ['menu.css', 'menu.js', 'menu-contract.json']) {
        const res = await fetch(base + route + '/' + file);
        assert.equal(res.status, 401, route + '/' + file);
        assert.ok(!(await res.text()).includes('menuEntries'));
      }
      const authorized = await fetch(base + route + '/', {
        headers: {cookie: 'test_menu=valid'}
      });
      assert.equal(authorized.status, 200, route + ': valid identity');
      assert.ok((await authorized.text()).includes('id="os-title"'));

      const asset = await fetch(base + route + '/menu-contract.json', {
        headers: {cookie: 'test_menu=valid'}
      });
      assert.equal(asset.status, 200);
      assert.equal((await asset.json()).publicRoute, route);

      const gone = await fetch(base + route + '/', {
        headers: {cookie: 'test_menu=expired'}, redirect: 'manual'
      });
      assert.equal(gone.status, 302, route + ': expired');

      const unavailable = await fetch(base + route + '/', {
        headers: {cookie: 'test_menu=unavailable'}, redirect: 'manual'
      });
      assert.equal(unavailable.status, 503, route + ': fail closed');
      assert.ok(!(await unavailable.text()).includes('id="os-title"'));

      const head = await fetch(base + route + '/', {
        method: 'HEAD', headers: {cookie: 'test_menu=valid'}
      });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
      assert.equal((await fetch(base + route + '/unknown.js')).status, 404);
    }
  } finally {
    await close(delivery);
    await close(auth);
  }
});
