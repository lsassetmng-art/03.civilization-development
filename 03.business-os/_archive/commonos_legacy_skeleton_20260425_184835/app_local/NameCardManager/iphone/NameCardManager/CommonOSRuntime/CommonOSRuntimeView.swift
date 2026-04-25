import SwiftUI

struct CommonOSRuntimeView: View {
    private let descriptor = CommonComponentUsage.createDefault()
    private let queue = QueuePresentationState(
        presentationOwner: "CommonOS",
        businessMeaningOwner: "NameCardManager",
        states: ["pending", "processing", "retry_wait", "sent", "failed", "cancelled", "conflict"]
    )

    var body: some View {
        List {
            Section("Common Component Usage") {
                ForEach(descriptor.commonComponentUsage, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Feature Variants") {
                ForEach(descriptor.featureVariants, id: \.self) { item in
                    Text(item)
                }
            }

            Section("Queue Presentation") {
                Text("presentation owner: \(queue.presentationOwner)")
                Text("business meaning owner: \(queue.businessMeaningOwner)")
                Text(queue.states.joined(separator: ", "))
            }
        }
        .navigationTitle("NameCardManager")
    }
}
