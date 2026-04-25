import Foundation

struct MealRecord: Codable, Identifiable {
    let id: UUID
    var date: String
    var mealType: String
    var calories: String
    var protein: String
    var menu: String
    var memo: String

    init(
        id: UUID = UUID(),
        date: String,
        mealType: String,
        calories: String,
        protein: String,
        menu: String,
        memo: String
    ) {
        self.id = id
        self.date = date
        self.mealType = mealType
        self.calories = calories
        self.protein = protein
        self.menu = menu
        self.memo = memo
    }
}
