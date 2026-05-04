import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("bridge file required");

let text = fs.readFileSync(file, "utf8");

if (!text.includes("function renderPromptContext")) {
  throw new Error("renderPromptContext function not found");
}

if (!text.includes("bridge.renderPromptBrainContext")) {
  const marker = "bridge.renderPromptContext = renderPromptContext;";
  if (!text.includes(marker)) {
    throw new Error("renderPromptContext export marker not found");
  }

  text = text.replace(
    marker,
    `${marker}
bridge.renderPromptBrainContext = renderPromptContext;`
  );
}

if (!text.includes("bridge.renderPromptBrainContext = renderPromptContext;")) {
  throw new Error("renderPromptBrainContext alias was not inserted");
}

fs.writeFileSync(file, text, "utf8");
console.log("PATCH_OK renderPromptBrainContext alias added");
console.log(`PATCHED_FILE=${file}`);
