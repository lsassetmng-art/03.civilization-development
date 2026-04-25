package com.lsam.NameCardManager.runtime;

import java.util.ArrayList;
import java.util.List;

public final class RuntimeShellFactory {

    public RuntimeShellState createDefault() {
        final List<RuntimeSection> sections = new ArrayList<>();
        sections.add(new RuntimeSection("Capture", "Image staging and card intake shell."));
        sections.add(new RuntimeSection("Relationships", "Visible relationship query shell."));
        sections.add(new RuntimeSection("Company Timeline", "Company activity timeline shell."));
        return new RuntimeShellState("NameCardManager", sections);
    }
}
