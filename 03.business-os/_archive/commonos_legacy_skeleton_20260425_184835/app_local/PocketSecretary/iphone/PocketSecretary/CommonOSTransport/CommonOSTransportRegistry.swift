import Foundation

enum CommonOSTransportRegistry {
    static func createDefault() -> CommonOSTransportDescriptor {
        CommonOSTransportDescriptor(
            appName: "PocketSecretary",
            requestIdField: "requestId",
            traceIdField: "traceId",
            syncStatusField: "syncStatus",
            clientTimestampField: "clientTimestamp",
            serverTimestampField: "serverTimestamp",
            itemsField: "items",
            nextPageTokenField: "nextPageToken",
            totalCountField: "totalCount",
            errorCodeField: "errorCode",
            errorMessageField: "errorMessage",
            errorDetailsField: "errorDetails"
        )
    }
}
