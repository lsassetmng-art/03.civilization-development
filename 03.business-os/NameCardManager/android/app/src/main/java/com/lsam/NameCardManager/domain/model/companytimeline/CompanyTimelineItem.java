package com.lsam.NameCardManager.domain.model.companytimeline;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class CompanyTimelineItem {
    public UUID companyTimelineItemId;
    public UUID companyId;
    public UUID relatedNamecardId;
    public String eventTypeCode;
    public String eventTitle;
    public String eventSummary;
    public String evidenceSource;
    public String visibilityLevel;
    public Boolean userConfirmed;
    public OffsetDateTime occurredAt;
    public OffsetDateTime recordedAt;
    public OffsetDateTime updatedAt;
}
