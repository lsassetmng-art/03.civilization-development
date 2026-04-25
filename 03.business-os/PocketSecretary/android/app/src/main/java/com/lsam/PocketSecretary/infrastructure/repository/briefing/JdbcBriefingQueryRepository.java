package com.lsam.PocketSecretary.infrastructure.repository.briefing;

import java.util.ArrayList;
import java.util.List;

import com.lsam.PocketSecretary.domain.model.briefing.BriefingItem;
import com.lsam.PocketSecretary.domain.model.briefing.BriefingQueryCriteria;
import com.lsam.PocketSecretary.domain.port.briefing.BriefingQueryRepository;

public final class JdbcBriefingQueryRepository implements BriefingQueryRepository {

    @Override
    public List<BriefingItem> findBriefingItems(final BriefingQueryCriteria criteria) {
        // TODO: additive-only briefing read query after row family and SQL support are fixed.
        return new ArrayList<>();
    }

    @Override
    public String findNextPageToken(final BriefingQueryCriteria criteria, final int currentResultSize) {
        // TODO: canonical paging rule after repository query semantics are fixed.
        return null;
    }
}
