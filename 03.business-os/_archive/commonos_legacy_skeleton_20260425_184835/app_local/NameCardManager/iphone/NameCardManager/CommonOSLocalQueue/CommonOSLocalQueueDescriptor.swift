import Foundation

struct CommonOSLocalQueueDescriptor {
    static let appNameHint = "NameCardManager"

    let appName: String
    let syncMode: String
    let syncTriggers: [String]
    let retryStates: [String]
    let queueKinds: [String]
    let structuredStateStorage: String
    let localOutboxStorage: String
}
