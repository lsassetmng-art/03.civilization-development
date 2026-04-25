import Foundation

enum BusinessOSCommonOSLaunchRegistry {
    static func createDefault() -> BusinessOSCommonOSLaunchDescriptor {
        BusinessOSCommonOSLaunchDescriptor(
            appName: "NameCardManager",
            launchMode: "launch_via_commonos_consumer",
            defaultTarget: "businessos-commonos-consumer",
            consumerTarget: "_commonos",
            providerRole: "shared_provider",
            consumerRole: "os_side_consumer",
            uiOwner: "CommonOS",
            businessOwner: "NameCardManager"
        )
    }
}
