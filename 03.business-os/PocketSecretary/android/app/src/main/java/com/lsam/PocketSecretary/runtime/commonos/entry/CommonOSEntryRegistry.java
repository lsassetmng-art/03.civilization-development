package com.lsam.PocketSecretary.runtime.commonos.entry;

import java.util.ArrayList;
import java.util.List;

public final class CommonOSEntryRegistry {

    public CommonOSEntryDescriptor createDefault() {
        final List<String> components = new ArrayList<>();
        components.add("App Shell");
        components.add("Card");
        components.add("List");
        components.add("Search Bar");
        components.add("Filter Panel");
        components.add("Status Chip");
        components.add("Toast");
        components.add("Offline Queue Status UI");
        components.add("Sync Retry UI");
        components.add("Conflict Review UI");

        final List<String> variants = new ArrayList<>();
        variants.add("panel.sync");
        variants.add("panel.conflict");
        variants.add("input.compact");
        variants.add("button.primary");
        variants.add("card.standard");

        return new CommonOSEntryDescriptor("PocketSecretary", components, variants);
    }
}
