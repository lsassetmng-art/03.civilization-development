export const APP_NAME = "AIOperationDesk";

export const LANE_TYPES = ["consult", "draft", "execution"];
export const REQUEST_CHANNELS = ["text", "voice"];
export const SOURCE_SURFACES = [
  "main_console",
  "erp_resident_surface",
  "builder_resident_surface",
  "app_help_surface",
  "pocketsecretary_exception"
];

export const RISK_CLASSES = ["low", "medium", "high", "privileged"];

export const WORK_ORDER_STATUSES = [
  "draft",
  "waiting_trigger",
  "preflight",
  "review_pending",
  "approval_pending",
  "ready",
  "running",
  "completed",
  "failed",
  "retry_waiting",
  "cancelled"
];

export const QUEUE_BUCKETS = [
  "waiting_trigger",
  "review_pending",
  "approval_pending",
  "ready",
  "running",
  "failed_retryable",
  "failed_manual_attention",
  "completed_recent",
  "summary_waiting"
];

export const SUPPORTED_RESIDENT_TARGETS = [
  "ERP",
  "CIVILIZATION_BUILDER",
  "PERSONA_BUILDER",
  "BUSINESS_BUILDER",
  "LIFE_BUILDER",
  "GAME_BUILDER",
  "STREAMING_BUILDER",
  "STATICART_BUILDER"
];

export const NOTIFICATION_TYPES = [
  "review_pending",
  "approval_pending",
  "confirmation_required",
  "execution_failed",
  "retry_scheduled",
  "completed_with_warning",
  "completed_summary_available"
];
