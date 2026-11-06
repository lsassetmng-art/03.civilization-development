'use strict';

const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('/opt/r40-ui/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const app = path.join(
  root,
  '08.civilization-portal-site',
  'civilization-portal-site-web'
);
const evidence = '/opt/r40-ui/evidence';
const port = 18448;
const base = `http://127.0.0.1:${port}`;

fs.mkdirSync(evidence, {recursive:true});

const out = fs.openSync(path.join(evidence,'next.log'),'w');
const err = fs.openSync(path.join(evidence,'next-error.log'),'w');

const server = spawn(
  './node_modules/.bin/next',
  ['dev','--hostname','127.0.0.1','--port',String(port)],
  {
    cwd:app,
    detached:true,
    env:{
      ...process.env,
      NEXT_TELEMETRY_DISABLED:'1'
    },
    stdio:['ignore',out,err]
  }
);

fs.closeSync(out);
fs.closeSync(err);

const delay = ms => new Promise(r=>setTimeout(r,ms));
let browser;
let page;
let serverExited = false;

server.on('exit',()=>{serverExited=true;});

async function ready() {
  for(let i=0;i<90;i++){
    if(serverExited) throw Error('NEXT_EXITED');
    try {
      const response=await fetch(base+'/login',{
        signal:AbortSignal.timeout(2500)
      });
      if(response.status===200)return;
    }catch{}
    await delay(1500);
  }
  throw Error('NEXT_NOT_READY');
}

async function newPage() {
  const p=await browser.newPage();
  await p.route('https://civilization.invalid/**',route=>
    route.fulfill({
      status:200,
      contentType:'text/html',
      body:'<html><body>CIV_LOGIN_TEST_TARGET</body></html>'
    })
  );
  return p;
}

async function checkNavigation(buttonIndex) {
  const p=await newPage();
  const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  try {
    await p.goto(base+'/login');
    const buttons=p.getByTestId('portal-login-profiles').locator('button');
    assert.equal(await buttons.count(),3,'PROFILE_BUTTON_COUNT');

    await buttons.nth(buttonIndex).click();

    await p.waitForURL(url=>
      url.origin==='https://civilization.invalid' &&
      url.pathname==='/login',
      {timeout:15000}
    );

    const url=new URL(p.url());
    assert.equal(
      url.searchParams.get('requested_os_code'),
      'civilization'
    );
    assert.equal(
      url.searchParams.get('after_login_path'),
      '/civilization-menu'
    );
    assert.equal(
      url.searchParams.get('return_to'),
      '/'
    );
    assert.deepEqual(errors,[],'BROWSER_PAGE_ERRORS');
  } finally {
    await p.close();
  }
}

async function checkLifeDenial() {
  const p=await newPage();
  const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  try {
    await p.goto(base+'/login?requestedOsCode=life');
    await p.getByTestId('portal-login-profiles').locator('button').first().click();
    await p.getByText(
      'OS-specific handoff requires a verified authentication contract.'
    ).waitFor({timeout:15000});

    assert.equal(new URL(p.url()).origin,base);
    assert.deepEqual(errors,[],'LIFE_PAGE_ERRORS');

    await p.screenshot({
      path:path.join(evidence,'life-denial.png'),
      fullPage:true
    });
  } finally {
    await p.close();
  }
}

async function checkApiDenial() {
  const response=await fetch(
    base+'/api/v1/portal/auth/login',
    {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        email:'test@example.invalid',
        password:'not-a-real-password'
      }),
      signal:AbortSignal.timeout(15000)
    }
  );

  assert.equal(response.status,503,'API_MUST_FAIL_CLOSED');
  assert.match(
    response.headers.get('cache-control')||'',
    /no-store/
  );

  const data=await response.json();
  assert.equal(data.ok,false);
  assert.equal(data.error,'AUTH_OWNED_BY_CIVILIZATION_OS');
}

async function main() {
  await ready();
  browser=await chromium.launch({headless:true});

  for(let i=0;i<3;i++){
    await checkNavigation(i);
    console.log('UI_PROFILE_'+(i+1)+'=PASS');
  }

  await checkLifeDenial();
  console.log('UI_LIFE_DENIAL=PASS');

  await checkApiDenial();
  console.log('UI_API_DENIAL=PASS');

  console.log('UI_TEST=PASS');
  console.log('UI_CASES=5');
}

async function shutdown() {
  if(page)await page.close().catch(()=>{});
  if(browser)await browser.close().catch(()=>{});

  if(!serverExited){
    try {
      process.kill(-server.pid,'SIGTERM');
    }catch {
      try{server.kill('SIGTERM');}catch{}
    }

    for(let i=0;i<30&&!serverExited;i++){
      await delay(100);
    }

    if(!serverExited){
      try{process.kill(-server.pid,'SIGKILL');}catch{}
    }
  }
}

main()
  .catch(error=>{
    console.error('UI_TEST=FAIL',error);
    process.exitCode=1;
  })
  .finally(async()=>{
    try{
      await shutdown();
    }catch(error){
      console.error('SHUTDOWN=FAIL',error);
      process.exitCode=1;
    }
  });
