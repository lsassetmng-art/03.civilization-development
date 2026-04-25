import Foundation

struct EndOfLifeRecord: Codable, Identifiable {
    let id: UUID
    var entryType: String
    var title: String
    var status: String
    var visibility: String
    var targetPerson: String
    var reviewDate: String
    var contactOrLocation: String
    var importance: String
    var memo: String

    init(
        id: UUID = UUID(),
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
        self.id = id
        self.entryType = entryType
        self.title = title
        self.status = status
        self.visibility = visibility
        self.targetPerson = targetPerson
        self.reviewDate = reviewDate
        self.contactOrLocation = contactOrLocation
        self.importance = importance
        self.memo = memo
    }
}
