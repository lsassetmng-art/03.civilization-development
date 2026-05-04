const bridge = require(process.env.BRIDGE_FILE);

console.log("BRIDGE_KEYS", Object.keys(bridge).sort().join(","));

if (typeof bridge.buildRuntimeBrainContext !== "function") {
  throw new Error("buildRuntimeBrainContext missing");
}

if (typeof bridge.renderPromptBrainContext !== "function") {
  throw new Error("renderPromptBrainContext missing");
}

const ctx = bridge.buildRuntimeBrainContext({
  model_code: "BYD2-003",
  use_purpose_code: "review",
  purpose_code: "review",
  domains: "history_worldview,civilization_foundation_history,education_learning,exam_learning",
  limit_per_domain: "20",
  total_limit: "80",
});

const prompt = bridge.renderPromptBrainContext(ctx);

console.log("PASS buildRuntimeBrainContext");
console.log(`providerVersion=${ctx.providerVersion}`);
console.log(`selectorFunction=${ctx.selectorFunction}`);
console.log(`materialCount=${ctx.materialCount}`);
console.log(`srcmatCount=${ctx.srcmatCount}`);
console.log(`lane05Count=${ctx.lane05Count}`);
console.log(`pack05Count=${ctx.pack05Count}`);

if (ctx.providerVersion !== "lane07-selector-v1") {
  throw new Error(`unexpected providerVersion=${ctx.providerVersion}`);
}

if (!prompt.includes("[AIWORKER_BRAIN_CONTEXT]")) {
  throw new Error("prompt marker missing");
}

console.log("PASS renderPromptBrainContext");
