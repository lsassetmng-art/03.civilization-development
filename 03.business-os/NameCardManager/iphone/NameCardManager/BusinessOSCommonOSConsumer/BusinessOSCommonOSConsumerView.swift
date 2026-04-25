import SwiftUI

struct BusinessOSCommonOSConsumerView: View {
    private let descriptor = BusinessOSCommonOSConsumerRegistry.createDefault()

    var body: some View {
        List {
            Section("Provider / Consumer") {
                Text("providerRole: \(descriptor.providerRole)")
                Text("consumerRole: \(descriptor.consumerRole)")
                Text("consumerRoot: \(descriptor.consumerRoot)")
            }

            Section("Ownership") {
                Text("uiOwner: \(descriptor.uiOwner)")
                Text("businessOwner: \(descriptor.businessOwner)")
            }

            Section("Sync") {
                Text("syncMode: \(descriptor.syncMode)")
            }
        }
        .navigationTitle("NameCardManager")
    }
}
