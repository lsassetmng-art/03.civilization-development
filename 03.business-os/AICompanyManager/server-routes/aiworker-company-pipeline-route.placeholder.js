export async function startCompanyPipelinePlaceholder(requestJson) {
  return {
    ok: true,
    placeholder: true,
    route: "startCompanyPipelinePlaceholder",
    received_source_app: requestJson && requestJson.source_app,
    current_role_code: "president",
    current_stage: "president_business_plan"
  };
}

export async function pullCompanyPipelineSnapshotPlaceholder(requestJson) {
  return {
    ok: true,
    placeholder: true,
    route: "pullCompanyPipelineSnapshotPlaceholder",
    aiworker_run_ref: requestJson && requestJson.aiworker_run_ref,
    current_role_code: "worker",
    current_stage: "worker_execution"
  };
}
