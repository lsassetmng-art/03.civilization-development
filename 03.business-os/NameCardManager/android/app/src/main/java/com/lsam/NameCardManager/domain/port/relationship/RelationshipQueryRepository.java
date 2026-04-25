package com.lsam.NameCardManager.domain.port.relationship;

import java.util.List;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipVisibilityItem;

public interface RelationshipQueryRepository {
    List<RelationshipVisibilityItem> findVisibleRelationships(RelationshipQueryCriteria criteria);
    String findNextPageToken(RelationshipQueryCriteria criteria, int currentResultSize);
}
