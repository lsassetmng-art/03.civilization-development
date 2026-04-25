import Foundation

final class LifePlannerStore: ObservableObject {
    @Published var records: [LifePlanRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_lifeplanner_records_ios"

    init() {
        load()
    }

    func add(
        planTitle: String,
        category: String,
        horizon: String,
        targetYear: String,
        estimatedCost: String,
        priority: String,
        planStatus: String,
        reviewMonth: String,
        memo: String
    ) {
        let record = LifePlanRecord(
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
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var activeCount: Int {
        records.filter { $0.planStatus == "Active" }.count
    }

    var familyCount: Int {
        records.filter { $0.category == "Family" }.count
    }

    var estimatedTotal: Int {
        records.compactMap { Int($0.estimatedCost) }.reduce(0, +)
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([LifePlanRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
