const fs = require("fs");
const serverPath = process.argv[2];

let src = fs.readFileSync(serverPath, "utf8");

if (!src.includes("AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START")) {
  throw new Error("R1_MARKER_MISSING");
}

/*
  Known R1 patch risk:
  One SQL array line can be emitted without a closing JS quote:
      "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,
  Correct:
      "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,"
*/
const brokenLine = /^(\s*)"    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,\s*$/m;
let fixedCount = 0;

if (brokenLine.test(src)) {
  src = src.replace(brokenLine, (_, indent) => {
    fixedCount += 1;
    return `${indent}"    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,"`;
  });
}

fs.writeFileSync(serverPath, src, "utf8");

console.log(`FIXED_COUNT=${fixedCount}`);
