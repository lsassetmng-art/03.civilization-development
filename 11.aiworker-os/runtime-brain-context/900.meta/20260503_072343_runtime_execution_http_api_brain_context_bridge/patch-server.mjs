import fs from "node:fs";

const serverFile = process.argv[2];
if (!serverFile) {
  throw new Error("server file arg required");
}

let text = fs.readFileSync(serverFile, "utf8");

const requireLine = 'const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");';

if (!text.includes(requireLine)) {
  if (text.includes('const http = require("http");')) {
    text = text.replace(
      'const http = require("http");',
      'const http = require("http");\n' + requireLine
    );
  } else {
    throw new Error('anchor not found: const http = require("http");');
  }
}

const routeMarker = 'BRAIN_CONTEXT_BRIDGE_ROUTE_V1';
const routeBlock = `
    // ${routeMarker}
    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/brain-context") {
      const modelCode = url.searchParams.get("model_code") || url.searchParams.get("modelCode") || "";
      const usePurposeCode =
        url.searchParams.get("use_purpose_code") ||
        url.searchParams.get("purpose_code") ||
        url.searchParams.get("task_domain_code") ||
        "reference";
      const domainsRaw = url.searchParams.get("domains") || "";
      const domainCodes = domainsRaw
        ? domainsRaw.split(",").map((value) => value.trim()).filter(Boolean)
        : [];
      const includeMissingSources =
        url.searchParams.get("include_missing_sources") === "true" ||
        url.searchParams.get("includeMissingSources") === "true";

      const brainContext = buildRuntimeBrainContext({
        modelCode,
        usePurposeCode,
        domainCodes,
        includeMissingSources
      });

      return sendJson(res, 200, {
        result: "ok",
        external_execution_performed_flag: false,
        data: {
          model_code: modelCode,
          use_purpose_code: brainContext.purposeCode,
          brain_context: brainContext,
          prompt_brain_context: renderPromptBrainContext(brainContext)
        }
      });
    }
`;

if (!text.includes(routeMarker)) {
  const anchor = 'if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request")';
  const idx = text.indexOf(anchor);
  if (idx === -1) {
    throw new Error(`anchor not found: ${anchor}`);
  }
  text = text.slice(0, idx) + routeBlock + "\n    " + text.slice(idx);
}

fs.writeFileSync(serverFile, text, "utf8");
