import Foundation

struct LifePlanRecord: Codable, Identifiable {
    let id: UUID
    var planTitle: String
    var category: String
    var horizon: String
    var targetYear: String
    var estimatedCost: String
    var priority: String
    var planStatus: String
    var reviewMonth: String
    var memo: String

    init(
        id: UUID = UUID(),
        planTitle: String,
        category: String,
        horizon: String,
        targetYear: String,
        estimatedCost: String,
        priority: String,
        planStatus: String,
        reviewMonth: String,
        memo: String
    ) {
        self.id = id
        self.planTitle = planTitle
        self.category = category
        self.horizon = horizon
        self.targetYear = targetYear
        self.estimatedCost = estimatedCost
        self.priority = priority
        self.planStatus = planStatus
        self.reviewMonth = reviewMonth
        self.memo = memo
    }
}
