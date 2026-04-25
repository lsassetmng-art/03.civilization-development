package com.lsam.PocketSecretary.application.mapper.followthrough;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.lsam.PocketSecretary.api.dto.followthrough.request.FollowThroughQueueQueryRequest;
import com.lsam.PocketSecretary.api.dto.followthrough.response.FollowThroughQueueItemResponse;
import com.lsam.PocketSecretary.api.dto.followthrough.response.FollowThroughQueueQueryResponse;
import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueItem;
import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueQueryCriteria;

public final class FollowThroughQueueQueryMapper {

    public FollowThroughQueueQueryCriteria toCriteria(final FollowThroughQueueQueryRequest request) {
        final FollowThroughQueueQueryCriteria criteria = new FollowThroughQueueQueryCriteria();
        criteria.userId = request.userId;
        criteria.queueDate = request.queueDate;
        criteria.timezone = request.timezone;
        criteria.includeCompleted = request.includeCompleted.booleanValue();
        criteria.includeOverdueOnly = request.includeOverdueOnly.booleanValue();
        criteria.includeConversationLinkedOnly = request.includeConversationLinkedOnly.booleanValue();
        criteria.pageSize = request.pageSize.intValue();
        criteria.pageToken = request.pageToken;
        return criteria;
    }

    public FollowThroughQueueQueryResponse toResponse(
            final FollowThroughQueueQueryCriteria criteria,
            final List<FollowThroughQueueItem> items,
            final String nextPageToken
    ) {
        final FollowThroughQueueQueryResponse response = new FollowThroughQueueQueryResponse();
        response.userId = criteria.userId;
        response.queueHeadline = buildHeadline(items);
        response.queueItems = mapItems(items);
        response.nextPageToken = nextPageToken;
        response.generatedAt = OffsetDateTime.now();
        return response;
    }

    private List<FollowThroughQueueItemResponse> mapItems(final List<FollowThroughQueueItem> items) {
        final List<FollowThroughQueueItemResponse> responses = new ArrayList<>();
        if (items == null) {
            return responses;
        }
        for (FollowThroughQueueItem item : items) {
            final FollowThroughQueueItemResponse out = new FollowThroughQueueItemResponse();
            out.followThroughQueueItemId = item.followThroughQueueItemId;
            out.itemTypeCode = item.itemTypeCode;
            out.itemTitle = item.itemTitle;
            out.itemSummary = item.itemSummary;
            out.followThroughStateCode = item.followThroughStateCode;
            out.urgencyCode = item.urgencyCode;
            out.overdue = item.overdue;
            out.conversationLinked = item.conversationLinked;
            out.relatedConversationId = item.relatedConversationId;
            out.relatedActionId = item.relatedActionId;
            out.dueAt = item.dueAt;
            out.updatedAt = item.updatedAt;
            responses.add(out);
        }
        return responses;
    }

    private String buildHeadline(final List<FollowThroughQueueItem> items) {
        if (items == null || items.isEmpty()) {
            return "No follow-through queue items available.";
        }
        return "Follow-through queue items available: " + items.size();
    }
}
