(function () {
  "use strict";

  function text(value) {
    return String(value == null ? "" : value);
  }

  function badgeClass(status) {
    var mapped = window.AICM_COMMONOS_SYNC_PRESENTER
      ? window.AICM_COMMONOS_SYNC_PRESENTER.mapStatus(status)
      : null;

    if (mapped && mapped.tone === "ok") {
      return "badge ok";
    }
    if (mapped && mapped.tone === "danger") {
      return "badge danger";
    }
    if (mapped && mapped.tone === "muted") {
      return "badge muted";
    }

    if (status === "approved" || status === "accepted" || status === "synced" || status === "prepared" || status === "計画完了" || status === "分解完了") {
      return "badge ok";
    }
    if (status === "returned" || status === "pending" || status === "waiting" || status === "human_approval_waiting" || status === "revision_requested" || status === "実行中" || status === "タスク配布") {
      return "badge warn";
    }
    if (status === "failed" || status === "blocked" || status === "conflict" || status === "rejected") {
      return "badge danger";
    }
    return "badge";
  }

  function renderMetrics(metrics) {
    var root = document.getElementById("metricGrid");
    root.innerHTML = "";
    metrics.forEach(function (metric) {
      var el = document.createElement("div");
      el.className = "metric";
      el.innerHTML = "<strong>" + text(metric.value) + "</strong><span>" + text(metric.label) + "</span>";
      root.appendChild(el);
    });
  }

  function renderRoles(roles) {
    var root = document.getElementById("rolePipeline");
    root.innerHTML = "";
    roles.forEach(function (role) {
      var el = document.createElement("div");
      el.className = "role-card";
      el.innerHTML =
        "<div class=\"role-main\"><strong>" + text(role.role) + "</strong><span>" + text(role.detail) + "</span></div>" +
        "<span class=\"" + badgeClass(role.status) + "\">" + text(role.status) + "</span>";
      root.appendChild(el);
    });
  }

  function renderReviews(items) {
    var root = document.getElementById("reviewBoard");
    root.innerHTML = "";
    items.forEach(function (item) {
      var el = document.createElement("div");
      el.className = "list-item";
      el.innerHTML =
        "<strong>" + text(item.title) + "</strong>" +
        "<p>" + text(item.detail) + "</p>" +
        "<span class=\"" + badgeClass(item.status) + "\">" + text(item.status) + "</span>" +
        "<small>reviewer=" + text(item.reviewer_role) + " / deliverable=" + text(item.deliverable_id) + "</small>";
      root.appendChild(el);
    });
  }

  function renderDeliveries(items) {
    var root = document.getElementById("deliveryBoard");
    root.innerHTML = "";
    items.forEach(function (item) {
      var el = document.createElement("div");
      el.className = "list-item";
      el.innerHTML =
        "<strong>" + text(item.title) + "</strong>" +
        "<p>" + text(item.detail) + "</p>" +
        "<span class=\"" + badgeClass(item.status) + "\">delivery=" + text(item.status) + "</span> " +
        "<span class=\"" + badgeClass(item.approval_status) + "\">approval=" + text(item.approval_status) + "</span>" +
        "<small>approval=" + text(item.approval_id) + " / delivery=" + text(item.delivery_id) + "</small>";
      root.appendChild(el);
    });
  }

  function renderQueueSummary(items) {
    var root = document.getElementById("queueSummary");
    var summary = window.AICM_COMMONOS_SYNC_PRESENTER.summarize(items);
    var rows = [
      ["total", "全体"],
      ["pending", "待機"],
      ["synced", "同期済"],
      ["failed", "失敗"],
      ["conflict", "競合"]
    ];

    root.innerHTML = "";
    rows.forEach(function (row) {
      var key = row[0];
      var label = row[1];
      var el = document.createElement("div");
      el.className = "summary-chip";
      el.innerHTML = "<strong>" + text(summary[key] || 0) + "</strong><span>" + label + "</span>";
      root.appendChild(el);
    });
  }

  function renderQueue(items) {
    var root = document.getElementById("queueBoard");
    root.innerHTML = "";
    items.forEach(function (item) {
      var mapped = window.AICM_COMMONOS_SYNC_PRESENTER.mapStatus(item.status);
      var el = document.createElement("div");
      el.className = "queue-item";
      el.innerHTML =
        "<strong>" + text(item.type) + "</strong>" +
        "<p>" + text(item.detail) + "</p>" +
        "<span class=\"" + badgeClass(item.status) + "\">" + text(mapped.label) + "</span>" +
        "<small>presentation=" + text(mapped.presentation) + " / action=" + text(mapped.action) + "</small>";
      root.appendChild(el);
    });
  }

  function renderEvents(items) {
    var root = document.getElementById("eventLog");
    root.innerHTML = "";
    items.forEach(function (item) {
      var el = document.createElement("div");
      el.className = "event-item";
      el.innerHTML =
        "<strong>" + text(item.type) + "</strong>" +
        "<p>" + text(item.message) + "</p>" +
        "<small>" + text(item.created_at) + "</small>";
      root.appendChild(el);
    });
  }

  function render() {
    var state = window.AICM_STATE.get();

    document.getElementById("syncStatus").textContent = state.syncStatus;
    document.getElementById("companySummary").textContent = state.company.summary;

    renderMetrics(state.company.metrics);
    renderRoles(state.roles);
    renderReviews(state.reviews);
    renderDeliveries(state.deliveries);
    renderQueueSummary(state.queue);
    renderQueue(state.queue);
    renderEvents(state.events);
  }

  function readPolicyForm() {
    return {
      policy_title: document.getElementById("policyTitleInput").value,
      business_goal: document.getElementById("businessGoalInput").value,
      expected_output: document.getElementById("expectedOutputInput").value,
      target_audience: "AI企業運営ユーザー",
      constraints_text: "Phase K mock only",
      forbidden_text: "live AIWorkerOS call is not allowed in mock phase",
      quality_standard: "reviewable and deliverable",
      review_policy: "Leader review then Manager review then President final review",
      delivery_requirement: "human approval required"
    };
  }

  function updateWithAction(actionFn, statusText) {
    window.AICM_STATE.update(function (state) {
      actionFn(state);
      state.syncStatus = statusText;
      return state;
    });
    render();
  }

  function wireActions() {
    document.getElementById("submitPolicyButton").addEventListener("click", function () {
      var policy = readPolicyForm();
      window.AICM_API_CLIENT.submitPolicy(policy).then(function (response) {
        window.AICM_STATE.update(function (state) {
          state.currentPolicy = response;
          state.currentProject.project_status = response.project_status;
          window.AICM_QUEUE.add(state, "policy_submit", response, "方針送信モックをキューに追加");
          window.AICM_EVENTS.add(state, "policy_submitted", "方針送信モック完了", response.policy_id);
          state.syncStatus = "policy submitted mock";
          return state;
        });
        render();
      });
    });

    document.getElementById("startPipelineButton").addEventListener("click", function () {
      var state = window.AICM_STATE.get();
      var policy = state.currentPolicy ? state.currentPolicy.policy : readPolicyForm();
      window.AICM_AIWORKER_BRIDGE.startPipeline(policy).then(function (response) {
        window.AICM_STATE.update(function (nextState) {
          nextState.currentPipeline = response;
          nextState.roles = [
            { role: "President", status: "事業計画作成", detail: "方針から事業計画とManager指示を作成" },
            { role: "Manager", status: "待機", detail: "President計画待ち" },
            { role: "Leader", status: "待機", detail: "Manager指示待ち" },
            { role: "Worker", status: "待機", detail: "Leaderタスク待ち" }
          ];
          window.AICM_QUEUE.add(nextState, "pipeline_start", response, "Pipeline開始モックをキューに追加");
          window.AICM_EVENTS.add(nextState, "pipeline_started", "AIWorkerOS bridge mock started", response.aiworker_run_ref);
          nextState.syncStatus = "pipeline started mock";
          return nextState;
        });
        render();
      });
    });

    document.getElementById("pullSnapshotButton").addEventListener("click", function () {
      var state = window.AICM_STATE.get();
      var runRef = state.currentPipeline ? state.currentPipeline.aiworker_run_ref : "mock-aiworker-run-ref";
      window.AICM_AIWORKER_BRIDGE.pullSnapshot(runRef).then(function (snapshot) {
        window.AICM_STATE.update(function (nextState) {
          nextState.roles = snapshot.roles;
          nextState.reviews = snapshot.reviews;
          nextState.deliveries = snapshot.deliveries;
          window.AICM_QUEUE.add(nextState, "pipeline_snapshot_pull", snapshot, "Snapshot取得モックをキューに追加");
          window.AICM_EVENTS.add(nextState, "snapshot_pulled", "Pipeline snapshot mock pulled", snapshot.current_stage);
          nextState.syncStatus = "snapshot pulled mock";
          return nextState;
        });
        render();
      });
    });

    document.getElementById("syncQueueButton").addEventListener("click", function () {
      updateWithAction(function (state) {
        window.AICM_QUEUE.syncPending(state);
        window.AICM_EVENTS.add(state, "queue_synced", "Pending queue items marked as synced", "");
      }, "queue synced mock");
    });

    document.getElementById("failQueueButton").addEventListener("click", function () {
      updateWithAction(function (state) {
        window.AICM_QUEUE.failPending(state);
        window.AICM_EVENTS.add(state, "queue_failed", "Retryable queue failure simulated", "aiworker_unavailable");
      }, "queue failure simulated");
    });

    document.getElementById("retryQueueButton").addEventListener("click", function () {
      updateWithAction(function (state) {
        window.AICM_QUEUE.retryFailed(state);
        window.AICM_EVENTS.add(state, "queue_retry", "Failed queue items retried", "");
      }, "queue retry mock");
    });

    document.getElementById("conflictQueueButton").addEventListener("click", function () {
      updateWithAction(function (state) {
        window.AICM_QUEUE.createConflict(state);
        window.AICM_EVENTS.add(state, "conflict_detected", "Conflict simulated", "approval_after_revision");
      }, "conflict simulated");
    });

    document.getElementById("resolveConflictButton").addEventListener("click", function () {
      updateWithAction(function (state) {
        window.AICM_QUEUE.resolveConflict(state);
        window.AICM_EVENTS.add(state, "conflict_resolved", "Conflict resolved by human mock", "");
      }, "conflict resolved mock");
    });

    document.getElementById("approveReviewButton").addEventListener("click", function () {
      updateWithAction(window.AICM_REVIEW_DELIVERY_ACTIONS.approveFirstReview, "review approved mock");
    });

    document.getElementById("returnReviewButton").addEventListener("click", function () {
      updateWithAction(window.AICM_REVIEW_DELIVERY_ACTIONS.returnFirstReview, "review returned mock");
    });

    document.getElementById("approveDeliveryButton").addEventListener("click", function () {
      updateWithAction(window.AICM_REVIEW_DELIVERY_ACTIONS.approveDelivery, "human approval mock");
    });

    document.getElementById("requestRevisionButton").addEventListener("click", function () {
      updateWithAction(window.AICM_REVIEW_DELIVERY_ACTIONS.requestDeliveryRevision, "human revision request mock");
    });

    document.getElementById("acceptDeliveryButton").addEventListener("click", function () {
      updateWithAction(window.AICM_REVIEW_DELIVERY_ACTIONS.acceptDelivery, "delivery accepted mock");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    wireActions();
  });
})();
