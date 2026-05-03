import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_ROLE_SYNC_OWNER_RESOLVER_AXK_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

if (!src.includes('function aicmAxcSyncRolePlacementsForPayload')) {
  console.error('Missing function aicmAxcSyncRolePlacementsForPayload');
  process.exit(1);
}

if (!src.includes(marker)) {
  const oldLine = 'owner_civilization_id: ownerId(),';
  const newLine = `// ${marker}
    owner_civilization_id: (
      typeof aicmAvdOwnerId === "function"
        ? aicmAvdOwnerId()
        : ((typeof state !== "undefined" && state && state.ownerCivilizationId) ? state.ownerCivilizationId : "")
    ),`;

  if (!src.includes(oldLine)) {
    console.error('Expected ownerId() sync line not found');
    process.exit(1);
  }

  src = src.replace(oldLine, newLine);
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(marker)}`);
console.log(`ownerIdCallCount=${countText('ownerId()')}`);
console.log(`aicmAvdOwnerIdCount=${countText('aicmAvdOwnerId')}`);
console.log(`syncFunctionCount=${countText('function aicmAxcSyncRolePlacementsForPayload')}`);
console.log(`syncEndpointCount=${countText('/api/aicm/v2/placement/sync-role-settings')}`);
