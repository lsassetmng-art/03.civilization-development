import Foundation

final class MoneyPlannerStore: ObservableObject {
    @Published var records: [MoneyRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_moneyplanner_records_ios"

    init() {
        load()
    }

    func add(date: String, type: String, category: String, amount: String, memo: String) {
        let record = MoneyRecord(
            date: date,
            type: type,
            category: category,
            amount: amount,
            memo: memo
        )
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var incomeTotal: Int {
        records.filter { $0.type == "Income" }.compactMap { Int($0.amount) }.reduce(0, +)
    }

    var expenseTotal: Int {
        records.filter { $0.type == "Expense" }.compactMap { Int($0.amount) }.reduce(0, +)
    }

    var balance: Int {
        incomeTotal - expenseTotal
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([MoneyRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
