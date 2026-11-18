import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getKnowledgeDomainProviders,
  selectKnowledgeDomainProviders,
} from '../11.aiworker-os/runtime-execution-http-api/lib/knowledge-domain-brain/index.mjs';
import { mergeArchitectureMediaDomainCodes } from '../11.aiworker-os/runtime-execution-http-api/lib/knowledge-domain-brain/domain-classifier.mjs';
import { buildArchitectureMediaKnowledgeRuntimeContext } from '../11.aiworker-os/runtime-execution-http-api/lib/knowledge-domain-brain/kdb-runtime-context.mjs';
import { resolveSelectedKnowledgeProviders } from '../11.aiworker-os/runtime-execution-http-api/lib/knowledge-domain-brain/kdb-result-service.mjs';

test('registry loads both declared KDB providers', () => {
  assert.deepEqual(getKnowledgeDomainProviders().map((p) => p.providerCode), ['architecture', 'media_analysis']);
  assert.deepEqual(selectKnowledgeDomainProviders(['architecture']).map((p) => p.providerCode), ['architecture']);
});

test('domain merge is deterministic and preserves explicit domains', () => {
  const result = mergeArchitectureMediaDomainCodes(['helpdesk', 'helpdesk'], {
    instructionText: '住宅 空間 の画像を整理する',
    sourceFiles: ['floorplan.png'],
  });
  assert.deepEqual(result, ['helpdesk', 'architecture', 'media_analysis']);
  assert.deepEqual(mergeArchitectureMediaDomainCodes([], {}), []);
});

test('runtime context selects providers and resolves references without IO', async () => {
  const context = await buildArchitectureMediaKnowledgeRuntimeContext({
    instructionText: '住宅の空間と画像の説明',
    sourceFiles: ['floorplan.png'],
  });
  assert.deepEqual(context.selectedProviderCodes, ['architecture', 'media_analysis']);
  const result = await resolveSelectedKnowledgeProviders(context);
  assert.equal(result.ok, true);
  assert.equal(result.providerResultCount, 2);
  assert.ok(result.selectedReferences.length >= 4);
  assert.equal(result.metadata.dbConnection, false);
  assert.equal(result.metadata.dbWrite, false);
});

test('empty and failed providers require review', async () => {
  const empty = await resolveSelectedKnowledgeProviders({ selectedProviders: [] });
  assert.equal(empty.statusCode, 'NO_SELECTED_PROVIDERS');
  assert.equal(empty.requiresHumanReview, true);
  const failed = await resolveSelectedKnowledgeProviders({
    selectedProviders: [{ providerCode: 'failed', supportedDomainCodes: ['architecture'],
      resolveKnowledgeContext() { throw new Error('expected test failure'); } }],
  });
  assert.equal(failed.ok, false);
  assert.equal(failed.requiresHumanReview, true);
});
