package com.lsam.PocketSecretary.domain.model.followthrough;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class FollowThroughQueueItem {
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
