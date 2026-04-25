package com.lsam.PocketSecretary.api.dto.followthrough.request;

import java.time.LocalDate;
import java.util.UUID;

public final class FollowThroughQueueQueryRequest {
    public UUID userId;
    public LocalDate queueDate;
    public String timezone;
    public Boolean includeCompleted;
    public Boolean includeOverdueOnly;
    public Boolean includeConversationLinkedOnly;
    public Integer pageSize;
    public String pageToken;
}
