export function createRuntimeAuditStub(input = {}) {
  return {
    audit_mode: "runtime_stub",
    event_type: input.event_type || "unknown_write_event",
    actor_id: input.actor_id || "unknown_actor",
    path: input.path || null,
    method: input.method || null,
    work_order_id: input.work_order_id || null,
    notification_type: input.notification_type || null,
    created_at: new Date().toISOString()
  };
}
