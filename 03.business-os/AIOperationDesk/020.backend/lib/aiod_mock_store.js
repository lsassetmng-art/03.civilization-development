export const mockStore = {
  supportedApps: [
    {
      app_code: "ERP",
      app_name: "ERP",
      resident_surface_supported: true,
      execution_supported: true
    },
    {
      app_code: "BUSINESS_BUILDER",
      app_name: "BusinessOS Builder",
      resident_surface_supported: true,
      execution_supported: true
    }
  ],
  queue: [
    {
      work_order_id: "wo_stub_001",
      supported_app_code: "ERP",
      lane_type: "draft",
      work_order_status: "review_pending",
      risk_class: "medium",
      review_required: true,
      approval_required: false
    },
    {
      work_order_id: "wo_stub_002",
      supported_app_code: "BUSINESS_BUILDER",
      lane_type: "execution",
      work_order_status: "approval_pending",
      risk_class: "high",
      review_required: true,
      approval_required: true
    },
    {
      work_order_id: "wo_stub_003",
      supported_app_code: "ERP",
      lane_type: "consult",
      work_order_status: "ready",
      risk_class: "low",
      review_required: false,
      approval_required: false
    }
  ],
  failures: [
    {
      failure_record_id: "fail_stub_001",
      work_order_id: "wo_stub_010",
      supported_app_code: "ERP",
      failure_code: "ERP_REQUIRED_FIELD_MISSING",
      failure_summary: "Required field is missing.",
      retryable_flag: true
    }
  ],
  reviewInbox: [
    {
      review_request_id: "review_stub_001",
      work_order_id: "wo_stub_001",
      supported_app_code: "ERP",
      review_reason_code: "RR008_PROVISIONAL_VOUCHER_CHECK"
    }
  ],
  approvalInbox: [
    {
      approval_request_id: "approval_stub_001",
      work_order_id: "wo_stub_002",
      supported_app_code: "BUSINESS_BUILDER",
      approval_reason_code: "AR006_IRREVERSIBLE_PRODUCTION_SCOPE"
    }
  ],
  summaryBatches: [
    {
      summary_batch_id: "summary_stub_001",
      batch_type: "execution_summary",
      batch_window_end_at: "2026-04-21T12:00:00+09:00"
    }
  ]
};

export function listSupportedApps() {
  return mockStore.supportedApps;
}

export function listQueue() {
  return mockStore.queue;
}

export function listFailures() {
  return mockStore.failures;
}

export function listReviewInbox() {
  return mockStore.reviewInbox;
}

export function listApprovalInbox() {
  return mockStore.approvalInbox;
}

export function listSummaryBatches() {
  return mockStore.summaryBatches;
}
