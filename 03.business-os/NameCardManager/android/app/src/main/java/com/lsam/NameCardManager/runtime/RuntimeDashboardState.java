package com.lsam.NameCardManager.runtime;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class RuntimeDashboardState {
    private final String appName;
    private final String activeTab;
    private final int captureCount;
    private final int relationshipCount;
    private final int companyTimelineCount;
    private final List<RuntimeDashboardEntry> entries;

    public RuntimeDashboardState(
            final String appName,
            final String activeTab,
            final int captureCount,
            final int relationshipCount,
            final int companyTimelineCount,
            final List<RuntimeDashboardEntry> entries
    ) {
        this.appName = appName;
        this.activeTab = activeTab;
        this.captureCount = captureCount;
        this.relationshipCount = relationshipCount;
        this.companyTimelineCount = companyTimelineCount;
        this.entries = new ArrayList<>(entries);
    }

    public String getAppName() {
        return appName;
    }

    public String getActiveTab() {
        return activeTab;
    }

    public int getCaptureCount() {
        return captureCount;
    }

    public int getRelationshipCount() {
        return relationshipCount;
    }

    public int getCompanyTimelineCount() {
        return companyTimelineCount;
    }

    public List<RuntimeDashboardEntry> getEntries() {
        return Collections.unmodifiableList(entries);
    }
}
