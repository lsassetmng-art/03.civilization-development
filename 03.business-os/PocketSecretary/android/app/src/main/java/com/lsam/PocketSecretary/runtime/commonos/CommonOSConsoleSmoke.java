package com.lsam.PocketSecretary.runtime.commonos;

import java.util.ArrayList;
import java.util.List;

public final class CommonOSConsoleSmoke {

    public static void main(final String[] args) {
        final CommonComponentUsage usage = new CommonComponentUsage();
        final CommonOSRuntimeDescriptor descriptor = usage.createDefault();

        final List<String> queueStates = new ArrayList<>();
        queueStates.add("pending");
        queueStates.add("processing");
        queueStates.add("retry_wait");
        queueStates.add("sent");
        queueStates.add("failed");
        queueStates.add("cancelled");
        queueStates.add("conflict");

        final QueuePresentationState queue = new QueuePresentationState(
                "CommonOS",
                "PocketSecretary",
                queueStates
        );

        if (!"PocketSecretary".equals(descriptor.getAppName())) {
            throw new IllegalStateException("Unexpected app name");
        }
        if (!descriptor.getCommonComponentUsage().contains("Toast")) {
            throw new IllegalStateException("Missing Toast component");
        }
        if (!queue.getStates().contains("conflict")) {
            throw new IllegalStateException("Missing queue conflict state");
        }

        System.out.println("COMMONOS_ANDROID_SMOKE_OK:PocketSecretary");
        System.out.println(descriptor.getAppName() + " components=" + descriptor.getCommonComponentUsage().size());
        System.out.println("queueOwner=" + queue.getPresentationOwner() + " businessOwner=" + queue.getBusinessMeaningOwner());
    }
}
