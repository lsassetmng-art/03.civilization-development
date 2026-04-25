import Foundation

final class BodyMetricsStore: ObservableObject {
    @Published var records: [BodyMetricsRecord] = [] {
        didSet { save() }
    }

    private let key = "lifeos_bodymetrics_records_ios"

    init() {
        load()
    }

    func add(date: String, weight: String, bodyFat: String, sleepHours: String, memo: String) {
        let record = BodyMetricsRecord(
            date: date,
            weight: weight,
            bodyFat: bodyFat,
            sleepHours: sleepHours,
            memo: memo
        )
        records.insert(record, at: 0)
    }

    func clear() {
        records = []
    }

    var latestWeight: String {
        records.first?.weight.isEmpty == false ? records.first!.weight : "-"
    }

    var averageWeight: String {
        let values = records.compactMap { Double($0.weight) }
        guard !values.isEmpty else { return "-" }
        let avg = values.reduce(0, +) / Double(values.count)
        return String(format: "%.1f", avg)
    }

    var averageSleep: String {
        let values = records.compactMap { Double($0.sleepHours) }
        guard !values.isEmpty else { return "-" }
        let avg = values.reduce(0, +) / Double(values.count)
        return String(format: "%.1f", avg)
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let decoded = try? JSONDecoder().decode([BodyMetricsRecord].self, from: data)
        else {
            records = []
            return
        }
        records = decoded
    }
}
