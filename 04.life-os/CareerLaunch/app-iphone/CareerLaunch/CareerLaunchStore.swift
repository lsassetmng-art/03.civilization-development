import Foundation

final class CareerLaunchStore: ObservableObject {
    @Published var records: [ApplicationRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_careerlaunch_records_ios"

    init() {
        load()
    }

    func add(company: String, position: String, stage: String, dueDate: String, note: String) {
        let record = ApplicationRecord(
            company: company,
            position: position,
            stage: stage,
            dueDate: dueDate,
            note: note
        )
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    func count(stage: String) -> Int {
        records.filter { $0.stage == stage }.count
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([ApplicationRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
