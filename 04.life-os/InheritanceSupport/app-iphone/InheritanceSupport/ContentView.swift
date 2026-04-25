import SwiftUI

struct ContentView: View {
    @StateObject private var store = InheritanceSupportStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var caseName: String = ""
    @State private var itemType: String = "Heir"
    @State private var ownerName: String = ""
    @State private var amount: String = ""
    @State private var dueDate: String = "2026-04-21"
    @State private var status: String = "Draft"
    @State private var sharing: String = "Private"
    @State private var priority: String = "High"
    @State private var memo: String = ""

    private let itemTypes = ["Heir", "Asset", "Debt", "Document", "Consultation", "Deadline"]
    private let statuses = ["Draft", "In Review", "Ready", "Done"]
    private let sharings = ["Private", "Family View", "Advisor View"]
    private let priorities = ["High", "Medium", "Low"]
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
            .navigationTitle("InheritanceSupport")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("InheritanceSupport")
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
            Text("Items: \(store.records.count)")
            Text("Heirs: \(store.heirCount)")
            Text("Assets: \(store.assetTotal) JPY")
            Text("Debts: \(store.debtTotal) JPY")
            Text("Deadlines: \(store.deadlineCount)")
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

            TextField("Case Name", text: $caseName)
                .textFieldStyle(.roundedBorder)

            Picker("Item Type", selection: $itemType) {
                ForEach(itemTypes, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)

            TextField("Owner or Person", text: $ownerName)
                .textFieldStyle(.roundedBorder)

            TextField("Amount JPY", text: $amount)
                .textFieldStyle(.roundedBorder)

            TextField("Due Date", text: $dueDate)
                .textFieldStyle(.roundedBorder)

            Picker("Status", selection: $status) {
                ForEach(statuses, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            Picker("Sharing", selection: $sharing) {
                ForEach(sharings, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)

            Picker("Priority", selection: $priority) {
                ForEach(priorities, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Item") {
                    store.add(
                        caseName: caseName,
                        itemType: itemType,
                        ownerName: ownerName,
                        amount: amount,
                        dueDate: dueDate,
                        status: status,
                        sharing: sharing,
                        priority: priority,
                        memo: memo
                    )
                    caseName = ""
                    ownerName = ""
                    amount = ""
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
                Text("No inheritance items yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(item.caseName)
                            .bold()
                        Text("\(item.itemType) / \(item.ownerName)")
                        Text("Amount: \(item.amount) JPY / Due: \(item.dueDate)")
                        Text("Status: \(item.status) / Sharing: \(item.sharing) / Priority: \(item.priority)")
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
