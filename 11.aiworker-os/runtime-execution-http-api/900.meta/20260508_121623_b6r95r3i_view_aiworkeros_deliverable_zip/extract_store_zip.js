const fs = require("fs");
const path = require("path");

const zipPath = process.argv[2];
const outDir = process.argv[3];

const buf = fs.readFileSync(zipPath);
let offset = 0;
const entries = [];

while (offset + 4 <= buf.length) {
  const sig = buf.readUInt32LE(offset);

  // local file header
  if (sig !== 0x04034b50) break;

  const method = buf.readUInt16LE(offset + 8);
  const compressedSize = buf.readUInt32LE(offset + 18);
  const fileNameLength = buf.readUInt16LE(offset + 26);
  const extraLength = buf.readUInt16LE(offset + 28);

  const nameStart = offset + 30;
  const nameEnd = nameStart + fileNameLength;
  const dataStart = nameEnd + extraLength;
  const dataEnd = dataStart + compressedSize;

  const name = buf.slice(nameStart, nameEnd).toString("utf8");

  if (method !== 0) {
    throw new Error(`Unsupported compression method ${method} for ${name}`);
  }

  const safeName = name.replace(/^\/+/, "").replace(/\.\./g, "__");
  const outPath = path.join(outDir, safeName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf.slice(dataStart, dataEnd));

  entries.push({
    name,
    size: compressedSize,
    outPath
  });

  offset = dataEnd;
}

fs.writeFileSync(
  path.join(outDir, "_zip_entries.json"),
  JSON.stringify(entries, null, 2)
);

console.log(`EXTRACTED_COUNT=${entries.length}`);
for (const e of entries) {
  console.log(`${String(e.size).padStart(8, " ")}  ${e.name}`);
}
