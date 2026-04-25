import SwiftUI

struct ContentView: View {
    @StateObject private var store = CareerLaunchStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var company: String = ""
    @State private var position: String = ""
    @State private var stage: String = "Draft"
    @State private var dueDate: String = "2026-04-21"
    @State private var note: String = ""

    private let stages = ["Draft", "Applied", "Interview", "Offer", "Closed"]
    private let backgrounds = ["Sunrise", "Forest", "Night", "Ocean"]

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    heroCard
                    personaCard
                    summaryCard
                    formCard
                    recordsCard
                }
                .padding()
            }
            .navigationTitle("CareerLaunch")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("CareerLaunch")
                .font(.largeTitle)
                .bold()
            Text("iPhone runnable implementation")
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(backgroundColor)
        .foregroundColor(.white)
        .cornerRadius(20)
    }

    private var personaCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Persona / Background")
                .font(.headline)
            TextField("Persona name", text: $personaName)
                .textFieldStyle(.roundedBorder)
            Picker("Background", selection: $selectedBackground) {
                ForEach(backgrounds, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(20)
    }

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Summary")
                .font(.headline)
            Text("Applications: \(store.records.count)")
            Text("Applied: \(store.count(stage: "Applied"))")
            Text("Interview: \(store.count(stage: "Interview"))")
            Text("Offer: \(store.count(stage: "Offer"))")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(20)
    }

    private var formCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Register")
                .font(.headline)

            TextField("Company", text: $company)
                .textFieldStyle(.roundedBorder)
            TextField("Position", text: $position)
                .textFieldStyle(.roundedBorder)

            Picker("Stage", selection: $stage) {
                ForEach(stages, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Due Date", text: $dueDate)
                .textFieldStyle(.roundedBorder)
            TextField("Note", text: $note, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Application") {
                    store.add(
                        company: company,
                        position: position,
                        stage: stage,
                        dueDate: dueDate,
                        note: note
                    )
                    company = ""
                    position = ""
                    note = ""
                }
                .buttonStyle(.borderedProminent)

                Button("Clear Data") {
                    store.clear()
                }
                .buttonStyle(.bordered)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(20)
    }

    private var recordsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Records")
                .font(.headline)

            if store.records.isEmpty {
                Text("No applications yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text("\(item.company) / \(item.position)")
                            .bold()
                        Text("\(item.stage) / due \(item.dueDate)")
                        if !item.note.isEmpty {
                            Text(item.note)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(16)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(20)
    }

    private var backgroundColor: Color {
        switch selectedBackground {
        case "Forest": return .green
        case "Night": return .indigo
        case "Ocean": return .blue
        default: return .orange
        }
    }
}
