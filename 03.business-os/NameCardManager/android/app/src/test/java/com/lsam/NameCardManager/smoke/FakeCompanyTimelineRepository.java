package com.lsam.NameCardManager.smoke;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineItem;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineQueryCriteria;
import com.lsam.NameCardManager.domain.port.companytimeline.CompanyTimelineRepository;

public final class FakeCompanyTimelineRepository implements CompanyTimelineRepository {

    @Override
    public List<CompanyTimelineItem> findTimelineItems(final CompanyTimelineQueryCriteria criteria) {
        final List<CompanyTimelineItem> items = new ArrayList<>();

        final CompanyTimelineItem item1 = new CompanyTimelineItem();
        item1.companyTimelineItemId = UUID.randomUUID();
        item1.companyId = criteria.companyId;
        item1.relatedNamecardId = UUID.randomUUID();
        item1.eventTypeCode = "meeting";
        item1.eventTitle = "Kickoff Meeting";
        item1.eventSummary = "Initial business kickoff completed";
        item1.evidenceSource = "internal";
        item1.visibilityLevel = "visible";
        item1.userConfirmed = Boolean.TRUE;
        item1.occurredAt = OffsetDateTime.now().minusDays(10);
        item1.recordedAt = OffsetDateTime.now().minusDays(9);
        item1.updatedAt = OffsetDateTime.now().minusDays(9);
        items.add(item1);

        final CompanyTimelineItem item2 = new CompanyTimelineItem();
        item2.companyTimelineItemId = UUID.randomUUID();
        item2.companyId = criteria.companyId;
        item2.relatedNamecardId = UUID.randomUUID();
        item2.eventTypeCode = "contract_progress";
        item2.eventTitle = "Proposal Follow-up";
        item2.eventSummary = "Proposal follow-up confirmed";
        item2.evidenceSource = "external";
        item2.visibilityLevel = "visible";
        item2.userConfirmed = Boolean.TRUE;
        item2.occurredAt = OffsetDateTime.now().minusDays(3);
        item2.recordedAt = OffsetDateTime.now().minusDays(2);
        item2.updatedAt = OffsetDateTime.now().minusDays(2);
        items.add(item2);

        return items;
    }

    @Override
    public String findNextPageToken(final CompanyTimelineQueryCriteria criteria, final int currentResultSize) {
        return null;
    }
}
