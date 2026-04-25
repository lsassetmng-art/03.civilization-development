window.AICM_REVIEW_DELIVERY_ACTIONS = {
  approveFirstReview: function (state) {
    var target = state.reviews.find(function (item) {
      return item.status === "pending" || item.status === "returned";
    }) || state.reviews[0];

    if (!target) {
      return state;
    }

    state.reviews = state.reviews.map(function (item) {
      if (item.id === target.id) {
        return Object.assign({}, item, {
          status: "approved",
          detail: "Leaderレビュー承認済み"
        });
      }
      return item;
    });

    window.AICM_QUEUE.add(state, "review_comment_submit", {
      review_id: target.id,
      decision: "approved"
    }, "レビュー承認をキューに追加");

    window.AICM_EVENTS.add(state, "review_approved", "レビュー承認モック完了", target.title);
    return state;
  },

  returnFirstReview: function (state) {
    var target = state.reviews.find(function (item) {
      return item.status === "pending" || item.status === "approved";
    }) || state.reviews[0];

    if (!target) {
      return state;
    }

    state.reviews = state.reviews.map(function (item) {
      if (item.id === target.id) {
        return Object.assign({}, item, {
          status: "returned",
          detail: "修正指示によりWorkerへ差し戻し"
        });
      }
      return item;
    });

    window.AICM_QUEUE.add(state, "return_request_submit", {
      review_id: target.id,
      deliverable_id: target.deliverable_id,
      from_role: "leader",
      to_role: "worker",
      reason: "品質基準未達",
      correction_target: target.title,
      correction_instruction: "構成と根拠を補強して再提出"
    }, "差し戻し指示をキューに追加");

    window.AICM_EVENTS.add(state, "review_returned", "レビュー差し戻しモック完了", target.title);
    return state;
  },

  approveDelivery: function (state) {
    var target = state.deliveries.find(function (item) {
      return item.approval_status === "waiting" || item.status === "human_approval_waiting";
    }) || state.deliveries[0];

    if (!target) {
      return state;
    }

    state.deliveries = state.deliveries.map(function (item) {
      if (item.id === target.id) {
        return Object.assign({}, item, {
          approval_status: "approved",
          status: "prepared",
          detail: "人間承認済み。納品準備完了"
        });
      }
      return item;
    });

    window.AICM_QUEUE.add(state, "human_approval_submit", {
      approval_id: target.approval_id,
      deliverable_id: target.deliverable_id,
      approval_status: "approved"
    }, "人間承認をキューに追加");

    window.AICM_EVENTS.add(state, "approval_approved", "人間承認モック完了", target.title);
    return state;
  },

  requestDeliveryRevision: function (state) {
    var target = state.deliveries[0];

    if (!target) {
      return state;
    }

    state.deliveries = state.deliveries.map(function (item) {
      if (item.id === target.id) {
        return Object.assign({}, item, {
          approval_status: "revision_requested",
          status: "revision_requested",
          detail: "人間から修正依頼済み"
        });
      }
      return item;
    });

    window.AICM_QUEUE.add(state, "human_revision_request_submit", {
      approval_id: target.approval_id,
      deliverable_id: target.deliverable_id,
      revision_reason: "納品前修正",
      revision_target: target.title,
      revision_instruction: "要約と実行手順を追加"
    }, "人間修正依頼をキューに追加");

    window.AICM_EVENTS.add(state, "approval_revision_requested", "人間修正依頼モック完了", target.title);
    return state;
  },

  acceptDelivery: function (state) {
    var target = state.deliveries.find(function (item) {
      return item.status === "prepared" || item.status === "delivered";
    }) || state.deliveries[0];

    if (!target) {
      return state;
    }

    state.deliveries = state.deliveries.map(function (item) {
      if (item.id === target.id) {
        return Object.assign({}, item, {
          status: "accepted",
          approval_status: item.approval_status || "approved",
          detail: "納品受領済み"
        });
      }
      return item;
    });

    window.AICM_QUEUE.add(state, "delivery_acceptance_submit", {
      delivery_id: target.delivery_id,
      accepted: true
    }, "納品受領をキューに追加");

    window.AICM_EVENTS.add(state, "delivery_accepted", "納品受領モック完了", target.title);
    return state;
  }
};
