import SwiftUI

struct CommonOSEntryView: View {
    private let descriptor = CommonOSEntryRegistry.createDefault()

    var body: some View {
        List {
            Section("Common Component Usage") {
                ForEach(descriptor.commonComponentUsage, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Variant Usage") {
                ForEach(descriptor.variantUsage, id: \.self) { item in
                    Text(item)
                }
            }
        }
        .navigationTitle("NameCardManager")
    }
}
