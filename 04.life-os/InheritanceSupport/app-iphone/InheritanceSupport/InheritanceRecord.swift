import Foundation

struct InheritanceRecord: Codable, Identifiable {
    let id: UUID
    var caseName: String
    var itemType: String
    var ownerName: String
    var amount: String
    var dueDate: String
    var status: String
    var sharing: String
    var priority: String
    var memo: String

    init(
        id: UUID = UUID(),
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
        self.id = id
        self.caseName = caseName
        self.itemType = itemType
        self.ownerName = ownerName
        self.amount = amount
        self.dueDate = dueDate
        self.status = status
        self.sharing = sharing
        self.priority = priority
        self.memo = memo
    }
}
