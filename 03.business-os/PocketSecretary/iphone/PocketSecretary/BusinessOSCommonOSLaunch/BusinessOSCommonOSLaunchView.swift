import SwiftUI

struct BusinessOSCommonOSLaunchView: View {
    private let descriptor = BusinessOSCommonOSLaunchRegistry.createDefault()

    var body: some View {
        List {
            Section("Launch") {
                Text("launchMode: \(descriptor.launchMode)")
                Text("defaultTarget: \(descriptor.defaultTarget)")
                Text("consumerTarget: \(descriptor.consumerTarget)")
            }

            Section("Roles") {
                Text("providerRole: \(descriptor.providerRole)")
                Text("consumerRole: \(descriptor.consumerRole)")
            }

            Section("Ownership") {
                Text("uiOwner: \(descriptor.uiOwner)")
                Text("businessOwner: \(descriptor.businessOwner)")
            }
        }
        .navigationTitle("PocketSecretary")
    }
}
