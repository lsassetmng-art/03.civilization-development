package com.lsam.PocketSecretary.domain.model.followthrough;

import java.time.LocalDate;
import java.util.UUID;

public final class FollowThroughQueueQueryCriteria {
    public UUID userId;
    public LocalDate queueDate;
    public String timezone;
    public boolean includeCompleted;
    public boolean includeOverdueOnly;
    public boolean includeConversationLinkedOnly;
    public int pageSize;
    public String pageToken;
}
