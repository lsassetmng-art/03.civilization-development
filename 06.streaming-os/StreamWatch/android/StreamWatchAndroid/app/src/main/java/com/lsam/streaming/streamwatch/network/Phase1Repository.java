package com.lsam.streaming.streamwatch.network;

public final class Phase1Repository {
    public String getHomeRoute() {
        return ApiRoutes.HOME;
    }

    public String getLibraryRoute() {
        return ApiRoutes.LIBRARY;
    }

    public String getProfileBootstrapRoute() {
        return ApiRoutes.PROFILE_BOOTSTRAP;
    }

    public String getTvHandoffStartRoute() {
        return ApiRoutes.TV_HANDOFF_START;
    }
}
