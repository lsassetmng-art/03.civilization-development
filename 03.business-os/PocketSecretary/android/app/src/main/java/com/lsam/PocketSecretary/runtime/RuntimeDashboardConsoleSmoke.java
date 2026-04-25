package com.lsam.PocketSecretary.runtime;

public final class RuntimeDashboardConsoleSmoke {

    public static void main(final String[] args) {
        final RuntimeDashboardFactory factory = new RuntimeDashboardFactory();
        final RuntimeDashboardState state = factory.createDefault();
        final RuntimeDashboardFormatter formatter = new RuntimeDashboardFormatter();
        final String summary = formatter.summarize(state);

        if (!"PocketSecretary".equals(state.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (state.getEntries().size() != 3) {
            throw new IllegalStateException("Unexpected entry size");
        }
        if (!summary.contains("Follow-Through Queue")) {
            throw new IllegalStateException("Missing queue section");
        }

        System.out.println("ANDROID_RUNTIME_SMOKE_OK:PocketSecretary");
        System.out.println(summary);
    }
}
