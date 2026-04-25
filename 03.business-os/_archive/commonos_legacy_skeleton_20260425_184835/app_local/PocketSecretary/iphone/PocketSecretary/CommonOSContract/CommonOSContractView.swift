import SwiftUI

struct CommonOSContractView: View {
    private let descriptor = CommonOSContractRegistry.createDefault()

    var body: some View {
        List {
            Section("Sync / Retry") {
                Text("sync mode: \(descriptor.syncMode)")
                Text("localQueueEnabled: \(descriptor.localQueueEnabled.description)")
                Text("onlineSyncEnabled: \(descriptor.onlineSyncEnabled.description)")
                Text(descriptor.syncTriggers.joined(separator: ", "))
                Text(descriptor.retryStates.joined(separator: ", "))
            }

            Section("Queue Boundary") {
                Text("presentation owner: \(descriptor.queuePresentationOwner)")
                Text("business meaning owner: \(descriptor.queueBusinessMeaningOwner)")
            }

            Section("Client Capabilities") {
                ForEach(descriptor.clientCapabilities, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Accessibility") {
                ForEach(descriptor.accessibilityPresets, id: \.self) { item in
                    Text(item)
                }
            }
        }
        .navigationTitle("PocketSecretary")
    }
}
