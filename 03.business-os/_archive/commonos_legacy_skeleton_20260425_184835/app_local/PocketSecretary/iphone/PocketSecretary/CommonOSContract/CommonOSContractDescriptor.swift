import Foundation

struct CommonOSContractDescriptor {
    static let appNameHint = "PocketSecretary"

    let appName: String
    let syncMode: String
    let localQueueEnabled: Bool
    let onlineSyncEnabled: Bool
    let syncTriggers: [String]
    let retryStates: [String]
    let queuePresentationOwner: String
    let queueBusinessMeaningOwner: String
    let clientCapabilities: [String]
    let accessibilityPresets: [String]
}
