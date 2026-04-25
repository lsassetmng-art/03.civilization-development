package com.lsam.NameCardManager.runtime.commonos.metadata;

import java.util.ArrayList;
import java.util.List;

public final class CommonOSMetadataRegistry {

    public CommonOSMetadataDescriptor createDefault() {
        final List<String> localeKeys = new ArrayList<>();
        localeKeys.add("name_card_manager.capture.title");
        localeKeys.add("name_card_manager.relationships.title");
        localeKeys.add("name_card_manager.company_timeline.title");

        final List<String> screenTemplates = new ArrayList<>();
        screenTemplates.add("list_detail_standard");
        screenTemplates.add("record_card_grid");
        screenTemplates.add("search_filter_detail");

        final List<String> helpTemplates = new ArrayList<>();
        helpTemplates.add("capture_help_template");
        helpTemplates.add("relationship_merge_help_template");

        final List<String> notificationTemplates = new ArrayList<>();
        notificationTemplates.add("capture_review_required");
        notificationTemplates.add("relationship_merge_pending");

        final List<String> allowedKinds = new ArrayList<>();
        allowedKinds.add("image");
        allowedKinds.add("pdf");

        final List<String> exportTemplates = new ArrayList<>();
        exportTemplates.add("contact_export_csv");
        exportTemplates.add("company_timeline_export_pdf");

        return new CommonOSMetadataDescriptor(
                "NameCardManager",
                localeKeys,
                screenTemplates,
                helpTemplates,
                notificationTemplates,
                "local_storage",
                "CommonOS Attachment UI",
                allowedKinds,
                exportTemplates
        );
    }
}
