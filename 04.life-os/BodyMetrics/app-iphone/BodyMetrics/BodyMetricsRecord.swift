import Foundation

struct BodyMetricsRecord: Codable, Identifiable {
    let id: UUID
    var date: String
    var weight: String
    var bodyFat: String
    var sleepHours: String
    var memo: String

    init(
        id: UUID = UUID(),
        date: String,
        weight: String,
        bodyFat: String,
        sleepHours: String,
        memo: String
    ) {
        self.id = id
        self.date = date
        self.weight = weight
        self.bodyFat = bodyFat
        self.sleepHours = sleepHours
        self.memo = memo
    }
}
