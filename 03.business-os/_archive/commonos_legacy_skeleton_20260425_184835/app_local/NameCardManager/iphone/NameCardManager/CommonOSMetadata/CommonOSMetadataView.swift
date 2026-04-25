import SwiftUI

struct CommonOSMetadataView: View {
    private let descriptor = CommonOSMetadataRegistry.createDefault()

    var body: some View {
        List {
            Section("Locale Keys") {
                ForEach(descriptor.localeKeys, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Screen Templates") {
                ForEach(descriptor.screenTemplates, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Help / Notification") {
                ForEach(descriptor.helpTemplates + descriptor.notificationTemplates, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Attachment / Export") {
                Text("temporaryHolding: \(descriptor.attachmentTemporaryHolding)")
                Text("previewShell: \(descriptor.attachmentPreviewShell)")
                Text(descriptor.attachmentAllowedKinds.joined(separator: ", "))
                Text(descriptor.exportTemplates.joined(separator: ", "))
            }
        }
        .navigationTitle("NameCardManager")
    }
}
