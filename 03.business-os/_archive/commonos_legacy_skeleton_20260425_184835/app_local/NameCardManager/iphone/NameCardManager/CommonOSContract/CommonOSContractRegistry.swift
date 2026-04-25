import Foundation

enum CommonOSContractRegistry {
    static func createDefault() -> CommonOSContractDescriptor {
        CommonOSContractDescriptor(
            appName: "NameCardManager",
            syncMode: "offline-first",
            localQueueEnabled: true,
            onlineSyncEnabled: true,
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
            queuePresentationOwner: "CommonOS",
            queueBusinessMeaningOwner: "NameCardManager",
            clientCapabilities: [
                "camera",
                "file_picker",
                "offline_storage",
                "share_sheet"
            ],
            accessibilityPresets: [
                "large_touch_target",
                "screen_reader_label_rule",
                "contrast_safe_default"
            ]
        )
    }
}
