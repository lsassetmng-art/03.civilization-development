import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("screen.title")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("screen.subtitle")
                            .foregroundColor(.secondary)
                    }

                    TextField("search.hint", text: .constant(""))
                        .textFieldStyle(.roundedBorder)

                    HStack(spacing: 12) {
                        Button("resume.button") {
                        }
                        .buttonStyle(.borderedProminent)

                        Button("library.button") {
                        }
                        .buttonStyle(.bordered)

                        Button("tv.handoff.button") {
                        }
                        .buttonStyle(.bordered)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("common.surface.label")
                            .font(.headline)
                        Text(CommonRuntimePolicy.commonPreferredSurfaces.joined(separator: ", "))
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("local.surface.label")
                            .font(.headline)
                        Text(CommonRuntimePolicy.streamingLocalSurfaces.joined(separator: ", "))
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("consumer.root.label")
                            .font(.headline)
                        Text(OsCommonConsumerRef.consumerRoot)
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("consumer.files.label")
                            .font(.headline)
                        Text(OsCommonConsumerRef.adapterFile)
                            .foregroundColor(.secondary)
                        Text(OsCommonConsumerRef.bridgeFile)
                            .foregroundColor(.secondary)
                        Text(OsCommonConsumerRef.mapperFile)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(20)
            }
            .navigationTitle(Text("nav.title"))
        }
    }
}

#Preview {
    ContentView()
}
