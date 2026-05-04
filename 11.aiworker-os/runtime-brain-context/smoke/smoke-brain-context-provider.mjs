import { buildBrainContext, renderPromptContext } from "../src/aiworker-brain-context-provider.mjs";

const tests = [
  {
    name: "HD-R1C smalltalk only",
    modelCode: "HD-R1C",
    purposeCode: "smalltalk",
    requireAnyDomain: ["food_nutrition", "season_calendar", "culture_region"],
    forbidDomains: ["business_operation", "professional_basic", "security_crisis"],
  },
  {
    name: "HD-R5 business planning",
    modelCode: "HD-R5",
    purposeCode: "business_planning",
    requireAnyDomain: ["business_operation"],
    forbidDomains: ["security_crisis"],
  },
  {
    name: "HD-R2 risk check security only",
    modelCode: "HD-R2",
    purposeCode: "risk_check",
    requireAnyDomain: ["security_crisis"],
    forbidDomains: ["business_operation", "professional_basic"],
  },
  {
    name: "BYD2-003 review professional/business",
    modelCode: "BYD2-003",
    purposeCode: "review",
    requireAnyDomain: ["business_operation", "professional_basic", "civilization_foundation_history"],
    forbidDomains: ["security_crisis"],
  },
];

let passCount = 0;
let failCount = 0;

function domainSet(context) {
  return new Set((context.domains || []).map((domain) => domain.brainDomainCode));
}

for (const test of tests) {
  try {
    const context = buildBrainContext({
      modelCode: test.modelCode,
      purposeCode: test.purposeCode,
    });

    const domains = domainSet(context);
    const hasRequired = test.requireAnyDomain.some((domain) => domains.has(domain));
    const forbiddenHits = test.forbidDomains.filter((domain) => domains.has(domain));
    const hasSources = Number(context.sourceCount || 0) > 0;
    const promptText = renderPromptContext(context);
    const promptLooksValid =
      promptText.includes("[AIWORKER_BRAIN_CONTEXT]") &&
      promptText.includes("[/AIWORKER_BRAIN_CONTEXT]") &&
      promptText.includes(`model_code=${test.modelCode}`);

    const ok = hasSources && hasRequired && forbiddenHits.length === 0 && promptLooksValid;

    if (ok) {
      passCount += 1;
      console.log(`PASS ${test.name}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
    } else {
      failCount += 1;
      console.log(`FAIL ${test.name}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  requiredAny=${test.requireAnyDomain.join(",")}`);
      console.log(`  forbiddenHits=${forbiddenHits.join(",")}`);
      console.log(`  promptLooksValid=${promptLooksValid}`);
    }
  } catch (error) {
    failCount += 1;
    console.log(`FAIL ${test.name}`);
    console.log(`  error=${error && error.message ? error.message : String(error)}`);
  }
}

console.log("============================================================");
console.log(`PASS_COUNT=${passCount}`);
console.log(`FAIL_COUNT=${failCount}`);
console.log("============================================================");

if (failCount > 0) {
  process.exit(1);
}
