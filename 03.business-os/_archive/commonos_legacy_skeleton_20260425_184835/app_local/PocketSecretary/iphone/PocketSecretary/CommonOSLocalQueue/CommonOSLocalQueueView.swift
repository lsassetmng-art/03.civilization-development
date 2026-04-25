import SwiftUI

struct CommonOSLocalQueueView: View {
    private let descriptor = CommonOSLocalQueueRegistry.createDefault()

    var body: some View {
        List {
            Section("Sync Triggers") {
                ForEach(descriptor.syncTriggers, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Retry States") {
                ForEach(descriptor.retryStates, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Queue Kinds") {
                ForEach(descriptor.queueKinds, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Storage") {
                Text("structuredState: \(descriptor.structuredStateStorage)")
                Text("localOutbox: \(descriptor.localOutboxStorage)")
            }
        }
        .navigationTitle("PocketSecretary")
    }
}
