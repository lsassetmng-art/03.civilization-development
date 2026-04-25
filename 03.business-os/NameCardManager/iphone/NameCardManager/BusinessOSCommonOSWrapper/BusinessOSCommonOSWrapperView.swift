import SwiftUI

struct BusinessOSCommonOSWrapperView: View {
    private let descriptor = BusinessOSCommonOSWrapperRegistry.createDefault()

    var body: some View {
        List {
            Section("Provider / Consumer") {
                Text("providerRoot: \(descriptor.providerRoot)")
                Text("consumerRoot: \(descriptor.consumerRoot)")
                Text("providerRole: \(descriptor.providerRole)")
                Text("consumerRole: \(descriptor.consumerRole)")
            }

            Section("Modules") {
                Text(descriptor.adapterModule)
                Text(descriptor.bridgeModule)
                Text(descriptor.mapperModule)
                Text(descriptor.presenterModule)
                Text(descriptor.themeModule)
                Text(descriptor.syncModule)
            }

            Section("Ownership") {
                Text("uiOwner: \(descriptor.uiOwner)")
                Text("businessOwner: \(descriptor.businessOwner)")
            }
        }
        .navigationTitle("NameCardManager")
    }
}
