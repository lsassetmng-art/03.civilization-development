export const SQL = {
  supportedApps: `
    select
      app_code,
      app_name,
      resident_surface_supported,
      help_mode_supported,
      operation_qa_supported,
      execution_supported
    from business.aiod_supported_app_registry
    where support_status = 'supported'
    order by app_code
  `,
  queue: `
    select
      work_order_id,
      supported_app_id,
      lane_type,
      work_type_code,
      risk_class,
      work_order_status,
      scheduled_at,
      created_at
    from business.aiod_work_order
    order by created_at desc
    limit 100
  `,
  reviewInbox: `
    select
      review_request_id,
      work_order_id,
      review_reason_code,
      review_status,
      requested_at
    from business.aiod_review_request
    where review_status = 'pending'
    order by requested_at asc
    limit 100
  `,
  approvalInbox: `
    select
      approval_request_id,
      work_order_id,
      approval_reason_code,
      approval_status,
      requested_at
    from business.aiod_approval_request
    where approval_status = 'pending'
    order by requested_at asc
    limit 100
  `,
  failures: `
    select
      failure_record_id,
      execution_job_id,
      failure_code,
      failure_summary,
      retryable_flag,
      created_at
    from business.aiod_failure_record
    order by created_at desc
    limit 100
  `,
  summaryBatches: `
    select
      summary_batch_id,
      batch_type,
      batch_window_end_at,
      batch_status,
      created_at
    from business.aiod_summary_batch
    order by created_at desc
    limit 50
  `
};
