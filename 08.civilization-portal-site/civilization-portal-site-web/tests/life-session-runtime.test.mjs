import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function source(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('session route invokes LifeOS authentication', () => {
  const code = source(
    'app/api/lifeos/auth/session/route.js'
  );
  assert.match(code, /checkLifeSession/);
  assert.match(code, /readLifeCookie/);
  assert.match(code, /force-dynamic/);
});

test('logout requires trusted origin', () => {
  const code = source(
    'app/api/lifeos/auth/logout/route.js'
  );
  assert.match(code, /trustedPortalOrigin/);
  assert.match(code, /revokeLifeSession/);
  assert.match(code, /headers\.get\('origin'\)/);
});

test('runtime delegates to LifeOS DB service', () => {
  const code = source(
    'lib/auth/life-session-runtime.mjs'
  );
  assert.match(
    code,
    /createLifeSessionAccessServiceFromPool/
  );
  assert.match(code, /LIFEOS_DATABASE_URL/);
  assert.doesNotMatch(
    code,
    /readPersonaServerSession/
  );
});

test('production requires verified TLS', () => {
  const code = source(
    'lib/auth/life-session-runtime.mjs'
  );
  assert.match(code, /verify-full/);
});

test('routes remain independent of Persona', () => {
  for (const route of [
    'app/api/lifeos/auth/session/route.js',
    'app/api/lifeos/auth/logout/route.js'
  ]) {
    assert.doesNotMatch(
      source(route),
      /persona-server-session|persona\/auth/
    );
  }
});
