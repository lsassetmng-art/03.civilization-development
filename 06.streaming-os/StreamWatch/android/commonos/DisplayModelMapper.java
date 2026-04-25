package com.lsam.streaming.streamwatch.commonos;

public final class DisplayModelMapper {
    private DisplayModelMapper() {
    }

    public static String describeMappingScope() {
        return "profile_bootstrap -> header_model, home -> home_card_model, library -> library_card_model";
    }
}
