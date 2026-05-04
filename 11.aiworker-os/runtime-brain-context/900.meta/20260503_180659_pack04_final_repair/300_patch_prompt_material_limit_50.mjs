import fs from "node:fs";

const files = process.argv.slice(2);
if (files.length === 0) {
  throw new Error("target files required");
}

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;

  text = text.replace(/materials\.slice\(0,\s*(8|20|50)\)/g, "materials.slice(0, 50)");

  if (!text.includes("materials.slice(0, 50)")) {
    throw new Error(`materials.slice(0, 50) not found after patch: ${file}`);
  }

  fs.writeFileSync(file, text, "utf8");

  if (text === before) {
    console.log(`NO_CHANGE_ALREADY_50 ${file}`);
  } else {
    console.log(`PATCHED_LIMIT_50 ${file}`);
  }
}
