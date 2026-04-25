import Foundation

enum OsCommonConsumerRef {
    static let consumerRoot =
        "/data/data/com.termux/files/home/03.civilization-development/06.streaming-os/_commonos"

    static let adapterFile =
        consumerRoot + "/adapter/010_streaming_surface_inventory.json"
    static let bridgeFile =
        consumerRoot + "/bridge/020_streaming_route_bridge_manifest.json"
    static let mapperFile =
        consumerRoot + "/mapper/030_streamwatch_view_model_map.json"
    static let presenterFile =
        consumerRoot + "/presenter/040_streaming_shell_binding.json"
    static let themeFile =
        consumerRoot + "/theme/050_streaming_variant_binding.json"
    static let syncFile =
        consumerRoot + "/sync/060_streaming_sync_presentation_policy.json"
}
