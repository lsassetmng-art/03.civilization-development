package com.lsam.PocketSecretary.runtime;

import java.util.ArrayList;
import java.util.List;

public final class RuntimeShellFactory {

    public RuntimeShellState createDefault() {
        final List<RuntimeSection> sections = new ArrayList<>();
        sections.add(new RuntimeSection("Briefing", "Daily briefing shell."));
        sections.add(new RuntimeSection("Follow-Through Queue", "Pending and overdue queue shell."));
        sections.add(new RuntimeSection("Conversation Actions", "Conversation-to-action runtime shell."));
        return new RuntimeShellState("PocketSecretary", sections);
    }
}
