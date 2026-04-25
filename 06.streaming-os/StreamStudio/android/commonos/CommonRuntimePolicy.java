package com.lsam.streaming.streamstudio.commonos;

import java.util.Arrays;
import java.util.List;

public final class CommonRuntimePolicy {
    private CommonRuntimePolicy() {
    }

    public static List<String> getCommonPreferredSurfaces() {
        return Arrays.asList(
            CommonSurfaceIds.APP_SHELL,
            CommonSurfaceIds.HEADER,
            CommonSurfaceIds.NAVIGATION,
            CommonSurfaceIds.BUTTON_PRIMARY,
            CommonSurfaceIds.INPUT_DEFAULT,
            CommonSurfaceIds.SEARCH_BAR,
            CommonSurfaceIds.LIST,
            CommonSurfaceIds.CARD_RECORD,
            CommonSurfaceIds.PANEL_SYNC,
            CommonSurfaceIds.PANEL_CONFLICT
        );
    }

    public static List<String> getStreamingLocalSurfaces() {
        return Arrays.asList(
            CommonSurfaceIds.PLAYBACK_SURFACE,
            CommonSurfaceIds.MEDIA_CONTROL_SURFACE,
            CommonSurfaceIds.WATCH_PROGRESS_COMMIT,
            CommonSurfaceIds.TV_HANDOFF_EXECUTION
        );
    }
}
