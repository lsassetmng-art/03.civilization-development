import { access } from 'node:fs/promises';
await access(new URL('../src/common-sync.js', import.meta.url));
await access(new URL('../demo/index.html', import.meta.url));
console.log('COMMON_SYNC_VERIFY_OK');
