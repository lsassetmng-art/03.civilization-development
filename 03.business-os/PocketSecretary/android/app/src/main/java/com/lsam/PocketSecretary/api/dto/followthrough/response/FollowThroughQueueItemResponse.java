package com.lsam.PocketSecretary.api.dto.followthrough.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class FollowThroughQueueItemResponse {
    public UUID followThroughQueueItemId;
    public String itemTypeCode;
    public String itemTitle;
    public String itemSummary;
    public String followThroughStateCode;
    public String urgencyCode;
    public Boolean overdue;
    public Boolean conversationLinked;
    public UUID relatedConversationId;
    public UUID relatedActionId;
    public OffsetDateTime dueAt;
    public OffsetDateTime updatedAt;
}
