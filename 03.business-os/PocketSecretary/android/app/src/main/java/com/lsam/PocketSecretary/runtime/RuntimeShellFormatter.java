package com.lsam.PocketSecretary.runtime;

public final class RuntimeShellFormatter {

    public String summarize(final RuntimeShellState state) {
        final StringBuilder builder = new StringBuilder();
        builder.append(state.getAppName()).append(":");
        for (RuntimeSection section : state.getSections()) {
            builder.append(" [")
                   .append(section.getTitle())
                   .append(" -> ")
                   .append(section.getSummary())
                   .append("]");
        }
        return builder.toString();
    }
}
