window.AICM_API_CLIENT = {
  mode: "mock",

  submitPolicy: function (policy) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({
          ok: true,
          policy_id: "mock-policy-" + Date.now(),
          project_id: "mock-project-001",
          project_status: "policy_submitted",
          next_action: "start_pipeline",
          policy: policy
        });
      }, 120);
    });
  },

  getPipelineStatus: function (pipelineRunId) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({
          ok: true,
          pipeline_run_id: pipelineRunId || "mock-pipeline-run-001",
          project_id: "mock-project-001",
          run_status: "leader_reviewing",
          current_role_code: "leader",
          current_stage: "leader_review",
          updated_at: new Date().toISOString()
        });
      }, 120);
    });
  }
};
