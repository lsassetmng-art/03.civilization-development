#!/data/data/com.termux/files/usr/bin/env node
import { buildBrainContext, renderPromptContext } from "../src/aiworker-brain-context-provider.mjs";

const modelCode = process.argv[2] || process.env.AIWORKER_MODEL_CODE || "HD-R1C";
const purposeCode = process.argv[3] || process.env.AIWORKER_USE_PURPOSE_CODE || "smalltalk";
const asPrompt = process.argv.includes("--prompt");

const context = buildBrainContext({ modelCode, purposeCode });

if (asPrompt) {
  console.log(renderPromptContext(context));
} else {
  console.log(JSON.stringify(context, null, 2));
}
