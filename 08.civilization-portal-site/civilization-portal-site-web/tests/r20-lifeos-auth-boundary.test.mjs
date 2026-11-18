import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');

const civ='01.civilization-os/civilization-os-web/';
const portal='08.civilization-portal-site/civilization-portal-site-web/';

test('LifeOS retains independent authentication ownership',()=>{
  const contract=JSON.parse(load('04.life-os/os-menu/menu-contract.json'));
  assert.equal(contract.authentication.owner,'life');
  assert.equal(contract.authentication.portalSessionReuse,false);
});

test('Civilization session identity requires server session verification',()=>{
  const source=load(civ+'app/api/civilization/auth/session-identity/route.ts');
  assert.match(source,/readCivilizationServerSession/);
  assert.match(source,/result\.status\s*!==\s*"ok"/);
  assert.match(source,/401/);
  assert.match(source,/503/);
  assert.match(source,/no-store/);
});

test('Portal login is not represented as LifeOS trusted resolution',()=>{
  const source=load(portal+'app/lifeos/page.tsx');
  assert.match(source,/readPersonaServerSession/);
  assert.match(source,/createLifeOSCivilizationLoginContext/);
  assert.doesNotMatch(source,/actor_id\s*:\s*context\.(civilizationId|owner)/);
  assert.doesNotMatch(source,/session_id\s*:\s*context\.sessionRef/);
});

test('LifeOS authenticated gateway is not falsely enabled',()=>{
  const contract=JSON.parse(load('04.life-os/os-menu/menu-contract.json'));
  assert.equal(contract.authentication.integrationStatus,'not-connected');
  assert.equal(contract.deployment.gatewayRouteEnabled,false);
});
