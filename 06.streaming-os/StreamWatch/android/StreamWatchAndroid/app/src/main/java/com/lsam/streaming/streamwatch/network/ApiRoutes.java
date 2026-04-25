package com.lsam.streaming.streamwatch.network;

public final class ApiRoutes {
    private ApiRoutes() {
    }

    public static final String PROFILE_BOOTSTRAP = "/api/v1/streamwatch/profile/bootstrap";
    public static final String HOME = "/api/v1/streamwatch/home";
    public static final String CATEGORY_TREE = "/api/v1/streamwatch/category-tree";
    public static final String LIBRARY = "/api/v1/streamwatch/library";
    public static final String PROGRESS_UPSERT = "/api/v1/streamwatch/progress/upsert";
    public static final String TV_HANDOFF_START = "/api/v1/streamwatch/tv-handoff/start";
    public static final String MEMBERSHIP_JOIN = "/api/v1/streamwatch/membership/join";
}
