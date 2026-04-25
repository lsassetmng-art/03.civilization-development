package com.lsam.PocketSecretary.runtime.commonos.metadata;

import java.util.ArrayList;
import java.util.List;

public final class CommonOSMetadataRegistry {

    public CommonOSMetadataDescriptor createDefault() {
        final List<String> localeKeys = new ArrayList<>();
        localeKeys.add("pocket_secretary.briefing.title");
        localeKeys.add("pocket_secretary.follow_through_queue.title");
        localeKeys.add("pocket_secretary.conversation_actions.title");

        final List<String> screenTemplates = new ArrayList<>();
        screenTemplates.add("briefing_dashboard_standard");
        screenTemplates.add("queue_detail_standard");
        screenTemplates.add("action_capture_flow");

        final List<String> helpTemplates = new ArrayList<>();
        helpTemplates.add("briefing_help_template");
        helpTemplates.add("queue_retry_help_template");

        final List<String> notificationTemplates = new ArrayList<>();
        notificationTemplates.add("briefing_ready_notice");
        notificationTemplates.add("follow_through_retry_required");

        final List<String> allowedKinds = new ArrayList<>();
        allowedKinds.add("image");
        allowedKinds.add("pdf");
        allowedKinds.add("text");

        final List<String> exportTemplates = new ArrayList<>();
        exportTemplates.add("briefing_export_pdf");
        exportTemplates.add("action_summary_export_csv");

        return new CommonOSMetadataDescriptor(
                "PocketSecretary",
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
