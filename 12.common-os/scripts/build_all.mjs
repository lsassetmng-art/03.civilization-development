import { execSync } from 'node:child_process';
const cmds = [
  'cd ../CommonUIRuntime && node ./scripts/build.mjs',
  'cd ../CommonShell && node ./scripts/build.mjs',
  'cd ../CommonSyncPresentation && node ./scripts/build.mjs'
];
for (const cmd of cmds) {
  execSync(cmd, { stdio: 'inherit', cwd: new URL('.', import.meta.url) });
}
console.log('COMMONOS_BUILD_ALL_OK');
