import Foundation

enum CommonOSEntryRegistry {
    static func createDefault() -> CommonOSEntryDescriptor {
        CommonOSEntryDescriptor(
            appName: "PocketSecretary",
            commonComponentUsage: [
                "App Shell",
                "Card",
                "List",
                "Search Bar",
                "Filter Panel",
                "Status Chip",
                "Toast",
                "Offline Queue Status UI",
                "Sync Retry UI",
                "Conflict Review UI"
            ],
            variantUsage: [
                "panel.sync",
                "panel.conflict",
                "input.compact",
                "button.primary",
                "card.standard"
            ]
        )
    }
}
