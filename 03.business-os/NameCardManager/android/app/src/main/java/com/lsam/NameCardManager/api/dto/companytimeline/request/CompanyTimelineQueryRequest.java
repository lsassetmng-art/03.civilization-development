package com.lsam.NameCardManager.api.dto.companytimeline.request;

import java.util.UUID;

public final class CompanyTimelineQueryRequest {
    public UUID companyId;
    public Boolean includeInternalEvents;
    public Boolean includeExternalEvents;
    public Boolean includeUnconfirmed;
    public Integer pageSize;
    public String pageToken;
}
