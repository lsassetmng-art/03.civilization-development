import { access } from 'node:fs/promises';
await access(new URL('../src/common-shell.js', import.meta.url));
await access(new URL('../demo/index.html', import.meta.url));
console.log('COMMON_SHELL_VERIFY_OK');
