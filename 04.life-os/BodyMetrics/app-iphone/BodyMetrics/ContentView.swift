import SwiftUI

struct ContentView: View {
    @StateObject private var store = BodyMetricsStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var date: String = "2026-04-21"
    @State private var weight: String = ""
    @State private var bodyFat: String = ""
    @State private var sleepHours: String = ""
    @State private var memo: String = ""

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
            .navigationTitle("BodyMetrics")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("BodyMetrics")
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

            Text("Records: \(store.records.count)")
            Text("Latest Weight: \(store.latestWeight)")
            Text("Average Weight: \(store.averageWeight)")
            Text("Average Sleep: \(store.averageSleep)")
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
            TextField("Weight kg", text: $weight)
                .textFieldStyle(.roundedBorder)
            TextField("Body Fat %", text: $bodyFat)
                .textFieldStyle(.roundedBorder)
            TextField("Sleep Hours", text: $sleepHours)
                .textFieldStyle(.roundedBorder)
            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Record") {
                    store.add(
                        date: date,
                        weight: weight,
                        bodyFat: bodyFat,
                        sleepHours: sleepHours,
                        memo: memo
                    )
                    weight = ""
                    bodyFat = ""
                    sleepHours = ""
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
                Text("No records yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text("\(item.date) / \(item.weight) kg")
                            .bold()
                        Text("Body Fat: \(item.bodyFat)% / Sleep: \(item.sleepHours)h")
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
