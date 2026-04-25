package com.lsam.PocketSecretary.domain.model.briefing;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class BriefingItem {
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
