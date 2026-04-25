package com.lsam.NameCardManager.application.mapper.relationship;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryItemResponse;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryResponse;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipVisibilityItem;

public final class RelationshipQueryMapper {

    public RelationshipQueryCriteria toCriteria(final RelationshipQueryRequest request) {
        final RelationshipQueryCriteria criteria = new RelationshipQueryCriteria();
        criteria.sourceNamecardId = request.sourceNamecardId;
        criteria.includeUnconfirmed = request.includeUnconfirmed.booleanValue();
        criteria.includeSameCompany = request.includeSameCompany.booleanValue();
        criteria.includeExternalTargets = request.includeExternalTargets.booleanValue();
        criteria.pageSize = request.pageSize.intValue();
        criteria.pageToken = request.pageToken;
        return criteria;
    }

    public RelationshipQueryResponse toResponse(
            final RelationshipQueryCriteria criteria,
            final List<RelationshipVisibilityItem> items,
            final String nextPageToken
    ) {
        final RelationshipQueryResponse response = new RelationshipQueryResponse();
        response.sourceNamecardId = criteria.sourceNamecardId;
        response.relationshipItems = mapItems(items);
        response.nextPageToken = nextPageToken;
        response.healthSummaryMessage = buildHealthSummary(items);
        response.generatedAt = OffsetDateTime.now();
        return response;
    }

    private List<RelationshipQueryItemResponse> mapItems(final List<RelationshipVisibilityItem> items) {
        final List<RelationshipQueryItemResponse> responses = new ArrayList<>();
        for (RelationshipVisibilityItem item : items) {
            final RelationshipQueryItemResponse out = new RelationshipQueryItemResponse();
            out.relationshipVisibilityId = item.relationshipVisibilityId;
            out.sourceNamecardId = item.sourceNamecardId;
            out.targetEntityType = item.targetEntityType;
            out.targetNamecardId = item.targetNamecardId;
            out.targetExternalRef = item.targetExternalRef;
            out.relationshipType = item.relationshipType;
            out.relationshipLabel = item.relationshipLabel;
            out.visibilityLevel = item.visibilityLevel;
            out.evidenceSource = item.evidenceSource;
            out.displayPriority = item.displayPriority;
            out.userConfirmed = item.userConfirmed;
            out.relationshipStrength = item.relationshipStrength;
            out.relationshipNote = item.relationshipNote;
            out.createdAt = item.createdAt;
            out.updatedAt = item.updatedAt;
            responses.add(out);
        }
        return responses;
    }

    private String buildHealthSummary(final List<RelationshipVisibilityItem> items) {
        if (items == null || items.isEmpty()) {
            return "No visible relationships found.";
        }
        return "Visible relationships found: " + items.size();
    }
}
