import Foundation

struct CommonOSBootstrapDescriptor {
    static let appNameHint = "PocketSecretary"

    let appName: String
    let launchMode: String
    let uiOwner: String
    let businessCanonOwner: String
    let runtimeRoute: String
    let entryRoute: String
    let contractRoute: String
}
