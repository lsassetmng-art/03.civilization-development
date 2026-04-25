import {
  LANE_TYPES,
  REQUEST_CHANNELS,
  SOURCE_SURFACES,
  RISK_CLASSES,
  WORK_ORDER_STATUSES,
  QUEUE_BUCKETS,
  NOTIFICATION_TYPES
} from "../lib/aiod_constants.js";
import { ok, ng, requireFields } from "../lib/aiod_response.js";

function nowIso() {
  return new Date().toISOString();
}

function fakeId(prefix) {
  return `${prefix}_${Date.now()}`;
}

function resolveLane(payload) {
  if (LANE_TYPES.includes(payload.lane_type)) {
    return payload.lane_type;
  }
  return "consult";
}

function resolveRisk(payload) {
  if (payload.lane_type === "execution") {
    return "medium";
  }
  if (payload.lane_type === "draft") {
    return "medium";
  }
  return "low";
}

export function handleRequestIntake(payload) {
  const validation = requireFields(payload, ["request_text", "request_channel", "source_surface_type"]);
  if (validation) {
    return validation;
  }

  if (!REQUEST_CHANNELS.includes(payload.request_channel)) {
    return ng("INVALID_REQUEST_CHANNEL", "Unsupported request_channel.", {
      request_channel: payload.request_channel
    });
  }

  if (!SOURCE_SURFACES.includes(payload.source_surface_type)) {
    return ng("INVALID_SOURCE_SURFACE", "Unsupported source_surface_type.", {
      source_surface_type: payload.source_surface_type
    });
  }

  const laneType = resolveLane(payload);
  const riskClass = resolveRisk({ lane_type: laneType });

  return ok({
    operation_request_id: fakeId("operation_request"),
    request_status: "compiled",
    compiled_work_order_id: fakeId("work_order"),
    supported_app_resolved: !!payload.supported_app_code,
    lane_type_resolved: laneType,
    risk_class: riskClass,
    review_required: laneType !== "consult",
    approval_required: laneType === "execution",
    created_at: nowIso()
  });
}

export function handleSupportedAppExplain(payload) {
  const validation = requireFields(payload, ["supported_app_code", "question_type", "question_text"]);
  if (validation) {
    return validation;
  }

  return ok({
    supported: true,
    answer_type: payload.question_type,
    answer_text: `Stub answer for ${payload.supported_app_code} / ${payload.question_type}.`,
    related_task_types: ["SCREEN_EXPLANATION", "FIELD_EXPLANATION", "OPERATION_QA"],
    resident_followup_actions: [
      "create_draft_request",
      "open_execution_request",
      "show_common_errors"
    ]
  });
}

export function handleErpProvisionalVoucher(payload) {
  const validation = requireFields(payload, ["company_ref", "voucher_type_code", "currency_code"]);
  if (validation) {
    return validation;
  }

  return ok({
    operation_request_id: fakeId("operation_request"),
    work_order_id: fakeId("work_order"),
    lane_type: "draft",
    draft_status: "prepared",
    review_required: true,
    approval_required: false,
    created_at: nowIso()
  });
}

export function handleExecutionRequest(payload) {
  const validation = requireFields(payload, ["supported_app_code", "work_type_code", "trigger_mode"]);
  if (validation) {
    return validation;
  }

  const riskClass = payload.risk_class && RISK_CLASSES.includes(payload.risk_class)
    ? payload.risk_class
    : "medium";

  let workOrderStatus = "ready";
  if (riskClass === "medium") {
    workOrderStatus = "review_pending";
  }
  if (riskClass === "high" || riskClass === "privileged") {
    workOrderStatus = "approval_pending";
  }

  if (!WORK_ORDER_STATUSES.includes(workOrderStatus)) {
    return ng("INVALID_WORK_ORDER_STATUS", "Resolved status is invalid.", { workOrderStatus });
  }

  return ok({
    work_order_id: fakeId("work_order"),
    work_order_status: workOrderStatus,
    risk_class: riskClass,
    review_required: riskClass !== "low",
    approval_required: riskClass === "high" || riskClass === "privileged",
    created_at: nowIso()
  });
}

export function handleReviewDecide(payload) {
  const validation = requireFields(payload, ["decision"]);
  if (validation) {
    return validation;
  }

  return ok({
    decision_status: payload.decision,
    affected_work_order_status: payload.decision === "approved" ? "ready" : "draft",
    decided_at: nowIso()
  });
}

export function handleApprovalDecide(payload) {
  const validation = requireFields(payload, ["decision"]);
  if (validation) {
    return validation;
  }

  return ok({
    decision_status: payload.decision,
    affected_work_order_status: payload.decision === "approved" ? "ready" : "draft",
    decided_at: nowIso()
  });
}

export function handleQueue() {
  return ok({
    queue_buckets: QUEUE_BUCKETS,
    items: [
      {
        work_order_id: fakeId("work_order"),
        supported_app_code: "ERP",
        lane_type: "draft",
        work_order_status: "review_pending",
        risk_class: "medium",
        scheduled_at: null
      }
    ]
  });
}

export function handleRetrySchedule(payload) {
  const validation = requireFields(payload, ["next_retry_at"]);
  if (validation) {
    return validation;
  }

  return ok({
    retry_plan_id: fakeId("retry_plan"),
    retry_status: "scheduled",
    next_retry_at: payload.next_retry_at
  });
}

export function handleNotificationRuleSave(payload) {
  const hasInvalidType = Object.keys(payload).some((key) => {
    if (!key.startsWith("notify_") && key !== "line_destination_ref") {
      return false;
    }
    return false;
  });

  if (hasInvalidType) {
    return ng("INVALID_NOTIFICATION_RULE", "Unexpected notification rule field.");
  }

  return ok({
    saved: true,
    notification_rule_id: fakeId("notification_rule"),
    supported_notification_types: NOTIFICATION_TYPES
  });
}
