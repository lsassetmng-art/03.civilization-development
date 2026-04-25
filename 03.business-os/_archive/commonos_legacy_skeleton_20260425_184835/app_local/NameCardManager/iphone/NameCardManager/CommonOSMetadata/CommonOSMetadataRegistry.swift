import Foundation

enum CommonOSMetadataRegistry {
    static func createDefault() -> CommonOSMetadataDescriptor {
        CommonOSMetadataDescriptor(
            appName: "NameCardManager",
            localeKeys: [
                "name_card_manager.capture.title",
                "name_card_manager.relationships.title",
                "name_card_manager.company_timeline.title"
            ],
            screenTemplates: [
                "list_detail_standard",
                "record_card_grid",
                "search_filter_detail"
            ],
            helpTemplates: [
                "capture_help_template",
                "relationship_merge_help_template"
            ],
            notificationTemplates: [
                "capture_review_required",
                "relationship_merge_pending"
            ],
            attachmentTemporaryHolding: "local_storage",
            attachmentPreviewShell: "CommonOS Attachment UI",
            attachmentAllowedKinds: [
                "image",
                "pdf"
            ],
            exportTemplates: [
                "contact_export_csv",
                "company_timeline_export_pdf"
            ]
        )
    }
}
