import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await copyFile(new URL('../src/commonos.js', import.meta.url), new URL('../dist/commonos.js', import.meta.url));
console.log('COMMON_UI_RUNTIME_BUILD_OK');
