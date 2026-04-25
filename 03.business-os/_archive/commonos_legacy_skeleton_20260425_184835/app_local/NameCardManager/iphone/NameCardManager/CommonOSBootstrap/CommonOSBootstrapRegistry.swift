import Foundation

enum CommonOSBootstrapRegistry {
    static func createDefault() -> CommonOSBootstrapDescriptor {
        CommonOSBootstrapDescriptor(
            appName: "NameCardManager",
            launchMode: "commonos_bootstrap",
            uiOwner: "CommonOS",
            businessCanonOwner: "NameCardManager",
            runtimeRoute: "runtime/commonos",
            entryRoute: "runtime/commonos/entry",
            contractRoute: "runtime/commonos/contract"
        )
    }
}
