package com.lsam.NameCardManager.infrastructure.repository.capture;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import javax.sql.DataSource;

import com.lsam.NameCardManager.domain.model.capture.NameCardCaptureSession;
import com.lsam.NameCardManager.domain.port.capture.NameCardCaptureSessionRepository;

public final class JdbcNameCardCaptureSessionRepository implements NameCardCaptureSessionRepository {

    private final DataSource dataSource;

    public JdbcNameCardCaptureSessionRepository() {
        this(null);
    }

    public JdbcNameCardCaptureSessionRepository(final DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public NameCardCaptureSession createCaptureSession(final NameCardCaptureSession session) {
        final String sql =
                "insert into business.namecard_capture_session_support (" +
                "  capture_session_id, actor_user_id, capture_source_type, capture_state_code, " +
                "  original_file_name, mime_type, file_size_bytes, request_ocr_later, " +
                "  app_share_boundary_code, erp_publication_boundary_code, created_at, updated_at" +
                ") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "returning " +
                "  capture_session_id, actor_user_id, capture_source_type, capture_state_code, " +
                "  original_file_name, mime_type, file_size_bytes, request_ocr_later, " +
                "  app_share_boundary_code, erp_publication_boundary_code, created_at, updated_at";

        try (Connection connection = requireConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, session.captureSessionId);
            ps.setObject(2, session.actorUserId);
            ps.setString(3, session.captureSourceType);
            ps.setString(4, session.captureStateCode);
            ps.setString(5, session.originalFileName);
            ps.setString(6, session.mimeType);
            ps.setLong(7, session.fileSizeBytes.longValue());
            ps.setBoolean(8, session.requestOcrLater.booleanValue());
            ps.setString(9, session.appShareBoundaryCode);
            ps.setString(10, session.erpPublicationBoundaryCode);
            ps.setObject(11, session.createdAt);
            ps.setObject(12, session.updatedAt);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalStateException("NCM_CAPTURE_SESSION_INSERT_RETURN_EMPTY");
                }
                return mapRow(rs);
            }
        } catch (SQLException e) {
            throw new IllegalStateException("NCM_CAPTURE_SESSION_INSERT_FAILED", e);
        }
    }

    private Connection requireConnection() throws SQLException {
        if (dataSource == null) {
            throw new IllegalStateException("NCM_CAPTURE_SESSION_REPOSITORY_DATASOURCE_NOT_CONFIGURED");
        }
        return dataSource.getConnection();
    }

    private NameCardCaptureSession mapRow(final ResultSet rs) throws SQLException {
        final NameCardCaptureSession session = new NameCardCaptureSession();
        session.captureSessionId = rs.getObject("capture_session_id", java.util.UUID.class);
        session.actorUserId = rs.getObject("actor_user_id", java.util.UUID.class);
        session.captureSourceType = rs.getString("capture_source_type");
        session.captureStateCode = rs.getString("capture_state_code");
        session.originalFileName = rs.getString("original_file_name");
        session.mimeType = rs.getString("mime_type");
        session.fileSizeBytes = Long.valueOf(rs.getLong("file_size_bytes"));
        session.requestOcrLater = Boolean.valueOf(rs.getBoolean("request_ocr_later"));
        session.appShareBoundaryCode = rs.getString("app_share_boundary_code");
        session.erpPublicationBoundaryCode = rs.getString("erp_publication_boundary_code");
        session.createdAt = rs.getObject("created_at", OffsetDateTime.class);
        session.updatedAt = rs.getObject("updated_at", OffsetDateTime.class);
        return session;
    }
}
