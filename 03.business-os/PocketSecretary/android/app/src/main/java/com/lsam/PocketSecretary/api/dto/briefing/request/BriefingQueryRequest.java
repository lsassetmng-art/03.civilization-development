package com.lsam.PocketSecretary.api.dto.briefing.request;

import java.time.LocalDate;
import java.util.UUID;

public final class BriefingQueryRequest {
    public UUID userId;
    public LocalDate briefingDate;
    public String timezone;
    public Boolean includePendingActions;
    public Boolean includeOverdueItems;
    public Boolean includeRecentConversationSummaries;
    public Integer pageSize;
    public String pageToken;
}
