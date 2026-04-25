package com.lsam.NameCardManager.runtime;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class RuntimeShellState {
    private final String appName;
    private final List<RuntimeSection> sections;

    public RuntimeShellState(final String appName, final List<RuntimeSection> sections) {
        this.appName = appName;
        this.sections = new ArrayList<>(sections);
    }

    public String getAppName() {
        return appName;
    }

    public List<RuntimeSection> getSections() {
        return Collections.unmodifiableList(sections);
    }
}
