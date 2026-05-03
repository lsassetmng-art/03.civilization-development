import fs from 'node:fs';

const csvFile = process.env.CSV_FILE || '';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuote = false;

  text = String(text || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
        continue;
      }
      if (ch === '"') {
        inQuote = false;
        continue;
      }
      field += ch;
      continue;
    }

    if (ch === '"') {
      inQuote = true;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (ch === '\r') {
      continue;
    }

    field += ch;
  }

  row.push(field);
  if (row.some(v => String(v || '').trim() !== '')) rows.push(row);

  if (rows.length < 1) return { headers: [], records: [] };

  const headers = rows[0].map(v => String(v || '').trim());
  const records = rows.slice(1)
    .filter(r => r.some(v => String(v || '').trim() !== ''))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = String(r[i] || '').trim();
      });
      return obj;
    });

  return { headers, records };
}

const expected = [
  'department_name',
  'section_name',
  'major_item_name',
  'major_item_description',
  'assigned_leader_label',
  'priority_code',
  'due_date',
  'note'
];

if (!csvFile || !fs.existsSync(csvFile)) {
  console.log('CSV_PARSE_STATUS=CSV_FILE_NOT_FOUND');
  process.exit(0);
}

const text = fs.readFileSync(csvFile, 'utf8');
const parsed = parseCsv(text);
const missing = expected.filter(h => !parsed.headers.includes(h));

console.log('CSV_PARSE_STATUS=OK');
console.log('CSV_FILE=' + csvFile);
console.log('CSV_BYTES=' + Buffer.byteLength(text));
console.log('CSV_HEADER_COUNT=' + parsed.headers.length);
console.log('CSV_HEADERS=' + parsed.headers.join(','));
console.log('CSV_RECORD_COUNT=' + parsed.records.length);
console.log('CSV_EXPECTED_MISSING=' + missing.join(','));
console.log('CSV_FIRST_RECORD=' + JSON.stringify(parsed.records[0] || {}));
