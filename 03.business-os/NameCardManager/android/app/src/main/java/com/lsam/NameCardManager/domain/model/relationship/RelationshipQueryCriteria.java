package com.lsam.NameCardManager.domain.model.relationship;

import java.util.UUID;

public final class RelationshipQueryCriteria {
    public UUID sourceNamecardId;
    public boolean includeUnconfirmed;
    public boolean includeSameCompany;
    public boolean includeExternalTargets;
    public int pageSize;
    public String pageToken;
}
