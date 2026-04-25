package com.lsam.NameCardManager.runtime;

import java.util.ArrayList;
import java.util.List;

public final class RuntimeDashboardFactory {

    public RuntimeDashboardState createDefault() {
        final List<RuntimeDashboardEntry> entries = new ArrayList<>();
        entries.add(new RuntimeDashboardEntry(
                "Capture Inbox",
                "Image staging intake and review entry point.",
                "staging_pending"
        ));
        entries.add(new RuntimeDashboardEntry(
                "Relationship Summary",
                "Connection visibility and linked people shell.",
                "visible"
        ));
        entries.add(new RuntimeDashboardEntry(
                "Company Timeline",
                "Company event flow and activity shell.",
                "timeline_ready"
        ));

        return new RuntimeDashboardState(
                "NameCardManager",
                "capture",
                2,
                2,
                2,
                entries
        );
    }
}
