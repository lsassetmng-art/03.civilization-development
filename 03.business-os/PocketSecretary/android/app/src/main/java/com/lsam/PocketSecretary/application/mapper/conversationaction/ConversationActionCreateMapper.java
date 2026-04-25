package com.lsam.PocketSecretary.application.mapper.conversationaction;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.lsam.PocketSecretary.api.dto.conversationaction.request.ConversationActionCreateRequest;
import com.lsam.PocketSecretary.api.dto.conversationaction.response.ConversationActionCreateResponse;
import com.lsam.PocketSecretary.domain.model.conversationaction.ConversationActionItem;

public final class ConversationActionCreateMapper {

    public ConversationActionItem toDomain(final ConversationActionCreateRequest request) {
        final ConversationActionItem item = new ConversationActionItem();
        item.actionId = UUID.randomUUID();
        item.actorUserId = request.actorUserId;
        item.targetUserId = request.targetUserId;
        item.conversationId = request.conversationId;
        item.actionTypeCode = request.actionTypeCode;
        item.actionTitle = request.actionTitle;
        item.actionSummary = request.actionSummary;
        item.priorityCode = request.priorityCode;
        item.actionStateCode = "created";
        item.dueAt = request.dueAt;
        item.followThroughRequired = request.followThroughRequired;
        item.queueLinkCreated = request.createQueueLink;
        item.queueStateCode = request.createQueueLink.booleanValue() ? "queued" : "not_queued";
        item.createdAt = OffsetDateTime.now();
        item.updatedAt = item.createdAt;
        return item;
    }

    public ConversationActionCreateResponse toResponse(final ConversationActionItem item) {
        final ConversationActionCreateResponse response = new ConversationActionCreateResponse();
        response.actionId = item.actionId;
        response.conversationId = item.conversationId;
        response.actionStateCode = item.actionStateCode;
        response.queueLinkCreated = item.queueLinkCreated;
        response.queueStateCode = item.queueStateCode;
        response.createdAt = item.createdAt;
        return response;
    }
}
