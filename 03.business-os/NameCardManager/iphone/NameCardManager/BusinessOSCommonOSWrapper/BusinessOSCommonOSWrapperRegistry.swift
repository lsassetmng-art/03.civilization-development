import Foundation

enum BusinessOSCommonOSWrapperRegistry {
    static func createDefault() -> BusinessOSCommonOSWrapperDescriptor {
        BusinessOSCommonOSWrapperDescriptor(
            appName: "NameCardManager",
            providerRoot: "~/03.civilization-development/12.common-os",
            consumerRoot: "~/03.civilization-development/03.business-os/_commonos",
            providerRole: "shared_provider",
            consumerRole: "os_side_consumer",
            adapterModule: "adapter",
            bridgeModule: "bridge",
            mapperModule: "mapper",
            presenterModule: "presenter",
            themeModule: "theme",
            syncModule: "sync",
            uiOwner: "CommonOS",
            businessOwner: "NameCardManager"
        )
    }
}
