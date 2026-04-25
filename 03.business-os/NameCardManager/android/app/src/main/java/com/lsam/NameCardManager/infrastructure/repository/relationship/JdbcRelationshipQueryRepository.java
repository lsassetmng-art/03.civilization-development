package com.lsam.NameCardManager.infrastructure.repository.relationship;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;

import com.lsam.NameCardManager.domain.model.relationship.RelationshipQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipVisibilityItem;
import com.lsam.NameCardManager.domain.port.relationship.RelationshipQueryRepository;

public final class JdbcRelationshipQueryRepository implements RelationshipQueryRepository {

    private final DataSource dataSource;

    public JdbcRelationshipQueryRepository() {
        this(null);
    }

    public JdbcRelationshipQueryRepository(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<RelationshipVisibilityItem> findVisibleRelationships(final RelationshipQueryCriteria criteria) {
        final String sql =
                "select " +
                "  relationship_visibility_id, " +
                "  source_namecard_id, " +
                "  target_entity_type, " +
                "  target_namecard_id, " +
                "  target_external_ref, " +
                "  relationship_type, " +
                "  relationship_label, " +
                "  visibility_level, " +
                "  evidence_source, " +
                "  display_priority, " +
                "  user_confirmed, " +
                "  relationship_strength, " +
                "  relationship_note, " +
                "  created_at, " +
                "  updated_at " +
                "from business.namecard_relationship_visibility_support " +
                "where source_namecard_id = ? " +
                "  and (? or user_confirmed = true) " +
                "  and (? or relationship_type <> 'same_company') " +
                "  and (? or target_entity_type <> 'external_entity') " +
                "order by coalesce(display_priority, 2147483647), updated_at desc " +
                "limit ? offset ?";

        final List<RelationshipVisibilityItem> items = new ArrayList<>();
        final int offset = parseOffset(criteria.pageToken);

        try (Connection connection = requireConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, criteria.sourceNamecardId);
            ps.setBoolean(2, criteria.includeUnconfirmed);
            ps.setBoolean(3, criteria.includeSameCompany);
            ps.setBoolean(4, criteria.includeExternalTargets);
            ps.setInt(5, criteria.pageSize);
            ps.setInt(6, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items;
        } catch (SQLException e) {
            throw new IllegalStateException("NCM_RELATIONSHIP_QUERY_FAILED", e);
        }
    }

    @Override
    public String findNextPageToken(final RelationshipQueryCriteria criteria, final int currentResultSize) {
        if (currentResultSize < criteria.pageSize) {
            return null;
        }
        return String.valueOf(parseOffset(criteria.pageToken) + currentResultSize);
    }

    private Connection requireConnection() throws SQLException {
        if (dataSource == null) {
            throw new IllegalStateException("NCM_RELATIONSHIP_REPOSITORY_DATASOURCE_NOT_CONFIGURED");
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

    private RelationshipVisibilityItem mapRow(final ResultSet rs) throws SQLException {
        final RelationshipVisibilityItem item = new RelationshipVisibilityItem();
        item.relationshipVisibilityId = readUuid(rs, "relationship_visibility_id");
        item.sourceNamecardId = readUuid(rs, "source_namecard_id");
        item.targetEntityType = rs.getString("target_entity_type");
        item.targetNamecardId = readUuid(rs, "target_namecard_id");
        item.targetExternalRef = rs.getString("target_external_ref");
        item.relationshipType = rs.getString("relationship_type");
        item.relationshipLabel = rs.getString("relationship_label");
        item.visibilityLevel = rs.getString("visibility_level");
        item.evidenceSource = rs.getString("evidence_source");
        item.displayPriority = readInteger(rs, "display_priority");
        item.userConfirmed = readBoolean(rs, "user_confirmed");
        item.relationshipStrength = rs.getString("relationship_strength");
        item.relationshipNote = rs.getString("relationship_note");
        item.createdAt = rs.getObject("created_at", OffsetDateTime.class);
        item.updatedAt = rs.getObject("updated_at", OffsetDateTime.class);
        return item;
    }

    private UUID readUuid(final ResultSet rs, final String column) throws SQLException {
        return rs.getObject(column, UUID.class);
    }

    private Integer readInteger(final ResultSet rs, final String column) throws SQLException {
        final int value = rs.getInt(column);
        return rs.wasNull() ? null : Integer.valueOf(value);
    }

    private Boolean readBoolean(final ResultSet rs, final String column) throws SQLException {
        final boolean value = rs.getBoolean(column);
        return rs.wasNull() ? null : Boolean.valueOf(value);
    }
}
