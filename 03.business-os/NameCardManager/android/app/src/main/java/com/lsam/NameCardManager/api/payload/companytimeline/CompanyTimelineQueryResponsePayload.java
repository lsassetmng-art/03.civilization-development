package com.lsam.NameCardManager.api.payload.companytimeline;

import java.util.ArrayList;
import java.util.List;

public final class CompanyTimelineQueryResponsePayload {
    public boolean success;
    public List<CompanyTimelineEntryPayload> timelineEntries = new ArrayList<>();
    public String errorCode;
    public String errorMessage;
}
