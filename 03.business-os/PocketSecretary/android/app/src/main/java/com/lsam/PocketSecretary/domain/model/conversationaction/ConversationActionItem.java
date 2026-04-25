package com.lsam.PocketSecretary.domain.model.conversationaction;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ConversationActionItem {
    public UUID actionId;
    public UUID actorUserId;
    public UUID targetUserId;
    public UUID conversationId;
    public String actionTypeCode;
    public String actionTitle;
    public String actionSummary;
    public String priorityCode;
    public String actionStateCode;
    public OffsetDateTime dueAt;
    public Boolean followThroughRequired;
    public Boolean queueLinkCreated;
    public String queueStateCode;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
}
