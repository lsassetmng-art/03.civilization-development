package com.lsam.streaming.streamstudio.network;

public final class Phase1Repository {
    public String getDashboardRoute() {
        return ApiRoutes.DASHBOARD;
    }

    public String getProjectsRoute() {
        return ApiRoutes.PROJECTS;
    }

    public String getUploadQueueRoute() {
        return ApiRoutes.UPLOAD_QUEUE;
    }

    public String getPublishRequestRoute() {
        return ApiRoutes.PUBLISH_REQUEST;
    }
}
