import Foundation

enum CommonRuntimePolicy {
    static let commonPreferredSurfaces: [String] = [
        CommonSurfaceIds.appShell,
        CommonSurfaceIds.header,
        CommonSurfaceIds.navigation,
        CommonSurfaceIds.buttonPrimary,
        CommonSurfaceIds.inputDefault,
        CommonSurfaceIds.searchBar,
        CommonSurfaceIds.list,
        CommonSurfaceIds.cardRecord,
        CommonSurfaceIds.panelSync,
        CommonSurfaceIds.panelConflict
    ]

    static let streamingLocalSurfaces: [String] = [
        CommonSurfaceIds.playbackSurface,
        CommonSurfaceIds.mediaControlSurface,
        CommonSurfaceIds.watchProgressCommit,
        CommonSurfaceIds.tvHandoffExecution
    ]
}
