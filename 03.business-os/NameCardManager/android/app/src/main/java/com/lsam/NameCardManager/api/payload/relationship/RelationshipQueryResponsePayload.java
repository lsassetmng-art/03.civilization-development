package com.lsam.NameCardManager.api.payload.relationship;

import java.util.ArrayList;
import java.util.List;

public final class RelationshipQueryResponsePayload {
    public boolean success;
    public List<RelationshipEntryPayload> relationshipEntries = new ArrayList<>();
    public String errorCode;
    public String errorMessage;
}
