import Foundation

enum CommonComponentUsage {
    static func createDefault() -> CommonOSRuntimeDescriptor {
        CommonOSRuntimeDescriptor(
            appName: "PocketSecretary",
            commonComponentUsage: [
                "Card",
                "List",
                "Search Bar",
                "Filter Panel",
                "Status Chip",
                "Toast",
                "Offline Queue Status UI",
                "Sync Retry UI",
                "Conflict Review UI",
                "App Shell"
            ],
            featureVariants: [
                "panel.sync",
                "panel.conflict",
                "input.compact",
                "button.primary",
                "card.standard"
            ]
        )
    }
}
