'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'..');
const candidate=path.join(root,'tests/r40-z148-candidate');
const manifestPath=path.join(candidate,'baseline.json');

const names=[
  'services/civilization-auth/auth-gateway.ts',
  'app/api/v1/portal/auth/login/route.ts',
  'features/auth-entry/login-entry-page.tsx'
];

function sha(data){
  return crypto.createHash('sha256').update(data).digest('hex');
}

function resolveInside(base,relative){
  if(path.isAbsolute(relative))throw Error('ABSOLUTE_PATH');
  const result=path.resolve(base,relative);
  if(!result.startsWith(path.resolve(base)+path.sep)){
    throw Error('PATH_ESCAPE');
  }
  return result;
}

function prepare(){
  const manifest=JSON.parse(
    fs.readFileSync(manifestPath,'utf8')
  );

  if(manifest.schema_version!==1 ||
     !Array.isArray(manifest.files) ||
     manifest.files.length!==3){
    throw Error('INVALID_MANIFEST');
  }

  const prefix=
    '08.civilization-portal-site/civilization-portal-site-web/';

  return names.map(name=>{
    const relative=prefix+name;
    const entries=manifest.files.filter(
      item=>item.path===relative
    );
    if(entries.length!==1){
      throw Error('MANIFEST_ENTRY_MISMATCH:'+name);
    }

    const entry=entries[0];
    const original=resolveInside(root,relative);
    const updated=resolveInside(
      candidate,
      path.join('R40_Z140_PATCH',relative)
    );

    for(const file of [original,updated]){
      const stat=fs.lstatSync(file);
      if(!stat.isFile()||stat.isSymbolicLink()){
        throw Error('INVALID_FILE_TYPE:'+name);
      }
    }

    const before=fs.readFileSync(original);
    const after=fs.readFileSync(updated);

    if(sha(before)!==entry.sha256){
      throw Error('BASELINE_DRIFT:'+name);
    }
    if(sha(after)!==entry.candidate_sha256){
      throw Error('CANDIDATE_DRIFT:'+name);
    }

    return {
      name,
      original,
      before,
      after,
      mode:fs.statSync(original).mode&0o777
    };
  });
}

function replace(file,data,mode){
  const temp=path.join(
    path.dirname(file),
    '.r40-txn-'+crypto.randomBytes(16).toString('hex')
  );

  try{
    fs.writeFileSync(temp,data,{flag:'wx',mode});
    fs.renameSync(temp,file);
  }finally{
    try{fs.unlinkSync(temp);}catch(error){
      if(error.code!=='ENOENT')throw error;
    }
  }
}

function restore(changes){
  const failures=[];
  for(const change of [...changes].reverse()){
    try{
      replace(change.original,change.before,change.mode);
    }catch(error){
      failures.push('RESTORE:'+change.name+':'+error.message);
    }
  }
  for(const change of changes){
    try{
      if(sha(fs.readFileSync(change.original))!==sha(change.before)){
        failures.push('SHA:'+change.name);
      }
    }catch(error){
      failures.push('VERIFY:'+change.name+':'+error.message);
    }
  }
  if(failures.length){
    throw Error('ROLLBACK_VERIFICATION_FAILED:'+failures.join(','));
  }
}

function apply(options={}){
  const changes=prepare();
  let attempted=0;
  try{
    for(const change of changes){
      // Include the current target in rollback even if rename succeeds
      // and a subsequent operation throws.
      attempted++;
      replace(change.original,change.after,change.mode);
      if(options.afterWrite){
        options.afterWrite(attempted);
      }
    }

    for(const change of changes){
      if(sha(fs.readFileSync(change.original))!==sha(change.after)){
        throw Error('POST_APPLY_MISMATCH:'+change.name);
      }
    }

    return {applied:changes.length,verified:true};
  }catch(error){
    try{
      restore(changes.slice(0,attempted));
      // Verify all targets, including those never written.
      for(const change of changes){
        if(sha(fs.readFileSync(change.original))!==sha(change.before)){
          throw Error('ROLLBACK_INCOMPLETE:'+change.name);
        }
      }
    }catch(rollbackError){
      throw new AggregateError(
        [error,rollbackError],
        'ROLLBACK_VERIFICATION_FAILED'
      );
    }
    throw error;
  }
}

module.exports={prepare,apply,restore,sha};

if(require.main===module){
  try{
    const result=apply();
    console.log('BASELINE_SHA256=PASS');
    console.log('PATCH_APPLIED='+result.applied);
    console.log('POST_APPLY_SHA256=PASS');
  }catch(error){
    console.error('PATCH_APPLY=FAIL');
    console.error(error.message);
    process.exitCode=1;
  }
}
