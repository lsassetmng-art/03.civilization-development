import Foundation

struct MoneyRecord: Codable, Identifiable {
    let id: UUID
    var date: String
    var type: String
    var category: String
    var amount: String
    var memo: String

    init(
        id: UUID = UUID(),
        date: String,
        type: String,
        category: String,
        amount: String,
        memo: String
    ) {
        self.id = id
        self.date = date
        self.type = type
        self.category = category
        self.amount = amount
        self.memo = memo
    }
}
