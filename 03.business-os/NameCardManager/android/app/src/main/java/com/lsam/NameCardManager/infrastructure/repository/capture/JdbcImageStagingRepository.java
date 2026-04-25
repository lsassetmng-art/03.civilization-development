package com.lsam.NameCardManager.infrastructure.repository.capture;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import javax.sql.DataSource;

import com.lsam.NameCardManager.domain.model.capture.ImageStagingItem;
import com.lsam.NameCardManager.domain.port.capture.ImageStagingRepository;

public final class JdbcImageStagingRepository implements ImageStagingRepository {

    private final DataSource dataSource;

    public JdbcImageStagingRepository() {
        this(null);
    }

    public JdbcImageStagingRepository(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public ImageStagingItem registerImageStaging(final ImageStagingItem item) {
        final String sql =
                "insert into business.namecard_image_staging_support (" +
                "  image_staging_id, capture_session_id, actor_user_id, staging_object_key, " +
                "  staging_state_code, image_role_type, page_index, display_order, " +
                "  width_px, height_px, checksum_sha256, created_at, updated_at" +
                ") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "returning " +
                "  image_staging_id, capture_session_id, actor_user_id, staging_object_key, " +
                "  staging_state_code, image_role_type, page_index, display_order, " +
                "  width_px, height_px, checksum_sha256, created_at, updated_at";

        try (Connection connection = requireConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, item.imageStagingId);
            ps.setObject(2, item.captureSessionId);
            ps.setObject(3, item.actorUserId);
            ps.setString(4, item.stagingObjectKey);
            ps.setString(5, item.stagingStateCode);
            ps.setString(6, item.imageRoleType);
            ps.setInt(7, item.pageIndex.intValue());
            ps.setInt(8, item.displayOrder.intValue());
            if (item.widthPx == null) {
                ps.setNull(9, java.sql.Types.INTEGER);
            } else {
                ps.setInt(9, item.widthPx.intValue());
            }
            if (item.heightPx == null) {
                ps.setNull(10, java.sql.Types.INTEGER);
            } else {
                ps.setInt(10, item.heightPx.intValue());
            }
            ps.setString(11, item.checksumSha256);
            ps.setObject(12, item.createdAt);
            ps.setObject(13, item.updatedAt);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalStateException("NCM_IMAGE_STAGING_INSERT_RETURN_EMPTY");
                }
                return mapRow(rs);
            }
        } catch (SQLException e) {
            throw new IllegalStateException("NCM_IMAGE_STAGING_INSERT_FAILED", e);
        }
    }

    private Connection requireConnection() throws SQLException {
        if (dataSource == null) {
            throw new IllegalStateException("NCM_IMAGE_STAGING_REPOSITORY_DATASOURCE_NOT_CONFIGURED");
        }
        return dataSource.getConnection();
    }

    private ImageStagingItem mapRow(final ResultSet rs) throws SQLException {
        final ImageStagingItem item = new ImageStagingItem();
        item.imageStagingId = rs.getObject("image_staging_id", java.util.UUID.class);
        item.captureSessionId = rs.getObject("capture_session_id", java.util.UUID.class);
        item.actorUserId = rs.getObject("actor_user_id", java.util.UUID.class);
        item.stagingObjectKey = rs.getString("staging_object_key");
        item.stagingStateCode = rs.getString("staging_state_code");
        item.imageRoleType = rs.getString("image_role_type");
        item.pageIndex = Integer.valueOf(rs.getInt("page_index"));
        item.displayOrder = Integer.valueOf(rs.getInt("display_order"));
        item.widthPx = readInteger(rs, "width_px");
        item.heightPx = readInteger(rs, "height_px");
        item.checksumSha256 = rs.getString("checksum_sha256");
        item.createdAt = rs.getObject("created_at", OffsetDateTime.class);
        item.updatedAt = rs.getObject("updated_at", OffsetDateTime.class);
        return item;
    }

    private Integer readInteger(final ResultSet rs, final String column) throws SQLException {
        final int value = rs.getInt(column);
        return rs.wasNull() ? null : Integer.valueOf(value);
    }
}
