import { access } from 'node:fs/promises';
await access(new URL('../app/index.html', import.meta.url));
await access(new URL('../../CommonShell/src/common-shell.js', import.meta.url));
await access(new URL('../../CommonSyncPresentation/src/common-sync.js', import.meta.url));
console.log('COMMONOS_PLAYGROUND_VERIFY_OK');
