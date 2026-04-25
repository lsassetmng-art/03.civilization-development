package com.lsam.PocketSecretary.api.dto.briefing.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class BriefingItemResponse {
    public UUID briefingItemId;
    public String itemTypeCode;
    public String itemTitle;
    public String itemSummary;
    public String urgencyCode;
    public Boolean overdue;
    public Boolean actionable;
    public OffsetDateTime dueAt;
    public OffsetDateTime sourceOccurredAt;
}
