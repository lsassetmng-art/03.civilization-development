import Foundation

final class EndOfLifePlannerStore: ObservableObject {
    @Published var records: [EndOfLifeRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_endoflifeplanner_records_ios"

    init() {
        load()
    }

    func add(
        entryType: String,
        title: String,
        status: String,
        visibility: String,
        targetPerson: String,
        reviewDate: String,
        contactOrLocation: String,
        importance: String,
        memo: String
    ) {
        let record = EndOfLifeRecord(
            entryType: entryType,
            title: title,
            status: status,
            visibility: visibility,
            targetPerson: targetPerson,
            reviewDate: reviewDate,
            contactOrLocation: contactOrLocation,
            importance: importance,
            memo: memo
        )
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var readyCount: Int {
        records.filter { $0.status == "Ready" }.count
    }

    var sharedCount: Int {
        records.filter { $0.status == "Shared" }.count
    }

    var documentCount: Int {
        records.filter { $0.entryType == "Document" }.count
    }

    var contactCount: Int {
        records.filter { $0.entryType == "Contact" }.count
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([EndOfLifeRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
