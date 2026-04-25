import Foundation

enum BusinessOSCommonOSConsumerRegistry {
    static func createDefault() -> BusinessOSCommonOSConsumerDescriptor {
        BusinessOSCommonOSConsumerDescriptor(
            appName: "PocketSecretary",
            providerRole: "shared_provider",
            consumerRole: "os_side_consumer",
            consumerRoot: "~/03.civilization-development/03.business-os/_commonos",
            uiOwner: "CommonOS",
            businessOwner: "PocketSecretary",
            syncMode: "offline-first"
        )
    }
}
