import SwiftUI

struct ContentView: View {
    @StateObject private var store = MoneyPlannerStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var date: String = "2026-04-21"
    @State private var type: String = "Expense"
    @State private var category: String = ""
    @State private var amount: String = ""
    @State private var memo: String = ""

    private let types = ["Income", "Expense"]
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
            .navigationTitle("MoneyPlanner")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("MoneyPlanner")
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
            Text("Entries: \(store.records.count)")
            Text("Income: \(store.incomeTotal) JPY")
            Text("Expense: \(store.expenseTotal) JPY")
            Text("Balance: \(store.balance) JPY")
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

            TextField("Date", text: $date)
                .textFieldStyle(.roundedBorder)

            Picker("Type", selection: $type) {
                ForEach(types, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Category", text: $category)
                .textFieldStyle(.roundedBorder)
            TextField("Amount JPY", text: $amount)
                .textFieldStyle(.roundedBorder)
            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Entry") {
                    store.add(
                        date: date,
                        type: type,
                        category: category,
                        amount: amount,
                        memo: memo
                    )
                    category = ""
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
                Text("No entries yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text("\(item.date) / \(item.type)")
                            .bold()
                        Text("\(item.category) / \(item.amount) JPY")
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
