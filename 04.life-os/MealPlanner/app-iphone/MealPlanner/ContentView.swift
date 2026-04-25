import SwiftUI

struct ContentView: View {
    @StateObject private var store = MealPlannerStore()

    @State private var personaName: String = ""
    @State private var selectedBackground: String = "Sunrise"

    @State private var date: String = "2026-04-21"
    @State private var mealType: String = "Breakfast"
    @State private var calories: String = ""
    @State private var protein: String = ""
    @State private var menu: String = ""
    @State private var memo: String = ""

    private let mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"]
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
            .navigationTitle("MealPlanner")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("MealPlanner")
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
            Text("Meals: \(store.records.count)")
            Text("Total Calories: \(store.totalCalories)")
            Text("Total Protein: \(store.totalProtein) g")
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

            Picker("Meal Type", selection: $mealType) {
                ForEach(mealTypes, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)

            TextField("Calories", text: $calories)
                .textFieldStyle(.roundedBorder)
            TextField("Protein g", text: $protein)
                .textFieldStyle(.roundedBorder)
            TextField("Menu", text: $menu)
                .textFieldStyle(.roundedBorder)
            TextField("Memo", text: $memo, axis: .vertical)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save Meal") {
                    store.add(
                        date: date,
                        mealType: mealType,
                        calories: calories,
                        protein: protein,
                        menu: menu,
                        memo: memo
                    )
                    calories = ""
                    protein = ""
                    menu = ""
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
                Text("No meals yet")
                    .foregroundColor(.secondary)
            } else {
                ForEach(store.records) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        Text("\(item.date) / \(item.mealType)")
                            .bold()
                        Text("\(item.calories) kcal / Protein \(item.protein) g")
                        Text(item.menu)
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
