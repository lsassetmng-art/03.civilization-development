package com.lsam.NameCardManager.smoke;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lsam.NameCardManager.domain.model.relationship.RelationshipQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipVisibilityItem;
import com.lsam.NameCardManager.domain.port.relationship.RelationshipQueryRepository;

public final class FakeRelationshipQueryRepository implements RelationshipQueryRepository {

    @Override
    public List<RelationshipVisibilityItem> findVisibleRelationships(final RelationshipQueryCriteria criteria) {
        final List<RelationshipVisibilityItem> items = new ArrayList<>();

        final RelationshipVisibilityItem item1 = new RelationshipVisibilityItem();
        item1.relationshipVisibilityId = UUID.randomUUID();
        item1.sourceNamecardId = criteria.sourceNamecardId;
        item1.targetEntityType = "namecard";
        item1.targetNamecardId = UUID.randomUUID();
        item1.relationshipType = "client_contact";
        item1.relationshipLabel = "Client Contact";
        item1.visibilityLevel = "visible";
        item1.evidenceSource = "manual_confirmation";
        item1.displayPriority = Integer.valueOf(10);
        item1.userConfirmed = Boolean.TRUE;
        item1.relationshipStrength = "strong";
        item1.relationshipNote = "Primary client-side point of contact";
        item1.createdAt = OffsetDateTime.now();
        item1.updatedAt = item1.createdAt;
        items.add(item1);

        final RelationshipVisibilityItem item2 = new RelationshipVisibilityItem();
        item2.relationshipVisibilityId = UUID.randomUUID();
        item2.sourceNamecardId = criteria.sourceNamecardId;
        item2.targetEntityType = "external_entity";
        item2.targetExternalRef = "partner-ref-001";
        item2.relationshipType = "partner";
        item2.relationshipLabel = "Partner";
        item2.visibilityLevel = "visible";
        item2.evidenceSource = "timeline_inference";
        item2.displayPriority = Integer.valueOf(20);
        item2.userConfirmed = Boolean.TRUE;
        item2.relationshipStrength = "medium";
        item2.relationshipNote = "Linked by company activity";
        item2.createdAt = OffsetDateTime.now();
        item2.updatedAt = item2.createdAt;
        items.add(item2);

        return items;
    }

    @Override
    public String findNextPageToken(final RelationshipQueryCriteria criteria, final int currentResultSize) {
        return null;
    }
}
