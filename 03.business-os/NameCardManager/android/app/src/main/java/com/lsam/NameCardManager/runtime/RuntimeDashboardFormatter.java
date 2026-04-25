package com.lsam.NameCardManager.runtime;

public final class RuntimeDashboardFormatter {

    public String summarize(final RuntimeDashboardState state) {
        final StringBuilder builder = new StringBuilder();
        builder.append(state.getAppName())
               .append(" activeTab=")
               .append(state.getActiveTab())
               .append(" captureCount=")
               .append(state.getCaptureCount())
               .append(" relationshipCount=")
               .append(state.getRelationshipCount())
               .append(" companyTimelineCount=")
               .append(state.getCompanyTimelineCount());

        for (RuntimeDashboardEntry entry : state.getEntries()) {
            builder.append(" [")
                   .append(entry.getTitle())
                   .append(" | ")
                   .append(entry.getSummary())
                   .append(" | ")
                   .append(entry.getStatus())
                   .append("]");
        }
        return builder.toString();
    }
}
