import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("SQL file required");

let text = fs.readFileSync(file, "utf8");
const before = text;

text = text.replace(
  "(axis_code, axis_order, axis_title_ja, axis_summary_ja, axis_use_ja, active_flag)",
  "(axis_code, axis_order, axis_title_ja, axis_summary_ja, axis_use_ja)"
);

if (text === before) {
  throw new Error("Patch target not found or no change made");
}

if (text.includes("(axis_code, axis_order, axis_title_ja, axis_summary_ja, axis_use_ja, active_flag)")) {
  throw new Error("active_flag target column still remains in fill axis INSERT");
}

fs.writeFileSync(file, text, "utf8");

console.log("PATCH_OK removed active_flag from fill_axis INSERT target columns");
console.log(`PATCHED_FILE=${file}`);
