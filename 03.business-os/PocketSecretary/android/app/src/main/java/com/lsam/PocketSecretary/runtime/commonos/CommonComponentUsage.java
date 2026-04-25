package com.lsam.PocketSecretary.runtime.commonos;

import java.util.ArrayList;
import java.util.List;

public final class CommonComponentUsage {

    public CommonOSRuntimeDescriptor createDefault() {
        final List<String> components = new ArrayList<>();
        components.add("Card");
        components.add("List");
        components.add("Search Bar");
        components.add("Filter Panel");
        components.add("Status Chip");
        components.add("Toast");
        components.add("Offline Queue Status UI");
        components.add("Sync Retry UI");
        components.add("Conflict Review UI");
        components.add("App Shell");

        final List<String> variants = new ArrayList<>();
        variants.add("panel.sync");
        variants.add("panel.conflict");
        variants.add("input.compact");
        variants.add("button.primary");
        variants.add("card.standard");

        return new CommonOSRuntimeDescriptor("PocketSecretary", components, variants);
    }
}
