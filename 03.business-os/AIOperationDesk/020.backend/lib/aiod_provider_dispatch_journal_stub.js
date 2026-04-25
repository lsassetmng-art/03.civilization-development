export function createProviderDispatchJournalStub(input = {}) {
  return {
    journal_mode: "runtime_stub",
    notification_event_id: input.notification_event_id || null,
    provider_mode: input.provider_mode || "unknown",
    delivery_status: input.delivery_status || "failed",
    provider_message_ref: input.provider_message_ref || null,
    provider_error_code: input.provider_error_code || null,
    provider_error_summary: input.provider_error_summary || null,
    created_at: new Date().toISOString()
  };
}
