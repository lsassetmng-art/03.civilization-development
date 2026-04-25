import { execSync } from 'node:child_process';
const cmds = [
  'cd ../CommonUIRuntime && node ./scripts/verify.mjs',
  'cd ../CommonShell && node ./scripts/verify.mjs',
  'cd ../CommonSyncPresentation && node ./scripts/verify.mjs',
  'cd ../CommonOSPlayground && node ./scripts/verify.mjs'
];
for (const cmd of cmds) {
  execSync(cmd, { stdio: 'inherit', cwd: new URL('.', import.meta.url) });
}
console.log('COMMONOS_VERIFY_ALL_OK');
