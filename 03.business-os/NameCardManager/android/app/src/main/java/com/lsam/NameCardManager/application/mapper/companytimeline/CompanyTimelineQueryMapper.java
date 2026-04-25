package com.lsam.NameCardManager.application.mapper.companytimeline;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryItemResponse;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryResponse;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineItem;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineQueryCriteria;

public final class CompanyTimelineQueryMapper {

    public CompanyTimelineQueryCriteria toCriteria(final CompanyTimelineQueryRequest request) {
        final CompanyTimelineQueryCriteria criteria = new CompanyTimelineQueryCriteria();
        criteria.companyId = request.companyId;
        criteria.includeInternalEvents = request.includeInternalEvents.booleanValue();
        criteria.includeExternalEvents = request.includeExternalEvents.booleanValue();
        criteria.includeUnconfirmed = request.includeUnconfirmed.booleanValue();
        criteria.pageSize = request.pageSize.intValue();
        criteria.pageToken = request.pageToken;
        return criteria;
    }

    public CompanyTimelineQueryResponse toResponse(
            final CompanyTimelineQueryCriteria criteria,
            final List<CompanyTimelineItem> items,
            final String nextPageToken
    ) {
        final CompanyTimelineQueryResponse response = new CompanyTimelineQueryResponse();
        response.companyId = criteria.companyId;
        response.timelineItems = mapItems(items);
        response.nextPageToken = nextPageToken;
        response.healthSummaryMessage = buildHealthSummary(items);
        response.generatedAt = OffsetDateTime.now();
        return response;
    }

    private List<CompanyTimelineQueryItemResponse> mapItems(final List<CompanyTimelineItem> items) {
        final List<CompanyTimelineQueryItemResponse> responses = new ArrayList<>();
        for (CompanyTimelineItem item : items) {
            final CompanyTimelineQueryItemResponse out = new CompanyTimelineQueryItemResponse();
            out.companyTimelineItemId = item.companyTimelineItemId;
            out.companyId = item.companyId;
            out.relatedNamecardId = item.relatedNamecardId;
            out.eventTypeCode = item.eventTypeCode;
            out.eventTitle = item.eventTitle;
            out.eventSummary = item.eventSummary;
            out.evidenceSource = item.evidenceSource;
            out.visibilityLevel = item.visibilityLevel;
            out.userConfirmed = item.userConfirmed;
            out.occurredAt = item.occurredAt;
            out.recordedAt = item.recordedAt;
            out.updatedAt = item.updatedAt;
            responses.add(out);
        }
        return responses;
    }

    private String buildHealthSummary(final List<CompanyTimelineItem> items) {
        if (items == null || items.isEmpty()) {
            return "No timeline items found.";
        }
        return "Timeline items found: " + items.size();
    }
}
