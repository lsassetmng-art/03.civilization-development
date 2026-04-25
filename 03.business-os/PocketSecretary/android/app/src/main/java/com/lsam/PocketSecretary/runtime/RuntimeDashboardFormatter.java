package com.lsam.PocketSecretary.runtime;

public final class RuntimeDashboardFormatter {

    public String summarize(final RuntimeDashboardState state) {
        final StringBuilder builder = new StringBuilder();
        builder.append(state.getAppName())
               .append(" activeTab=")
               .append(state.getActiveTab())
               .append(" briefingCount=")
               .append(state.getBriefingCount())
               .append(" overdueCount=")
               .append(state.getOverdueCount())
               .append(" actionCount=")
               .append(state.getActionCount());

        for (RuntimeDashboardEntry entry : state.getEntries()) {
            builder.append(" [")
                   .append(entry.getTitle())
                   .append(" | ")
                   .append(entry.getSummary())
                   .append(" | ")
                   .append(entry.getStateCode())
                   .append("]");
        }
        return builder.toString();
    }
}
