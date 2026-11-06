'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'..');
const files={
  '08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/auth-gateway.ts':
    '21022a18eee954fbbfddfcdbd75fa869a6b05c752b55e94a4a18436eb9dd77ab',
  '08.civilization-portal-site/civilization-portal-site-web/app/api/v1/portal/auth/login/route.ts':
    '30373d2aa664f3a44eb4991823945ef172d70a1a66219c6d676e697dd2534f93',
  '08.civilization-portal-site/civilization-portal-site-web/features/auth-entry/login-entry-page.tsx':
    'fe9937c4b8f62ea367a369bedca8f3a16c09c81fb0da9b649dd52b560620f38e'
};

for(const [relative,expected] of Object.entries(files)){
  const actual=crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(root,relative)))
    .digest('hex');

  if(actual!==expected){
    throw Error('INTEGRATED_SHA_MISMATCH:'+relative);
  }
}

console.log('INTEGRATED_SHA256=PASS');
console.log('FILES_VERIFIED=3');
