package com.lsam.PocketSecretary.application.validator.conversationaction;

import com.lsam.PocketSecretary.api.dto.conversationaction.request.ConversationActionCreateRequest;

public final class ConversationActionCreateValidator {

    public void validateOrThrow(final ConversationActionCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("PS_VAL_CONVERSATION_ACTION_REQUEST_REQUIRED");
        }
        if (request.actorUserId == null) {
            throw new IllegalArgumentException("PS_VAL_ACTOR_USER_ID_REQUIRED");
        }
        if (request.targetUserId == null) {
            throw new IllegalArgumentException("PS_VAL_TARGET_USER_ID_REQUIRED");
        }
        if (request.conversationId == null) {
            throw new IllegalArgumentException("PS_VAL_CONVERSATION_ID_REQUIRED");
        }
        if (request.actionTypeCode == null || request.actionTypeCode.trim().isEmpty()) {
            throw new IllegalArgumentException("PS_VAL_ACTION_TYPE_CODE_REQUIRED");
        }
        if (request.actionTitle == null || request.actionTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("PS_VAL_ACTION_TITLE_REQUIRED");
        }
        if (request.priorityCode == null || request.priorityCode.trim().isEmpty()) {
            throw new IllegalArgumentException("PS_VAL_PRIORITY_CODE_REQUIRED");
        }
        if (request.followThroughRequired == null) {
            throw new IllegalArgumentException("PS_VAL_FOLLOW_THROUGH_REQUIRED_REQUIRED");
        }
        if (request.createQueueLink == null) {
            throw new IllegalArgumentException("PS_VAL_CREATE_QUEUE_LINK_REQUIRED");
        }
    }
}
