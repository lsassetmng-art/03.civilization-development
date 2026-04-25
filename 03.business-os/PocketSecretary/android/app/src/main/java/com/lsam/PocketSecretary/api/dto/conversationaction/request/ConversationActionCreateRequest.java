package com.lsam.PocketSecretary.api.dto.conversationaction.request;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ConversationActionCreateRequest {
    public UUID actorUserId;
    public UUID targetUserId;
    public UUID conversationId;
    public String actionTypeCode;
    public String actionTitle;
    public String actionSummary;
    public String priorityCode;
    public OffsetDateTime dueAt;
    public Boolean followThroughRequired;
    public Boolean createQueueLink;
}
