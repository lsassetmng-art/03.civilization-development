import { readEnv } from "./aiod_env.js";
import {
  persistNotificationEventPsql,
  persistRuntimeAuditEventPsql
} from "./aiod_post_write_persistence_psql.js";

function mode() {
  return readEnv("AIOD_DATA_MODE", "mock");
}

export function shouldPersistPostWriteDb() {
  return mode() === "db_psql";
}

export async function persistPostWriteDbArtifacts(input = {}) {
  if (!shouldPersistPostWriteDb()) {
    return {
      db_post_write_mode: "skipped",
      notification_event: null,
      runtime_audit: null
    };
  }

  let notificationEvent = null;
  let runtimeAudit = null;

  if (input.notification_type && input.work_order_id) {
    try {
      notificationEvent = await persistNotificationEventPsql({
        work_order_id: input.work_order_id,
        notification_type: input.notification_type,
        destination_ref: input.destination_ref || "line_stub_default"
      });
    } catch (e) {
      notificationEvent = {
        persisted: false,
        error: e?.message || String(e)
      };
    }
  }

  if (input.work_order_id) {
    try {
      runtimeAudit = await persistRuntimeAuditEventPsql({
        work_order_id: input.work_order_id,
        event_type: input.event_type || "post_write_runtime_audit",
        event_summary: input.event_summary || "Post-write runtime audit persisted.",
        actor_type: input.actor_type || "user",
        actor_ref: input.actor_ref || "unknown_actor"
      });
    } catch (e) {
      runtimeAudit = {
        persisted: false,
        error: e?.message || String(e)
      };
    }
  }

  return {
    db_post_write_mode: "db_psql",
    notification_event: notificationEvent,
    runtime_audit: runtimeAudit
  };
}
