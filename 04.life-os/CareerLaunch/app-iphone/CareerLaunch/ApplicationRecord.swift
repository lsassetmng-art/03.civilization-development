import Foundation

struct ApplicationRecord: Codable, Identifiable {
    let id: UUID
    var company: String
    var position: String
    var stage: String
    var dueDate: String
    var note: String

    init(
        id: UUID = UUID(),
        company: String,
        position: String,
        stage: String,
        dueDate: String,
        note: String
    ) {
        self.id = id
        self.company = company
        self.position = position
        self.stage = stage
        self.dueDate = dueDate
        self.note = note
    }
}
