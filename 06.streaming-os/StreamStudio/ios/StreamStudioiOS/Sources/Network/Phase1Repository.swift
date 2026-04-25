import Foundation

struct Phase1Repository {
    func dashboardRoute() -> String {
        ApiRoutes.dashboard
    }

    func projectsRoute() -> String {
        ApiRoutes.projects
    }

    func uploadQueueRoute() -> String {
        ApiRoutes.uploadQueue
    }

    func publishRequestRoute() -> String {
        ApiRoutes.publishRequest
    }
}
