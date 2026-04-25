package com.lsam.PocketSecretary.domain.model.briefing;

import java.time.LocalDate;
import java.util.UUID;

public final class BriefingQueryCriteria {
    public UUID userId;
    public LocalDate briefingDate;
    public String timezone;
    public boolean includePendingActions;
    public boolean includeOverdueItems;
    public boolean includeRecentConversationSummaries;
    public int pageSize;
    public String pageToken;
}
