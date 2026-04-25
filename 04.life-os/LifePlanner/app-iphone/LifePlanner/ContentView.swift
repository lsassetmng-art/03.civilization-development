import SwiftUI

struct ContentView: View {
    @StateObject private var store = LifePlannerStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var planTitle: String = ""
    @State private var category: String = "Family"
    @State private var horizon: String = "5Y"
    @State private var targetYear: String = ""
    @State private var estimatedCost: String = ""
    @State private var priority: String = "High"
    @State private var planStatus: String = "Draft"
    @State private var reviewMonth: String = "2026-12"
    @State private var memo: String = ""

    private let categories = ["Family", "Housing", "Work", "Learning", "Health", "Retirement", "Legal"]
    private let horizons = ["5Y", "10Y", "20Y"]
    private let priorities = ["High", "Medium", "Low"]
    private let statuses = ["Draft", "Active", "Review", "Done"]
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
            .navigationTitle("LifePlanner")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("LifePlanner")
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
            Text("Plans: \(store.records.count)")
            Text("Active: \(store.activeCount)")
            Text("Family Category: \(store.familyCount)")
            Text("Estimated Total: \(store.estimatedTotal) JPY")
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

            TextField("Plan Title", text: $planTitle)
                .textFieldStyle(.roundedBorder)

            Picker("Category", selection: $category) {
                ForEach(categories, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)

            Picker("Horizon", selection: $horizon) {
                ForEach(horizons, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Target Year", text: $targetYear)
                .textFieldStyle(.roundedBorder)

            TextField("Estimated Cost JPY", text: $estimatedCost)
                .textFieldStyle(.roundedBorder)

            Picker("Priority", selection: $priority) {
                ForEach(priorities, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            Picker("Status", selection: $planStatus) {
                ForEach(statuses, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Review Month", text: $reviewMonth)
                .textFieldStyle(.roundedBorder)

            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Plan") {
                    store.add(
                        planTitle: planTitle,
                        category: category,
                        horizon: horizon,
                        targetYear: targetYear,
                        estimatedCost: estimatedCost,
                        priority: priority,
                        planStatus: planStatus,
                        reviewMonth: reviewMonth,
                        memo: memo
                    )
                    planTitle = ""
                    targetYear = ""
                    estimatedCost = ""
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
                Text("No plans yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(item.planTitle)
                            .bold()
                        Text("\(item.category) / \(item.horizon) / \(item.targetYear)")
                        Text("Priority: \(item.priority) / Status: \(item.planStatus)")
                        Text("Estimated Cost: \(item.estimatedCost) JPY / Review: \(item.reviewMonth)")
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
