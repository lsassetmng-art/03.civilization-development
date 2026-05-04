import { buildBrainContext, renderPromptContext } from "../src/aiworker-brain-context-provider.mjs";

const tests = [
  {
    name: "HD-R1C smalltalk materials",
    modelCode: "HD-R1C",
    purposeCode: "smalltalk",
    requireMaterial: true,
    requireAnyDomain: ["food_nutrition", "season_calendar", "culture_region"],
    forbidDomains: ["business_operation", "professional_basic", "security_crisis"],
    requireText: "material_summary=",
  },
  {
    name: "HD-R2 risk materials",
    modelCode: "HD-R2",
    purposeCode: "risk_check",
    requireMaterial: true,
    requireAnyDomain: ["security_crisis"],
    forbidDomains: ["business_operation", "professional_basic"],
    requireText: "現実の攻撃",
  },
  {
    name: "HD-R5 business materials",
    modelCode: "HD-R5",
    purposeCode: "business_planning",
    requireMaterial: true,
    requireAnyDomain: ["business_operation"],
    forbidDomains: ["security_crisis"],
    requireText: "業務",
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
      includeMaterials: true,
    });
    const domains = domainSet(context);
    const prompt = renderPromptContext(context);
    const hasRequired = test.requireAnyDomain.some((domain) => domains.has(domain));
    const forbiddenHits = test.forbidDomains.filter((domain) => domains.has(domain));
    const hasMaterial = Number(context.materialCount || 0) > 0;
    const hasText = prompt.includes(test.requireText);
    const ok = hasRequired && forbiddenHits.length === 0 && (!test.requireMaterial || hasMaterial) && hasText;

    if (ok) {
      passCount += 1;
      console.log(`PASS ${test.name}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
    } else {
      failCount += 1;
      console.log(`FAIL ${test.name}`);
      console.log(`  sourceCount=${context.sourceCount} domainCount=${context.domainCount} materialCount=${context.materialCount}`);
      console.log(`  domains=${[...domains].sort().join(",")}`);
      console.log(`  forbiddenHits=${forbiddenHits.join(",")}`);
      console.log(`  hasText=${hasText}`);
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

if (failCount > 0) process.exit(1);
