import Foundation

struct Phase1Repository {
    func homeRoute() -> String {
        ApiRoutes.home
    }

    func libraryRoute() -> String {
        ApiRoutes.library
    }

    func profileBootstrapRoute() -> String {
        ApiRoutes.profileBootstrap
    }

    func tvHandoffStartRoute() -> String {
        ApiRoutes.tvHandoffStart
    }
}
