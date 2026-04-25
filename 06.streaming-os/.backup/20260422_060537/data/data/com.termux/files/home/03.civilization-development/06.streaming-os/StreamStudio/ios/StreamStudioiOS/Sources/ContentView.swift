import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                Text("screen.title")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("screen.subtitle")
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                Button("persona.button") {
                }
                .buttonStyle(.borderedProminent)

                Button("background.button") {
                }
                .buttonStyle(.bordered)

                Button("primary.button") {
                }
                .buttonStyle(.borderedProminent)
            }
            .padding(24)
            .navigationTitle(Text("nav.title"))
        }
    }
}

#Preview {
    ContentView()
}
