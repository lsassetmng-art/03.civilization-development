package com.lsam.PocketSecretary.api.dto.briefing.response;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class BriefingQueryResponse {
    public UUID userId;
    public String briefingHeadline;
    public List<BriefingItemResponse> briefingItems = new ArrayList<>();
    public String nextPageToken;
    public OffsetDateTime generatedAt;
}
