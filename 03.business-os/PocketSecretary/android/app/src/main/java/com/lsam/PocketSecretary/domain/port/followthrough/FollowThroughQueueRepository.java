package com.lsam.PocketSecretary.domain.port.followthrough;

import java.util.List;

import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueItem;
import com.lsam.PocketSecretary.domain.model.followthrough.FollowThroughQueueQueryCriteria;

public interface FollowThroughQueueRepository {
    List<FollowThroughQueueItem> findQueueItems(FollowThroughQueueQueryCriteria criteria);
    String findNextPageToken(FollowThroughQueueQueryCriteria criteria, int currentResultSize);
}
