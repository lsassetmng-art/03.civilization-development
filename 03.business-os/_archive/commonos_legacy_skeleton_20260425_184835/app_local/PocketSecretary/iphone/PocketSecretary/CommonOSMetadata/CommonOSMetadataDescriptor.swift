import Foundation

struct CommonOSMetadataDescriptor {
    static let appNameHint = "PocketSecretary"

    let appName: String
    let localeKeys: [String]
    let screenTemplates: [String]
    let helpTemplates: [String]
    let notificationTemplates: [String]
    let attachmentTemporaryHolding: String
    let attachmentPreviewShell: String
    let attachmentAllowedKinds: [String]
    let exportTemplates: [String]
}
