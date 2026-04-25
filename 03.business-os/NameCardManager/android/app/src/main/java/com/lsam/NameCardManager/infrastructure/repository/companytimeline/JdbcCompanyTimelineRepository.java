package com.lsam.NameCardManager.infrastructure.repository.companytimeline;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;

import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineItem;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineQueryCriteria;
import com.lsam.NameCardManager.domain.port.companytimeline.CompanyTimelineRepository;

public final class JdbcCompanyTimelineRepository implements CompanyTimelineRepository {

    private final DataSource dataSource;

    public JdbcCompanyTimelineRepository() {
        this(null);
    }

    public JdbcCompanyTimelineRepository(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<CompanyTimelineItem> findTimelineItems(final CompanyTimelineQueryCriteria criteria) {
        final String sql =
                "select " +
                "  company_timeline_item_id, " +
                "  company_id, " +
                "  related_namecard_id, " +
                "  event_type_code, " +
                "  event_title, " +
                "  event_summary, " +
                "  evidence_source, " +
                "  visibility_level, " +
                "  user_confirmed, " +
                "  occurred_at, " +
                "  recorded_at, " +
                "  updated_at " +
                "from business.namecard_company_timeline_support " +
                "where company_id = ? " +
                "  and (? or user_confirmed = true) " +
                "  and (? or lower(coalesce(evidence_source, '')) <> 'internal') " +
                "  and (? or lower(coalesce(evidence_source, '')) <> 'external') " +
                "order by coalesce(occurred_at, recorded_at) desc, updated_at desc " +
                "limit ? offset ?";

        final List<CompanyTimelineItem> items = new ArrayList<>();
        final int offset = parseOffset(criteria.pageToken);

        try (Connection connection = requireConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, criteria.companyId);
            ps.setBoolean(2, criteria.includeUnconfirmed);
            ps.setBoolean(3, criteria.includeInternalEvents);
            ps.setBoolean(4, criteria.includeExternalEvents);
            ps.setInt(5, criteria.pageSize);
            ps.setInt(6, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items;
        } catch (SQLException e) {
            throw new IllegalStateException("NCM_COMPANY_TIMELINE_QUERY_FAILED", e);
        }
    }

    @Override
    public String findNextPageToken(final CompanyTimelineQueryCriteria criteria, final int currentResultSize) {
        if (currentResultSize < criteria.pageSize) {
            return null;
        }
        return String.valueOf(parseOffset(criteria.pageToken) + currentResultSize);
    }

    private Connection requireConnection() throws SQLException {
        if (dataSource == null) {
            throw new IllegalStateException("NCM_COMPANY_TIMELINE_REPOSITORY_DATASOURCE_NOT_CONFIGURED");
        }
        return dataSource.getConnection();
    }

    private int parseOffset(final String pageToken) {
        if (pageToken == null || pageToken.trim().isEmpty()) {
            return 0;
        }
        try {
            final int parsed = Integer.parseInt(pageToken.trim());
            return Math.max(parsed, 0);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private CompanyTimelineItem mapRow(final ResultSet rs) throws SQLException {
        final CompanyTimelineItem item = new CompanyTimelineItem();
        item.companyTimelineItemId = rs.getObject("company_timeline_item_id", UUID.class);
        item.companyId = rs.getObject("company_id", UUID.class);
        item.relatedNamecardId = rs.getObject("related_namecard_id", UUID.class);
        item.eventTypeCode = rs.getString("event_type_code");
        item.eventTitle = rs.getString("event_title");
        item.eventSummary = rs.getString("event_summary");
        item.evidenceSource = rs.getString("evidence_source");
        item.visibilityLevel = rs.getString("visibility_level");
        item.userConfirmed = readBoolean(rs, "user_confirmed");
        item.occurredAt = rs.getObject("occurred_at", OffsetDateTime.class);
        item.recordedAt = rs.getObject("recorded_at", OffsetDateTime.class);
        item.updatedAt = rs.getObject("updated_at", OffsetDateTime.class);
        return item;
    }

    private Boolean readBoolean(final ResultSet rs, final String column) throws SQLException {
        final boolean value = rs.getBoolean(column);
        return rs.wasNull() ? null : Boolean.valueOf(value);
    }
}
