import Foundation

enum CommonOSBootstrapRegistry {
    static func createDefault() -> CommonOSBootstrapDescriptor {
        CommonOSBootstrapDescriptor(
            appName: "PocketSecretary",
            launchMode: "commonos_bootstrap",
            uiOwner: "CommonOS",
            businessCanonOwner: "PocketSecretary",
            runtimeRoute: "runtime/commonos",
            entryRoute: "runtime/commonos/entry",
            contractRoute: "runtime/commonos/contract"
        )
    }
}
