package com.lsam.NameCardManager.api.dto.companytimeline.response;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class CompanyTimelineQueryResponse {
    public UUID companyId;
    public List<CompanyTimelineQueryItemResponse> timelineItems = new ArrayList<>();
    public String nextPageToken;
    public String healthSummaryMessage;
    public OffsetDateTime generatedAt;
}
