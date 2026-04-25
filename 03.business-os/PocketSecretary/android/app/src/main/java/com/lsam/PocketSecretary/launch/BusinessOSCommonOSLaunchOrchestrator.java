package com.lsam.PocketSecretary.launch;

public final class BusinessOSCommonOSLaunchOrchestrator {

    public String summarize(final BusinessOSCommonOSLaunchDescriptor descriptor) {
        return descriptor.getAppName()
                + " mode=" + descriptor.getLaunchMode()
                + " defaultTarget=" + descriptor.getDefaultTarget()
                + " consumerTarget=" + descriptor.getConsumerTarget()
                + " uiOwner=" + descriptor.getUiOwner()
                + " businessOwner=" + descriptor.getBusinessOwner();
    }
}
