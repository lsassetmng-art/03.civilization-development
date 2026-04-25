package com.lsam.PocketSecretary.api.dto.conversationaction.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ConversationActionCreateResponse {
    public UUID actionId;
    public UUID conversationId;
    public String actionStateCode;
    public Boolean queueLinkCreated;
    public String queueStateCode;
    public OffsetDateTime createdAt;
}
