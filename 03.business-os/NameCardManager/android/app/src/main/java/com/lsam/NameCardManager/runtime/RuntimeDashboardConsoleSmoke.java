package com.lsam.NameCardManager.runtime;

public final class RuntimeDashboardConsoleSmoke {

    public static void main(final String[] args) {
        final RuntimeDashboardFactory factory = new RuntimeDashboardFactory();
        final RuntimeDashboardState state = factory.createDefault();
        final RuntimeDashboardFormatter formatter = new RuntimeDashboardFormatter();
        final String summary = formatter.summarize(state);

        if (!"NameCardManager".equals(state.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (state.getEntries().size() != 3) {
            throw new IllegalStateException("Unexpected entry size");
        }
        if (!summary.contains("Capture Inbox")) {
            throw new IllegalStateException("Missing capture section");
        }

        System.out.println("ANDROID_RUNTIME_SMOKE_OK:NameCardManager");
        System.out.println(summary);
    }
}
