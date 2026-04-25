package com.lsam.NameCardManager.api.dto.relationship.request;

import java.util.UUID;

public final class RelationshipQueryRequest {
    public UUID sourceNamecardId;
    public Boolean includeUnconfirmed;
    public Boolean includeSameCompany;
    public Boolean includeExternalTargets;
    public Integer pageSize;
    public String pageToken;
}
