window.AICM_PAYLOAD_ADAPTER = {
  buildPolicySubmitPayload: function (policy) {
    return {
      policy_title: policy.policy_title,
      business_goal: policy.business_goal,
      expected_output: policy.expected_output,
      target_audience: policy.target_audience || "",
      constraints_text: policy.constraints_text || "",
      forbidden_text: policy.forbidden_text || "",
      quality_standard: policy.quality_standard || "",
      review_policy: policy.review_policy || "",
      delivery_requirement: policy.delivery_requirement || ""
    };
  },

  buildPipelineStartPayload: function (state, policy) {
    return {
      source_app: "AICompanyManager",
      project_id: state.currentProject ? state.currentProject.project_id : "mock-project-001",
      policy_id: state.currentPolicy ? state.currentPolicy.policy_id : "mock-policy-pending",
      execution_mode: "standard",
      review_strictness: "normal",
      human_approval_required: true,
      business_policy: window.AICM_PAYLOAD_ADAPTER.buildPolicySubmitPayload(policy)
    };
  },

  buildSnapshotRequest: function (state) {
    return {
      pipeline_run_id: state.currentPipeline ? state.currentPipeline.pipeline_run_id : "mock-pipeline-run-001",
      aiworker_run_ref: state.currentPipeline ? state.currentPipeline.aiworker_run_ref : "mock-aiworker-run-ref"
    };
  },

  normalizePipelineResponse: function (response) {
    return {
      ok: response.ok === true,
      aiworker_run_ref: response.aiworker_run_ref || "mock-aiworker-run-ref",
      pipeline_run_id: response.pipeline_run_id || "mock-pipeline-run-001",
      initial_status: response.initial_status || "president_planning",
      current_role_code: response.current_role_code || "president",
      current_stage: response.current_stage || "president_business_plan",
      role_assignments: response.role_assignments || []
    };
  }
};
