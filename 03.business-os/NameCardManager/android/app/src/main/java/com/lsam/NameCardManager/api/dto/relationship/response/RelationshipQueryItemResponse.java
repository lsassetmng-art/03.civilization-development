package com.lsam.NameCardManager.api.dto.relationship.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class RelationshipQueryItemResponse {
    public UUID relationshipVisibilityId;
    public UUID sourceNamecardId;
    public String targetEntityType;
    public UUID targetNamecardId;
    public String targetExternalRef;
    public String relationshipType;
    public String relationshipLabel;
    public String visibilityLevel;
    public String evidenceSource;
    public Integer displayPriority;
    public Boolean userConfirmed;
    public String relationshipStrength;
    public String relationshipNote;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
}
