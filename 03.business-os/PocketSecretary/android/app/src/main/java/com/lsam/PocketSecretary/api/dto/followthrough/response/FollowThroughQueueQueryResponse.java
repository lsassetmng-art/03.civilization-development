package com.lsam.PocketSecretary.api.dto.followthrough.response;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class FollowThroughQueueQueryResponse {
    public UUID userId;
    public String queueHeadline;
    public List<FollowThroughQueueItemResponse> queueItems = new ArrayList<>();
    public String nextPageToken;
    public OffsetDateTime generatedAt;
}
