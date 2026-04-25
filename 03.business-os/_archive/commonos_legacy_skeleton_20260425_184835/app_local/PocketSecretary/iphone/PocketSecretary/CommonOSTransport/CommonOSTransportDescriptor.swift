import Foundation

struct CommonOSTransportDescriptor {
    static let appNameHint = "PocketSecretary"

    let appName: String
    let requestIdField: String
    let traceIdField: String
    let syncStatusField: String
    let clientTimestampField: String
    let serverTimestampField: String
    let itemsField: String
    let nextPageTokenField: String
    let totalCountField: String
    let errorCodeField: String
    let errorMessageField: String
    let errorDetailsField: String
}
