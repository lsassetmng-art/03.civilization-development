import Foundation

struct TrainingRecord: Codable, Identifiable {
    let id: UUID
    var date: String
    var category: String
    var minutes: String
    var intensity: String
    var workout: String
    var memo: String

    init(
        id: UUID = UUID(),
        date: String,
        category: String,
        minutes: String,
        intensity: String,
        workout: String,
        memo: String
    ) {
        self.id = id
        self.date = date
        self.category = category
        self.minutes = minutes
        self.intensity = intensity
        self.workout = workout
        self.memo = memo
    }
}
