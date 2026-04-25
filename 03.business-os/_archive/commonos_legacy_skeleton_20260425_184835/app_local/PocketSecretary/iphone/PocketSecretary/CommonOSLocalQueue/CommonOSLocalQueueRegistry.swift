import Foundation

enum CommonOSLocalQueueRegistry {
    static func createDefault() -> CommonOSLocalQueueDescriptor {
        CommonOSLocalQueueDescriptor(
            appName: "PocketSecretary",
            syncMode: "offline-first",
            syncTriggers: [
                "app_launch",
                "foreground_resume",
                "online_recovery",
                "manual_sync",
                "send_possible"
            ],
            retryStates: [
                "retry_wait",
                "failed",
                "processing"
            ],
            queueKinds: [
                "briefing_refresh",
                "follow_through_update",
                "conversation_action_write"
            ],
            structuredStateStorage: "indexeddb_equivalent",
            localOutboxStorage: "local_outbox_queue"
        )
    }
}
