package com.lsam.PocketSecretary.runtime;

public final class RuntimeDashboardEntry {
    private final String title;
    private final String summary;
    private final String stateCode;

    public RuntimeDashboardEntry(final String title, final String summary, final String stateCode) {
        this.title = title;
        this.summary = summary;
        this.stateCode = stateCode;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getStateCode() {
        return stateCode;
    }
}
