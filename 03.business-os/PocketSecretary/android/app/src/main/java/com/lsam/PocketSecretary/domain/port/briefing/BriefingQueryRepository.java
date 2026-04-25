package com.lsam.PocketSecretary.domain.port.briefing;

import java.util.List;

import com.lsam.PocketSecretary.domain.model.briefing.BriefingItem;
import com.lsam.PocketSecretary.domain.model.briefing.BriefingQueryCriteria;

public interface BriefingQueryRepository {
    List<BriefingItem> findBriefingItems(BriefingQueryCriteria criteria);
    String findNextPageToken(BriefingQueryCriteria criteria, int currentResultSize);
}
