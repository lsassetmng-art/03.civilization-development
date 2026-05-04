const bridge = require(process.env.BRIDGE_FILE);

const input = {
  model_code: "BYD2-003",
  use_purpose_code: "review",
  purpose_code: "review",
  domains: "history_worldview,civilization_foundation_history,education_learning,exam_learning",
  limit_per_domain: "20",
  total_limit: "80",
};

function tryCall(name, fn) {
  try {
    const result = fn(input);
    const ctx = result?.brain_context || result?.brainContext || result?.context || result;
    console.log(`PASS ${name}`);
    console.log(`  type=${typeof result}`);
    console.log(`  providerVersion=${ctx?.providerVersion}`);
    console.log(`  selectorFunction=${ctx?.selectorFunction}`);
    console.log(`  materialCount=${ctx?.materialCount}`);
    console.log(`  srcmatCount=${ctx?.srcmatCount}`);
    console.log(`  lane05Count=${ctx?.lane05Count}`);
    console.log(`  pack05Count=${ctx?.pack05Count}`);
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.log(`  error=${error && error.stack ? error.stack : String(error)}`);
  }
}

console.log("BRIDGE_TYPE", typeof bridge);
console.log("BRIDGE_KEYS", Object.keys(bridge).sort().join(","));

if (typeof bridge === "function") {
  tryCall("default_function_bridge", bridge);
}

for (const name of [
  "buildBrainContext",
  "getBrainContext",
  "getRuntimeBrainContext",
  "buildRuntimeBrainContext",
  "resolveBrainContext",
  "buildBrainContextPayload",
  "createBrainContextPayload",
]) {
  if (typeof bridge[name] === "function") {
    tryCall(name, bridge[name]);
  } else {
    console.log(`MISSING ${name}`);
  }
}
