import Foundation

final class MealPlannerStore: ObservableObject {
    @Published var records: [MealRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_mealplanner_records_ios"

    init() {
        load()
    }

    func add(date: String, mealType: String, calories: String, protein: String, menu: String, memo: String) {
        let record = MealRecord(
            date: date,
            mealType: mealType,
            calories: calories,
            protein: protein,
            menu: menu,
            memo: memo
        )
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var totalCalories: Int {
        records.compactMap { Int($0.calories) }.reduce(0, +)
    }

    var totalProtein: Int {
        records.compactMap { Int($0.protein) }.reduce(0, +)
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([MealRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
