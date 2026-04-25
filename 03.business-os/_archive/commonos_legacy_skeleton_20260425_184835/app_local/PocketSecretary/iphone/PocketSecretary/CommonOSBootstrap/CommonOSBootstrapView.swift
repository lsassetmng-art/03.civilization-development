import SwiftUI

struct CommonOSBootstrapView: View {
    private let descriptor = CommonOSBootstrapRegistry.createDefault()

    var body: some View {
        List {
            Section("Launch Profile") {
                Text("launch mode: \(descriptor.launchMode)")
                Text("ui owner: \(descriptor.uiOwner)")
                Text("business canon owner: \(descriptor.businessCanonOwner)")
            }

            Section("Connected Routes") {
                Text("runtime: \(descriptor.runtimeRoute)")
                Text("entry: \(descriptor.entryRoute)")
                Text("contract: \(descriptor.contractRoute)")
            }
        }
        .navigationTitle("PocketSecretary")
    }
}
