window.AICM_AIWORKER_BRIDGE = {
  mode: "mock",

  startPipeline: function (policy) {
    var state = window.AICM_STATE ? window.AICM_STATE.get() : {};
    var payload = window.AICM_PAYLOAD_ADAPTER.buildPipelineStartPayload(state, policy);

    if (!window.AICM_RUNTIME_CONFIG.isMock()) {
      return window.AICM_SERVER_ROUTE_CLIENT.startPipeline(payload).then(function (response) {
        return window.AICM_PAYLOAD_ADAPTER.normalizePipelineResponse(response);
      });
    }

    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(window.AICM_PAYLOAD_ADAPTER.normalizePipelineResponse({
          ok: true,
          aiworker_run_ref: "mock-aiworker-run-" + Date.now(),
          pipeline_run_id: "mock-pipeline-run-" + Date.now(),
          initial_status: "president_planning",
          current_role_code: "president",
          current_stage: "president_business_plan",
          role_assignments: [
            { role_code: "president", display_name: "Mock President" },
            { role_code: "manager", display_name: "Mock Manager" },
            { role_code: "leader", display_name: "Mock Leader" },
            { role_code: "worker", display_name: "Mock Worker" }
          ]
        }));
      }, 150);
    });
  },

  pullSnapshot: function (aiworkerRunRef) {
    var state = window.AICM_STATE ? window.AICM_STATE.get() : {};
    var request = window.AICM_PAYLOAD_ADAPTER.buildSnapshotRequest(state);
    request.aiworker_run_ref = aiworkerRunRef || request.aiworker_run_ref;

    if (!window.AICM_RUNTIME_CONFIG.isMock()) {
      return window.AICM_SERVER_ROUTE_CLIENT.pullSnapshot(request);
    }

    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({
          ok: true,
          aiworker_run_ref: request.aiworker_run_ref || "mock-aiworker-run-ref",
          run_status: "worker_executing",
          current_role_code: "worker",
          current_stage: "worker_execution",
          roles: [
            { role: "President", status: "計画完了", detail: "事業計画とManager指示を作成済み" },
            { role: "Manager", status: "分解完了", detail: "領域とアクションをLeaderへ配布済み" },
            { role: "Leader", status: "タスク配布", detail: "成果物とタスクをWorkerへ配布済み" },
            { role: "Worker", status: "実行中", detail: "タスクを実施して成果物を作成中" }
          ],
          reviews: [
            { id: "review-101", deliverable_id: "deliverable-101", title: "Worker成果物A", reviewer_role: "leader", status: "pending", detail: "Leaderレビュー待ち" },
            { id: "review-102", deliverable_id: "deliverable-102", title: "Worker成果物B", reviewer_role: "leader", status: "approved", detail: "Leaderレビュー合格" }
          ],
          deliveries: [
            { id: "delivery-row-101", delivery_id: "delivery-101", approval_id: "approval-101", deliverable_id: "deliverable-final-101", title: "納品候補 v1", status: "prepared", approval_status: "approved", detail: "統合準備中" }
          ],
          updated_at: new Date().toISOString()
        });
      }, 150);
    });
  }
};
