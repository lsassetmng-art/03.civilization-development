package com.lsam.PocketSecretary.runtime;

import java.util.ArrayList;
import java.util.List;

public final class RuntimeDashboardFactory {

    public RuntimeDashboardState createDefault() {
        final List<RuntimeDashboardEntry> entries = new ArrayList<>();
        entries.add(new RuntimeDashboardEntry(
                "Briefing",
                "Daily overview and prioritization shell.",
                "briefing_ready"
        ));
        entries.add(new RuntimeDashboardEntry(
                "Follow-Through Queue",
                "Pending and overdue queue shell.",
                "queue_ready"
        ));
        entries.add(new RuntimeDashboardEntry(
                "Conversation Actions",
                "Conversation-to-action runtime shell.",
                "action_ready"
        ));

        return new RuntimeDashboardState(
                "PocketSecretary",
                "briefing",
                2,
                1,
                2,
                entries
        );
    }
}
