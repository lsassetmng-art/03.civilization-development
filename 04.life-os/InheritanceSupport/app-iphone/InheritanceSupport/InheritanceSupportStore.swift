import Foundation

final class InheritanceSupportStore: ObservableObject {
    @Published var records: [InheritanceRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_inheritancesupport_records_ios"

    init() {
        load()
    }

    func add(
        caseName: String,
        itemType: String,
        ownerName: String,
        amount: String,
        dueDate: String,
        status: String,
        sharing: String,
        priority: String,
        memo: String
    ) {
        let record = InheritanceRecord(
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
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var heirCount: Int {
        records.filter { $0.itemType == "Heir" }.count
    }

    var deadlineCount: Int {
        records.filter { $0.itemType == "Deadline" }.count
    }

    var assetTotal: Int {
        records.filter { $0.itemType == "Asset" }.compactMap { Int($0.amount) }.reduce(0, +)
    }

    var debtTotal: Int {
        records.filter { $0.itemType == "Debt" }.compactMap { Int($0.amount) }.reduce(0, +)
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([InheritanceRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
