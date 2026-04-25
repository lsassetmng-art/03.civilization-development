import SwiftUI

struct CommonOSTransportView: View {
    private let descriptor = CommonOSTransportRegistry.createDefault()

    var body: some View {
        List {
            Section("Request / Trace") {
                Text("requestId: \(descriptor.requestIdField)")
                Text("traceId: \(descriptor.traceIdField)")
            }

            Section("Pagination Envelope") {
                Text("items: \(descriptor.itemsField)")
                Text("nextPageToken: \(descriptor.nextPageTokenField)")
                Text("totalCount: \(descriptor.totalCountField)")
            }

            Section("Error Envelope") {
                Text("errorCode: \(descriptor.errorCodeField)")
                Text("errorMessage: \(descriptor.errorMessageField)")
                Text("errorDetails: \(descriptor.errorDetailsField)")
            }

            Section("Sync Naming") {
                Text("syncStatus: \(descriptor.syncStatusField)")
                Text("clientTimestamp: \(descriptor.clientTimestampField)")
                Text("serverTimestamp: \(descriptor.serverTimestampField)")
            }
        }
        .navigationTitle("PocketSecretary")
    }
}
