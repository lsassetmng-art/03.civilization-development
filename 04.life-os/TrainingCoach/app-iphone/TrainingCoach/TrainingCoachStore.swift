import Foundation

final class TrainingCoachStore: ObservableObject {
    @Published var records: [TrainingRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_trainingcoach_records_ios"

    init() {
        load()
    }

    func add(date: String, category: String, minutes: String, intensity: String, workout: String, memo: String) {
        let record = TrainingRecord(
            date: date,
            category: category,
            minutes: minutes,
            intensity: intensity,
            workout: workout,
            memo: memo
        )
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var totalMinutes: Int {
        records.compactMap { Int($0.minutes) }.reduce(0, +)
    }

    var highIntensityCount: Int {
        records.filter { $0.intensity == "High" }.count
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([TrainingRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
