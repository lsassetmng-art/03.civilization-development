import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const before = src;

const exactDepartmentEditLine = "      '  <button type=\"button\" data-core-action=\"go\" data-screen=\"department-edit\">部門変更</button>',\n";
const exactSectionEditLine = "      '  <button type=\"button\" data-core-action=\"go\" data-screen=\"section-edit\">課変更</button>',\n";

src = src.replace(exactDepartmentEditLine, "");
src = src.replace(exactSectionEditLine, "");

/*
 * Fallback: remove only toolbar-level edit buttons.
 * This keeps per-card edit buttons:
 * - department card: data-screen="department-edit">変更
 * - section card: data-screen="section-edit">変更
 */
src = src.replace(
  /\s*'\s*<button type="button" data-core-action="go" data-screen="department-edit">部門変更<\/button>',\n/g,
  ""
);
src = src.replace(
  /\s*'\s*<button type="button" data-core-action="go" data-screen="section-edit">課変更<\/button>',\n/g,
  ""
);

if (src === before) {
  throw new Error("No toolbar edit button lines were removed");
}

fs.writeFileSync(file, src);
console.log("org toolbar duplicate edit buttons removed");
