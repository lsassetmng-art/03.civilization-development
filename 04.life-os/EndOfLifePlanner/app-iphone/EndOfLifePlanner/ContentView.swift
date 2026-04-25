import SwiftUI

struct ContentView: View {
    @StateObject private var store = EndOfLifePlannerStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var entryType: String = "Medical Preference"
    @State private var title: String = ""
    @State private var status: String = "Draft"
    @State private var visibility: String = "Private"
    @State private var targetPerson: String = ""
    @State private var reviewDate: String = "2026-04-21"
    @State private var contactOrLocation: String = ""
    @State private var importance: String = "High"
    @State private var memo: String = ""

    private let entryTypes = ["Medical Preference", "Care Preference", "Funeral Preference", "Digital Asset", "Contact", "Document"]
    private let statuses = ["Draft", "Ready", "Shared"]
    private let visibilities = ["Private", "Family View", "Advisor View"]
    private let importances = ["High", "Medium", "Low"]
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
            .navigationTitle("EndOfLifePlanner")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("EndOfLifePlanner")
                .font(.largeTitle)
                .bold()
            Text("iPhone runnable implementation with CommonOS consumer contract")
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
            Text("Entries: \(store.records.count)")
            Text("Ready: \(store.readyCount)")
            Text("Shared: \(store.sharedCount)")
            Text("Documents: \(store.documentCount)")
            Text("Contacts: \(store.contactCount)")
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

            Picker("Entry Type", selection: $entryType) {
                ForEach(entryTypes, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)

            TextField("Title", text: $title)
                .textFieldStyle(.roundedBorder)

            Picker("Status", selection: $status) {
                ForEach(statuses, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            Picker("Visibility", selection: $visibility) {
                ForEach(visibilities, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)

            TextField("Target Person", text: $targetPerson)
                .textFieldStyle(.roundedBorder)

            TextField("Review Date", text: $reviewDate)
                .textFieldStyle(.roundedBorder)

            TextField("Contact or Location", text: $contactOrLocation)
                .textFieldStyle(.roundedBorder)

            Picker("Importance", selection: $importance) {
                ForEach(importances, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Entry") {
                    store.add(
                        entryType: entryType,
                        title: title,
                        status: status,
                        visibility: visibility,
                        targetPerson: targetPerson,
                        reviewDate: reviewDate,
                        contactOrLocation: contactOrLocation,
                        importance: importance,
                        memo: memo
                    )
                    title = ""
                    targetPerson = ""
                    contactOrLocation = ""
                    memo = ""
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
                Text("No end-of-life entries yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(item.title)
                            .bold()
                        Text("\(item.entryType) / \(item.status) / \(item.visibility)")
                        Text("Target: \(item.targetPerson) / Review: \(item.reviewDate)")
                        Text("Contact or Location: \(item.contactOrLocation) / Importance: \(item.importance)")
                        if !item.memo.isEmpty {
                            Text(item.memo)
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
