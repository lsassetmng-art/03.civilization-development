import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await copyFile(new URL('../src/common-shell.js', import.meta.url), new URL('../dist/common-shell.js', import.meta.url));
console.log('COMMON_SHELL_BUILD_OK');
