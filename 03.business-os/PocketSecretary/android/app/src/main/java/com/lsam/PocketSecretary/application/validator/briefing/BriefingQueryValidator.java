package com.lsam.PocketSecretary.application.validator.briefing;

import com.lsam.PocketSecretary.api.dto.briefing.request.BriefingQueryRequest;

public final class BriefingQueryValidator {

    public void validateOrThrow(final BriefingQueryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("PS_VAL_BRIEFING_QUERY_REQUEST_REQUIRED");
        }
        if (request.userId == null) {
            throw new IllegalArgumentException("PS_VAL_USER_ID_REQUIRED");
        }
        if (request.briefingDate == null) {
            throw new IllegalArgumentException("PS_VAL_BRIEFING_DATE_REQUIRED");
        }
        if (request.timezone == null || request.timezone.trim().isEmpty()) {
            throw new IllegalArgumentException("PS_VAL_TIMEZONE_REQUIRED");
        }
        if (request.includePendingActions == null) {
            throw new IllegalArgumentException("PS_VAL_INCLUDE_PENDING_ACTIONS_REQUIRED");
        }
        if (request.includeOverdueItems == null) {
            throw new IllegalArgumentException("PS_VAL_INCLUDE_OVERDUE_ITEMS_REQUIRED");
        }
        if (request.includeRecentConversationSummaries == null) {
            throw new IllegalArgumentException("PS_VAL_INCLUDE_RECENT_CONVERSATION_SUMMARIES_REQUIRED");
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
