package com.lsam.streaming.streamstudio.network;

public final class ApiRoutes {
    private ApiRoutes() {
    }

    public static final String DASHBOARD = "/api/v1/streamstudio/dashboard";
    public static final String PROJECTS = "/api/v1/streamstudio/projects";
    public static final String UPLOAD_QUEUE = "/api/v1/streamstudio/upload-queue";
    public static final String PROJECT_CREATE = "/api/v1/streamstudio/project/create";
    public static final String UPLOAD_CREATE = "/api/v1/streamstudio/upload/create";
    public static final String APPROVAL_REQUEST = "/api/v1/streamstudio/approval/request";
    public static final String PUBLISH_REQUEST = "/api/v1/streamstudio/publish/request";
}
