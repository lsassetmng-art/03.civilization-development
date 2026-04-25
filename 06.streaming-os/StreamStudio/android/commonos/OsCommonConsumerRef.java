package com.lsam.streaming.streamstudio.commonos;

public final class OsCommonConsumerRef {
    private OsCommonConsumerRef() {
    }

    public static final String CONSUMER_ROOT =
        "/data/data/com.termux/files/home/03.civilization-development/06.streaming-os/_commonos";

    public static final String ADAPTER_FILE =
        CONSUMER_ROOT + "/adapter/010_streaming_surface_inventory.json";
    public static final String BRIDGE_FILE =
        CONSUMER_ROOT + "/bridge/020_streaming_route_bridge_manifest.json";
    public static final String MAPPER_FILE =
        CONSUMER_ROOT + "/mapper/031_streamstudio_view_model_map.json";
    public static final String PRESENTER_FILE =
        CONSUMER_ROOT + "/presenter/040_streaming_shell_binding.json";
    public static final String THEME_FILE =
        CONSUMER_ROOT + "/theme/050_streaming_variant_binding.json";
    public static final String SYNC_FILE =
        CONSUMER_ROOT + "/sync/060_streaming_sync_presentation_policy.json";
}
