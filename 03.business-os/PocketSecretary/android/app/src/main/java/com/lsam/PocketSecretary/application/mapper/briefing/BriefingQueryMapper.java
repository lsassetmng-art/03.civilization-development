package com.lsam.PocketSecretary.application.mapper.briefing;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.lsam.PocketSecretary.api.dto.briefing.request.BriefingQueryRequest;
import com.lsam.PocketSecretary.api.dto.briefing.response.BriefingItemResponse;
import com.lsam.PocketSecretary.api.dto.briefing.response.BriefingQueryResponse;
import com.lsam.PocketSecretary.domain.model.briefing.BriefingItem;
import com.lsam.PocketSecretary.domain.model.briefing.BriefingQueryCriteria;

public final class BriefingQueryMapper {

    public BriefingQueryCriteria toCriteria(final BriefingQueryRequest request) {
        final BriefingQueryCriteria criteria = new BriefingQueryCriteria();
        criteria.userId = request.userId;
        criteria.briefingDate = request.briefingDate;
        criteria.timezone = request.timezone;
        criteria.includePendingActions = request.includePendingActions.booleanValue();
        criteria.includeOverdueItems = request.includeOverdueItems.booleanValue();
        criteria.includeRecentConversationSummaries = request.includeRecentConversationSummaries.booleanValue();
        criteria.pageSize = request.pageSize.intValue();
        criteria.pageToken = request.pageToken;
        return criteria;
    }

    public BriefingQueryResponse toResponse(
            final BriefingQueryCriteria criteria,
            final List<BriefingItem> items,
            final String nextPageToken
    ) {
        final BriefingQueryResponse response = new BriefingQueryResponse();
        response.userId = criteria.userId;
        response.briefingHeadline = buildHeadline(items);
        response.briefingItems = mapItems(items);
        response.nextPageToken = nextPageToken;
        response.generatedAt = OffsetDateTime.now();
        return response;
    }

    private List<BriefingItemResponse> mapItems(final List<BriefingItem> items) {
        final List<BriefingItemResponse> responses = new ArrayList<>();
        if (items == null) {
            return responses;
        }
        for (BriefingItem item : items) {
            final BriefingItemResponse out = new BriefingItemResponse();
            out.briefingItemId = item.briefingItemId;
            out.itemTypeCode = item.itemTypeCode;
            out.itemTitle = item.itemTitle;
            out.itemSummary = item.itemSummary;
            out.urgencyCode = item.urgencyCode;
            out.overdue = item.overdue;
            out.actionable = item.actionable;
            out.dueAt = item.dueAt;
            out.sourceOccurredAt = item.sourceOccurredAt;
            responses.add(out);
        }
        return responses;
    }

    private String buildHeadline(final List<BriefingItem> items) {
        if (items == null || items.isEmpty()) {
            return "No briefing items available.";
        }
        return "Briefing items available: " + items.size();
    }
}
