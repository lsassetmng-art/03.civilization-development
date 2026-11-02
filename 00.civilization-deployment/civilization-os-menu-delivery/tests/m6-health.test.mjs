
import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer, deliveryReady } from '../server.mjs';

const NL = String.fromCharCode(10);

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return 'http://127.0.0.1:' + server.address().port;
}

test('readiness validates required files', async () => {
  assert.equal(await deliveryReady(), true);
  assert.equal(
    await deliveryReady(['__m6_r1_missing_directory__']),
    false
  );
});


test('HTTP readiness returns 503 for unavailable files', async () => {
  const server = createServer({
    readinessDirectories: ['__m6_r1_missing_directory__']
  });

  try {
    const origin = await listen(server);

    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(origin + '/readyz', {
        method
      });

      assert.equal(response.status, 503);
      assert.equal(
        response.headers.get('cache-control'),
        'no-store'
      );

      if (method === 'GET') {
        assert.equal(
          await response.text(),
          'unavailable' + NL
        );
      } else {
        assert.equal(await response.text(), '');
      }
    }

    const alive = await fetch(origin + '/healthz');
    assert.equal(alive.status, 200);
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) =>
        server.close(error =>
          error ? reject(error) : resolve()
        )
      );
    }
  }
});

test('health endpoints enforce status and methods', async () => {
  const server = createServer();
  try {
    const origin = await listen(server);

    for (const [route, expected] of [
      ['/healthz', 'ok' + NL],
      ['/readyz', 'ready' + NL]
    ]) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200);
      assert.equal(await response.text(), expected);
      assert.equal(
        response.headers.get('cache-control'),
        'no-store'
      );
      assert.equal(
        response.headers.get('x-content-type-options'),
        'nosniff'
      );

      const head = await fetch(origin + route, {
        method: 'HEAD'
      });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
    }

    assert.equal(
      (await fetch(origin + '/healthz/extra')).status,
      404
    );
    assert.equal(
      (await fetch(origin + '/readyz', {
        method: 'POST'
      })).status,
      405
    );
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) =>
        server.close(error =>
          error ? reject(error) : resolve()
        )
      );
    }
  }
});
