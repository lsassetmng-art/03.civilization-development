package com.lsam.PocketSecretary.infrastructure.repository.followthrough;

import java.util.ArrayList;
import java.util.List;

import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueItem;
import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueQueryCriteria;
import com.lsam.PocketSecretary.domain.port.followthrough.FollowThroughQueueRepository;

public final class JdbcFollowThroughQueueRepository implements FollowThroughQueueRepository {

    @Override
    public List<FollowThroughQueueItem> findQueueItems(final FollowThroughQueueQueryCriteria criteria) {
        // TODO: additive-only follow-through queue read query after row family and SQL support are fixed.
        return new ArrayList<>();
    }

    @Override
    public String findNextPageToken(final FollowThroughQueueQueryCriteria criteria, final int currentResultSize) {
        // TODO: canonical paging rule after repository query semantics are fixed.
        return null;
    }
}
