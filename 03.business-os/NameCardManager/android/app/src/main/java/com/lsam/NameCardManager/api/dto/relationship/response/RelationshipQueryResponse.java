package com.lsam.NameCardManager.api.dto.relationship.response;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class RelationshipQueryResponse {
    public UUID sourceNamecardId;
    public List<RelationshipQueryItemResponse> relationshipItems = new ArrayList<>();
    public String nextPageToken;
    public String healthSummaryMessage;
    public OffsetDateTime generatedAt;
}
