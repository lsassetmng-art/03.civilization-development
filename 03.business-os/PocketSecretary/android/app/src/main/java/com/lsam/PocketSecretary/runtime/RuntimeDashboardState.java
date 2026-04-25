package com.lsam.PocketSecretary.runtime;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class RuntimeDashboardState {
    private final String appName;
    private final String activeTab;
    private final int briefingCount;
    private final int overdueCount;
    private final int actionCount;
    private final List<RuntimeDashboardEntry> entries;

    public RuntimeDashboardState(
            final String appName,
            final String activeTab,
            final int briefingCount,
            final int overdueCount,
            final int actionCount,
            final List<RuntimeDashboardEntry> entries
    ) {
        this.appName = appName;
        this.activeTab = activeTab;
        this.briefingCount = briefingCount;
        this.overdueCount = overdueCount;
        this.actionCount = actionCount;
        this.entries = new ArrayList<>(entries);
    }

    public String getAppName() {
        return appName;
    }

    public String getActiveTab() {
        return activeTab;
    }

    public int getBriefingCount() {
        return briefingCount;
    }

    public int getOverdueCount() {
        return overdueCount;
    }

    public int getActionCount() {
        return actionCount;
    }

    public List<RuntimeDashboardEntry> getEntries() {
        return Collections.unmodifiableList(entries);
    }
}
