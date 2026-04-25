package com.lsam.NameCardManager.runtime;

public final class RuntimeDashboardEntry {
    private final String title;
    private final String summary;
    private final String status;

    public RuntimeDashboardEntry(final String title, final String summary, final String status) {
        this.title = title;
        this.summary = summary;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getStatus() {
        return status;
    }
}
