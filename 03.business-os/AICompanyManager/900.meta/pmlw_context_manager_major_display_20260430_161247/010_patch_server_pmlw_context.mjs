import fs from "node:fs";

const files = process.argv.slice(2).filter(Boolean);

function patchServer(file) {
  if (!fs.existsSync(file)) return { file, skipped: true, reason: "missing" };

  let src = fs.readFileSync(file, "utf8");
  const before = src;

  if (!src.includes("ownerCivilizationId")) {
    throw new Error(file + ": ownerCivilizationId not found");
  }

  if (!src.includes("pool.query")) {
    throw new Error(file + ": pool.query not found");
  }

  if (!src.includes("AICM_PMLW_CONTEXT_READ_AQD_AQG_V1")) {
    const helper = `

// AICM_PMLW_CONTEXT_READ_AQD_AQG_V1
async function readAicmPmlwContext(ownerCivilizationId) {
  const params = [ownerCivilizationId];

  const presidentPolicies = await pool.query(
    "select * from business.vw_aicm_pmlw_president_policy_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc",
    params
  );

  const majorItems = await pool.query(
    "select * from business.vw_aicm_pmlw_major_work_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc",
    params
  );

  const middleItems = await pool.query(
    "select * from business.vw_aicm_pmlw_leader_middle_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc",
    params
  );

  const deliverableRequirements = await pool.query(
    "select * from business.vw_aicm_pmlw_deliverable_requirement_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc",
    params
  );

  const workerWorkUnits = await pool.query(
    "select * from business.vw_aicm_pmlw_worker_work_unit_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc",
    params
  );

  const workflowTree = await pool.query(
    "select * from business.vw_aicm_pmlw_workflow_tree where owner_civilization_id = $1 order by last_updated_at desc",
    params
  );

  return {
    pmlw_president_policies: presidentPolicies.rows,
    pmlw_major_items: majorItems.rows,
    pmlw_middle_items: middleItems.rows,
    pmlw_deliverable_requirements: deliverableRequirements.rows,
    pmlw_worker_work_units: workerWorkUnits.rows,
    pmlw_workflow_tree: workflowTree.rows
  };
}
`;

    const insertPos = src.indexOf("function sendJson");
    if (insertPos >= 0) {
      src = src.slice(0, insertPos) + helper + "\n" + src.slice(insertPos);
    } else {
      const createServerPos = src.indexOf("createServer");
      if (createServerPos < 0) throw new Error(file + ": cannot locate helper insertion point");
      src = src.slice(0, createServerPos) + helper + "\n" + src.slice(createServerPos);
    }
  }

  if (!src.includes("const aicmPmlwContext = await readAicmPmlwContext(ownerCivilizationId);")) {
    const taskKey = src.indexOf("task_ledger");
    if (taskKey < 0) throw new Error(file + ": task_ledger property not found");

    const sendJsonPos = Math.max(
      src.lastIndexOf("sendJson", taskKey),
      src.lastIndexOf("writeJson", taskKey),
      src.lastIndexOf("jsonResponse", taskKey)
    );

    if (sendJsonPos < 0) throw new Error(file + ": context response function not found");

    const lineStart = src.lastIndexOf("\n", sendJsonPos) + 1;
    const declaration = "    const aicmPmlwContext = await readAicmPmlwContext(ownerCivilizationId);\n";
    src = src.slice(0, lineStart) + declaration + src.slice(lineStart);
  }

  if (!src.includes("pmlw_major_items: aicmPmlwContext.pmlw_major_items")) {
    const re = /(\n\s*task_ledger\s*:\s*[^,\n}]+)(,?)/;
    if (!re.test(src)) throw new Error(file + ": task_ledger property replacement failed");

    src = src.replace(re, `$1,
      pmlw_president_policies: aicmPmlwContext.pmlw_president_policies,
      pmlw_major_items: aicmPmlwContext.pmlw_major_items,
      pmlw_middle_items: aicmPmlwContext.pmlw_middle_items,
      pmlw_deliverable_requirements: aicmPmlwContext.pmlw_deliverable_requirements,
      pmlw_worker_work_units: aicmPmlwContext.pmlw_worker_work_units,
      pmlw_workflow_tree: aicmPmlwContext.pmlw_workflow_tree$2`);
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    return { file, changed: true };
  }

  return { file, changed: false };
}

for (const file of files) {
  const result = patchServer(file);
  console.log(JSON.stringify(result));
}
