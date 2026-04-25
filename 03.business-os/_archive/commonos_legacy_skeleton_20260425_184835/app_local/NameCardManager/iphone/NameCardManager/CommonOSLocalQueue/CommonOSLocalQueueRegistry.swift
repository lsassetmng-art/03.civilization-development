import Foundation

enum CommonOSLocalQueueRegistry {
    static func createDefault() -> CommonOSLocalQueueDescriptor {
        CommonOSLocalQueueDescriptor(
            appName: "NameCardManager",
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
                "capture_image_intake",
                "ocr_review",
                "relationship_merge_review"
            ],
            structuredStateStorage: "indexeddb_equivalent",
            localOutboxStorage: "local_outbox_queue"
        )
    }
}
