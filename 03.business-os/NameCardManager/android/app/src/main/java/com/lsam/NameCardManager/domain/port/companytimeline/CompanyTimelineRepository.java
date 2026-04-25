package com.lsam.NameCardManager.domain.port.companytimeline;

import java.util.List;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineItem;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineQueryCriteria;

public interface CompanyTimelineRepository {
    List<CompanyTimelineItem> findTimelineItems(CompanyTimelineQueryCriteria criteria);
    String findNextPageToken(CompanyTimelineQueryCriteria criteria, int currentResultSize);
}
