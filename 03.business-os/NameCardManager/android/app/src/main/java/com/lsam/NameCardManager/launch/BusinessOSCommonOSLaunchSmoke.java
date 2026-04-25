package com.lsam.NameCardManager.launch;

public final class BusinessOSCommonOSLaunchSmoke {

    public static void main(final String[] args) {
        final BusinessOSCommonOSLaunchRegistry registry = new BusinessOSCommonOSLaunchRegistry();
        final BusinessOSCommonOSLaunchDescriptor descriptor = registry.createDefault();
        final BusinessOSCommonOSLaunchOrchestrator orchestrator = new BusinessOSCommonOSLaunchOrchestrator();
        final String summary = orchestrator.summarize(descriptor);

        if (!"NameCardManager".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!"launch_via_commonos_consumer".equals(descriptor.getLaunchMode())) {
            throw new IllegalStateException("Unexpected launch mode");
        }
        if (!"_commonos".equals(descriptor.getConsumerTarget())) {
            throw new IllegalStateException("Unexpected consumer target");
        }
        if (!summary.contains("uiOwner=CommonOS")) {
            throw new IllegalStateException("Missing CommonOS ui owner");
        }

        System.out.println("ANDROID_LAUNCH_OK:NameCardManager");
        System.out.println(summary);
    }
}
