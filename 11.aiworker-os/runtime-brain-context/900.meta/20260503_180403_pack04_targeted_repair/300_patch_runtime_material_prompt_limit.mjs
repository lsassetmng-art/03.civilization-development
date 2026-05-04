import fs from "node:fs";

const files = process.argv.slice(2);
if (files.length === 0) {
  throw new Error("target files required");
}

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;

  text = text.replaceAll("materials.slice(0, 8)", "materials.slice(0, 20)");

  if (text === before) {
    console.log(`NO_CHANGE ${file}`);
  } else {
    fs.writeFileSync(file, text, "utf8");
    console.log(`PATCHED ${file}`);
  }

  if (!fs.readFileSync(file, "utf8").includes("materials.slice(0, 20)")) {
    throw new Error(`patch verification failed for ${file}`);
  }
}
