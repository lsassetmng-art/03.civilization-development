package com.lsam.streaming.streamstudio.commonos;

public final class DisplayModelMapper {
    private DisplayModelMapper() {
    }

    public static String describeMappingScope() {
        return "dashboard -> dashboard_model, projects -> project_card_model, upload_queue -> upload_card_model";
    }
}
