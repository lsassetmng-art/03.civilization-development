import SwiftUI

struct ContentView: View {
    @StateObject private var store = TrainingCoachStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var date: String = "2026-04-21"
    @State private var category: String = "Cardio"
    @State private var minutes: String = ""
    @State private var intensity: String = "Medium"
    @State private var workout: String = ""
    @State private var memo: String = ""

    private let categories = ["Cardio", "Strength", "Mobility", "Recovery"]
    private let intensities = ["Low", "Medium", "High"]
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
            .navigationTitle("TrainingCoach")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("TrainingCoach")
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
            Text("Sessions: \(store.records.count)")
            Text("Total Minutes: \(store.totalMinutes)")
            Text("High Intensity: \(store.highIntensityCount)")
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

            Picker("Category", selection: $category) {
                ForEach(categories, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Minutes", text: $minutes)
                .textFieldStyle(.roundedBorder)

            Picker("Intensity", selection: $intensity) {
                ForEach(intensities, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Workout", text: $workout)
                .textFieldStyle(.roundedBorder)
            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Workout") {
                    store.add(
                        date: date,
                        category: category,
                        minutes: minutes,
                        intensity: intensity,
                        workout: workout,
                        memo: memo
                    )
                    minutes = ""
                    workout = ""
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
                Text("No workouts yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text("\(item.date) / \(item.category)")
                            .bold()
                        Text("\(item.minutes) min / \(item.intensity)")
                        Text(item.workout)
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
