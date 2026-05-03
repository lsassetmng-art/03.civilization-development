import fs from 'node:fs';

const jsonPath = process.argv[2];
const outPath = process.argv[3];

function walkFind(obj, key, hits = []) {
  if (!obj || typeof obj !== 'object') return hits;
  if (Object.prototype.hasOwnProperty.call(obj, key)) hits.push(obj[key]);

  if (Array.isArray(obj)) {
    for (const v of obj) walkFind(v, key, hits);
  } else {
    for (const v of Object.values(obj)) walkFind(v, key, hits);
  }
  return hits;
}

function walkArrays(obj, path = '$', hits = []) {
  if (!obj || typeof obj !== 'object') return hits;

  if (Array.isArray(obj)) {
    const first = obj[0];
    const keys = first && typeof first === 'object' && !Array.isArray(first)
      ? Object.keys(first).slice(0, 20).join(',')
      : '';
    const sample = first && typeof first === 'object'
      ? JSON.stringify(first).slice(0, 280)
      : String(first ?? '').slice(0, 120);

    const title = first && typeof first === 'object'
      ? (
        first.title ||
        first.review_title ||
        first.display_title ||
        first.summary_title ||
        first.name ||
        first.task_name ||
        first.deliverable_name ||
        ''
      )
      : '';

    const text = `${path} ${keys} ${sample}`;
    const interesting =
      /review|human|pending|waiting|delivery|summary|approval|承認|レビュー|納品|サマリー/i.test(text);

    hits.push({
      path,
      length: obj.length,
      keys,
      title,
      interesting,
      sample
    });

    for (let i = 0; i < Math.min(obj.length, 3); i++) {
      walkArrays(obj[i], `${path}[${i}]`, hits);
    }
    return hits;
  }

  for (const [k, v] of Object.entries(obj)) {
    walkArrays(v, `${path}.${k}`, hits);
  }

  return hits;
}

function countKey(data, key) {
  const hits = walkFind(data, key);
  const counts = hits.map(v => Array.isArray(v) ? v.length : -1);
  return { hits: hits.length, max: counts.length ? Math.max(...counts) : -1, counts };
}

let raw = fs.readFileSync(jsonPath, 'utf8');
let data;

try {
  data = JSON.parse(raw);
} catch (e) {
  fs.writeFileSync(outPath, [
    `json_parse_error=${e.message}`,
    `raw_head=${raw.slice(0,500)}`
  ].join('\n') + '\n');
  process.exit(0);
}

const keys = [
  'review_wait_items',
  'reviewWaitItems',
  'human_review_items',
  'humanReviewItems',
  'review_waiting_items',
  'reviewWaitingItems',
  'approval_wait_items',
  'approvalWaitItems',
  'pending_review_items',
  'pendingReviewItems',
  'review_items',
  'reviewItems',
];

const lines = [];
lines.push(`top_keys=${Object.keys(data || {}).join(',')}`);

for (const key of keys) {
  const r = countKey(data, key);
  lines.push(`${key}.hits=${r.hits}`);
  lines.push(`${key}.max=${r.max}`);
  lines.push(`${key}.counts=${r.counts.join(',')}`);
}

const arrays = walkArrays(data)
  .filter(x => x.interesting || x.path.includes('review') || x.path.includes('human'))
  .sort((a, b) => b.length - a.length)
  .slice(0, 20);

lines.push(`interesting_array_count=${arrays.length}`);

arrays.forEach((a, idx) => {
  lines.push(`array_${idx}_path=${a.path}`);
  lines.push(`array_${idx}_length=${a.length}`);
  lines.push(`array_${idx}_keys=${a.keys}`);
  lines.push(`array_${idx}_title=${a.title}`);
  lines.push(`array_${idx}_sample=${a.sample}`);
});

const rawText = JSON.stringify(data);
lines.push(`raw_contains_nouhin_summary=${rawText.includes('納品サマリー確認')}`);
lines.push(`raw_contains_ai_company_start=${rawText.includes('AI企業業務開始導線')}`);
lines.push(`raw_contains_manager_major=${rawText.includes('Manager大項目台帳')}`);

fs.writeFileSync(outPath, lines.join('\n') + '\n');
