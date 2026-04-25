package com.lsam.NameCardManager.runtime;

public final class RuntimeSection {
    private final String title;
    private final String summary;

    public RuntimeSection(final String title, final String summary) {
        this.title = title;
        this.summary = summary;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }
}
