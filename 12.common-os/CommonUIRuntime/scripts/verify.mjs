import { access, readFile } from 'node:fs/promises';
await access(new URL('../src/commonos.js', import.meta.url));
await access(new URL('../demo/index.html', import.meta.url));
const source = await readFile(new URL('../src/commonos.js', import.meta.url), 'utf8');
if (!source.includes('co-button') || !source.includes('co-app-shell') || !source.includes('co-sync-retry')) {
  console.error('COMMON_UI_RUNTIME_VERIFY_FAIL:required tags missing');
  process.exit(1);
}
console.log('COMMON_UI_RUNTIME_VERIFY_OK');
