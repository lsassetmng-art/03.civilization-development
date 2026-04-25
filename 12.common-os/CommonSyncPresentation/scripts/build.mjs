import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await copyFile(new URL('../src/common-sync.js', import.meta.url), new URL('../dist/common-sync.js', import.meta.url));
console.log('COMMON_SYNC_BUILD_OK');
