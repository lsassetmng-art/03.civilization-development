package com.lsam.NameCardManager.domain.model.companytimeline;

import java.util.UUID;

public final class CompanyTimelineQueryCriteria {
    public UUID companyId;
    public boolean includeInternalEvents;
    public boolean includeExternalEvents;
    public boolean includeUnconfirmed;
    public int pageSize;
    public String pageToken;
}
