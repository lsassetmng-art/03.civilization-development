import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("SQL file path required");

let text = fs.readFileSync(file, "utf8");

const bad = "\nWHERE a.can_read_flag IS DISTINCT FROM false;";
if (!text.includes(bad)) {
  throw new Error("target line not found: WHERE a.can_read_flag IS DISTINCT FROM false;");
}

text = text.replace(bad, ";");

fs.writeFileSync(file, text, "utf8");
console.log("PATCH_OK removed invalid can_read_flag filter");
