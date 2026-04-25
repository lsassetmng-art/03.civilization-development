package com.lsam.PocketSecretary.application.validator.followthrough;

import com.lsam.PocketSecretary.api.dto.followthrough.request.FollowThroughQueueQueryRequest;

public final class FollowThroughQueueQueryValidator {

    public void validateOrThrow(final FollowThroughQueueQueryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("PS_VAL_FOLLOW_THROUGH_QUEUE_REQUEST_REQUIRED");
        }
        if (request.userId == null) {
            throw new IllegalArgumentException("PS_VAL_USER_ID_REQUIRED");
        }
        if (request.queueDate == null) {
            throw new IllegalArgumentException("PS_VAL_QUEUE_DATE_REQUIRED");
        }
        if (request.timezone == null || request.timezone.trim().isEmpty()) {
            throw new IllegalArgumentException("PS_VAL_TIMEZONE_REQUIRED");
        }
        if (request.includeCompleted == null) {
            throw new IllegalArgumentException("PS_VAL_INCLUDE_COMPLETED_REQUIRED");
        }
        if (request.includeOverdueOnly == null) {
            throw new IllegalArgumentException("PS_VAL_INCLUDE_OVERDUE_ONLY_REQUIRED");
        }
        if (request.includeConversationLinkedOnly == null) {
            throw new IllegalArgumentException("PS_VAL_INCLUDE_CONVERSATION_LINKED_ONLY_REQUIRED");
        }
        if (request.pageSize == null) {
            throw new IllegalArgumentException("PS_VAL_PAGE_SIZE_REQUIRED");
        }
        if (request.pageSize.intValue() <= 0) {
            throw new IllegalArgumentException("PS_VAL_PAGE_SIZE_INVALID");
        }
        if (request.pageSize.intValue() > 200) {
            throw new IllegalArgumentException("PS_VAL_PAGE_SIZE_TOO_LARGE");
        }
    }
}
