import Foundation

struct CommonOSLocalQueueDescriptor {
    static let appNameHint = "PocketSecretary"

    let appName: String
    let syncMode: String
    let syncTriggers: [String]
    let retryStates: [String]
    let queueKinds: [String]
    let structuredStateStorage: String
    let localOutboxStorage: String
}
