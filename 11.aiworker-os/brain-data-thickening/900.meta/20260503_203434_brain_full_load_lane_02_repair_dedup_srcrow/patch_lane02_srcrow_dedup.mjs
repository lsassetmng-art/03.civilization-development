import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("SQL file required");

let text = fs.readFileSync(file, "utf8");

const selectMarker = "        SELECT\n          'srcrow:' ||";
const wrappedMarker = "        SELECT DISTINCT ON (brain_data_code) *\n        FROM (\n        SELECT\n          'srcrow:' ||";
const conflictMarker = "        ON CONFLICT (brain_data_code) DO UPDATE SET";
const closeBlock = "        ) dedup_src\n        ORDER BY brain_data_code\n";

let selectPatchCount = 0;
while (text.includes(selectMarker)) {
  text = text.replace(selectMarker, wrappedMarker);
  selectPatchCount += 1;
}

let closePatchCount = 0;
let searchPos = 0;
while (true) {
  const start = text.indexOf(wrappedMarker, searchPos);
  if (start < 0) break;

  const conflict = text.indexOf(conflictMarker, start);
  if (conflict < 0) {
    throw new Error("Could not find ON CONFLICT after srcrow block");
  }

  const beforeConflict = text.slice(Math.max(0, conflict - closeBlock.length - 20), conflict);
  if (!beforeConflict.includes("dedup_src")) {
    text = text.slice(0, conflict) + closeBlock + text.slice(conflict);
    closePatchCount += 1;
    searchPos = conflict + closeBlock.length + conflictMarker.length;
  } else {
    searchPos = conflict + conflictMarker.length;
  }
}

if (selectPatchCount < 2 || closePatchCount < 2) {
  throw new Error(`Unexpected patch count: select=${selectPatchCount}, close=${closePatchCount}`);
}

fs.writeFileSync(file, text, "utf8");

console.log(`PATCH_OK srcrow SELECT blocks wrapped: ${selectPatchCount}`);
console.log(`PATCH_OK dedup close blocks inserted: ${closePatchCount}`);
console.log("PATCH_RULE=SELECT DISTINCT ON (brain_data_code) * FROM (...) dedup_src");
