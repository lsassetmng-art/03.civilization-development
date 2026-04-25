package com.lsam.NameCardManager.smokeapi;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.lsam.NameCardManager.api.controller.capture.NameCardCaptureController;
import com.lsam.NameCardManager.api.controller.companytimeline.CompanyTimelineQueryController;
import com.lsam.NameCardManager.api.controller.relationship.RelationshipQueryController;
import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;
import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;
import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;
import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;
import com.lsam.NameCardManager.api.facade.NameCardManagerPhaseAApiFacade;
import com.lsam.NameCardManager.api.payload.adapter.NameCardManagerPhaseAApiPayloadAdapter;
import com.lsam.NameCardManager.api.payload.capture.ImageStagingRegisterResponsePayload;
import com.lsam.NameCardManager.api.payload.capture.NameCardCaptureCreateResponsePayload;
import com.lsam.NameCardManager.api.payload.companytimeline.CompanyTimelineQueryResponsePayload;
import com.lsam.NameCardManager.api.payload.relationship.RelationshipQueryResponsePayload;
import com.lsam.NameCardManager.application.mapper.capture.CaptureImageStagingMapper;
import com.lsam.NameCardManager.application.mapper.companytimeline.CompanyTimelineQueryMapper;
import com.lsam.NameCardManager.application.mapper.relationship.RelationshipQueryMapper;
import com.lsam.NameCardManager.application.service.capture.CaptureImageStagingService;
import com.lsam.NameCardManager.application.service.companytimeline.CompanyTimelineQueryService;
import com.lsam.NameCardManager.application.service.relationship.RelationshipQueryService;
import com.lsam.NameCardManager.application.validator.capture.ImageStagingRegisterValidator;
import com.lsam.NameCardManager.application.validator.capture.NameCardCaptureCreateValidator;
import com.lsam.NameCardManager.application.validator.companytimeline.CompanyTimelineQueryValidator;
import com.lsam.NameCardManager.application.validator.relationship.RelationshipQueryValidator;
import com.lsam.NameCardManager.domain.model.capture.ImageStagingItem;
import com.lsam.NameCardManager.domain.model.capture.NameCardCaptureSession;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineItem;
import com.lsam.NameCardManager.domain.model.companytimeline.CompanyTimelineQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipQueryCriteria;
import com.lsam.NameCardManager.domain.model.relationship.RelationshipVisibilityItem;
import com.lsam.NameCardManager.domain.port.audit.NameCardManagerAuditPort;
import com.lsam.NameCardManager.domain.port.capture.ImageStagingRepository;
import com.lsam.NameCardManager.domain.port.capture.NameCardCaptureSessionRepository;
import com.lsam.NameCardManager.domain.port.companytimeline.CompanyTimelineRepository;
import com.lsam.NameCardManager.domain.port.relationship.RelationshipQueryRepository;

public final class NameCardManagerPhaseAApiPayloadSmokeRunner {

    public static void main(final String[] args) {
        final UUID actorUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        final UUID sourceNamecardId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        final UUID companyId = UUID.fromString("33333333-3333-3333-3333-333333333333");

        final FakeAuditPort auditPort = new FakeAuditPort();

        final RelationshipQueryController relationshipController =
                new RelationshipQueryController(
                        new RelationshipQueryService(
                                new RelationshipQueryValidator(),
                                new RelationshipQueryMapper(),
                                new FakeRelationshipRepository(),
                                auditPort
                        )
                );

        final CompanyTimelineQueryController companyTimelineController =
                new CompanyTimelineQueryController(
                        new CompanyTimelineQueryService(
                                new CompanyTimelineQueryValidator(),
                                new CompanyTimelineQueryMapper(),
                                new FakeCompanyTimelineRepositoryImpl(),
                                auditPort
                        )
                );

        final NameCardCaptureController captureController =
                new NameCardCaptureController(
                        new CaptureImageStagingService(
                                new NameCardCaptureCreateValidator(),
                                new ImageStagingRegisterValidator(),
                                new CaptureImageStagingMapper(),
                                new FakeCaptureSessionRepository(),
                                new FakeImageStagingRepositoryImpl(),
                                auditPort
                        )
                );

        final NameCardManagerPhaseAApiFacade facade =
                new NameCardManagerPhaseAApiFacade(
                        relationshipController,
                        companyTimelineController,
                        captureController,
                        new NameCardManagerPhaseAApiPayloadAdapter()
                );

        final RelationshipQueryRequest relationshipRequest = new RelationshipQueryRequest();
        relationshipRequest.sourceNamecardId = sourceNamecardId;
        relationshipRequest.includeUnconfirmed = Boolean.TRUE;
        relationshipRequest.includeSameCompany = Boolean.TRUE;
        relationshipRequest.includeExternalTargets = Boolean.TRUE;
        relationshipRequest.pageSize = Integer.valueOf(20);
        relationshipRequest.pageToken = null;

        final RelationshipQueryResponsePayload relationshipPayload =
                facade.relationshipQuery(actorUserId, relationshipRequest);

        final CompanyTimelineQueryRequest timelineRequest = new CompanyTimelineQueryRequest();
        timelineRequest.companyId = companyId;
        timelineRequest.includeInternalEvents = Boolean.TRUE;
        timelineRequest.includeExternalEvents = Boolean.TRUE;
        timelineRequest.includeUnconfirmed = Boolean.TRUE;
        timelineRequest.pageSize = Integer.valueOf(20);
        timelineRequest.pageToken = null;

        final CompanyTimelineQueryResponsePayload timelinePayload =
                facade.companyTimelineQuery(actorUserId, timelineRequest);

        final NameCardCaptureCreateRequest captureRequest = new NameCardCaptureCreateRequest();
        captureRequest.actorUserId = actorUserId;
        captureRequest.captureSourceType = "camera";
        captureRequest.originalFileName = "boss-card-front.jpg";
        captureRequest.mimeType = "image/jpeg";
        captureRequest.fileSizeBytes = Long.valueOf(123456L);
        captureRequest.createImageStagingRow = Boolean.TRUE;
        captureRequest.requestOcrLater = Boolean.TRUE;
        captureRequest.clientRequestId = "api-payload-smoke-001";

        final NameCardCaptureCreateResponsePayload capturePayload =
                facade.createCaptureSession(captureRequest);

        final ImageStagingRegisterRequest stagingRequest = new ImageStagingRegisterRequest();
        stagingRequest.captureSessionId = capturePayload.captureSessionId;
        stagingRequest.actorUserId = actorUserId;
        stagingRequest.stagingObjectKey = "staging/namecard/boss-card-front.jpg";
        stagingRequest.imageRoleType = "front";
        stagingRequest.pageIndex = Integer.valueOf(0);
        stagingRequest.displayOrder = Integer.valueOf(0);
        stagingRequest.widthPx = Integer.valueOf(1200);
        stagingRequest.heightPx = Integer.valueOf(800);
        stagingRequest.checksumSha256 = "smoke-sha256-value";

        final ImageStagingRegisterResponsePayload stagingPayload =
                facade.registerImageStaging(stagingRequest);

        final RelationshipQueryRequest badRelationshipRequest = new RelationshipQueryRequest();
        badRelationshipRequest.sourceNamecardId = null;
        badRelationshipRequest.includeUnconfirmed = Boolean.TRUE;
        badRelationshipRequest.includeSameCompany = Boolean.TRUE;
        badRelationshipRequest.includeExternalTargets = Boolean.TRUE;
        badRelationshipRequest.pageSize = Integer.valueOf(20);
        badRelationshipRequest.pageToken = null;

        final RelationshipQueryResponsePayload failurePayload =
                facade.relationshipQuery(actorUserId, badRelationshipRequest);

        assertCondition(relationshipPayload.success, "relationship payload must succeed");
        assertCondition(relationshipPayload.relationshipEntries.size() == 2, "relationship entries must be 2");

        assertCondition(timelinePayload.success, "timeline payload must succeed");
        assertCondition(timelinePayload.timelineEntries.size() == 2, "timeline entries must be 2");

        assertCondition(capturePayload.success, "capture payload must succeed");
        assertCondition(capturePayload.captureSessionId != null, "capture session id required");

        assertCondition(stagingPayload.success, "staging payload must succeed");
        assertCondition(stagingPayload.imageStagingId != null, "image staging id required");

        assertCondition(!failurePayload.success, "failure payload must fail");
        assertCondition("NCM_API_RELATIONSHIP_QUERY_FAILED".equals(failurePayload.errorCode), "failure error code mismatch");

        System.out.println("PAYLOAD_SMOKE_OK");
        System.out.println("RELATIONSHIP_ENTRY_COUNT=" + relationshipPayload.relationshipEntries.size());
        System.out.println("TIMELINE_ENTRY_COUNT=" + timelinePayload.timelineEntries.size());
        System.out.println("CAPTURE_SUCCESS=" + capturePayload.success);
        System.out.println("STAGING_SUCCESS=" + stagingPayload.success);
        System.out.println("FAILURE_CODE=" + failurePayload.errorCode);
        System.out.println("AUDIT_COUNT=" + auditPort.logs.size());
    }

    private static void assertCondition(final boolean condition, final String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }

    private static final class FakeAuditPort implements NameCardManagerAuditPort {
        private final List<String> logs = new ArrayList<>();

        @Override
        public void appendRelationshipQueryAudit(
                final UUID requesterUserId,
                final UUID sourceNamecardId,
                final int resultCount,
                final OffsetDateTime occurredAt
        ) {
            logs.add("relationship:" + requesterUserId + ":" + sourceNamecardId + ":" + resultCount);
        }

        @Override
        public void appendCompanyTimelineQueryAudit(
                final UUID requesterUserId,
                final UUID companyId,
                final int resultCount,
                final OffsetDateTime occurredAt
        ) {
            logs.add("companytimeline:" + requesterUserId + ":" + companyId + ":" + resultCount);
        }

        @Override
        public void appendCaptureSessionCreatedAudit(
                final UUID actorUserId,
                final UUID captureSessionId,
                final String captureStateCode,
                final OffsetDateTime occurredAt
        ) {
            logs.add("capture:" + actorUserId + ":" + captureSessionId + ":" + captureStateCode);
        }

        @Override
        public void appendImageStagingRegisteredAudit(
                final UUID actorUserId,
                final UUID captureSessionId,
                final UUID imageStagingId,
                final String stagingStateCode,
                final OffsetDateTime occurredAt
        ) {
            logs.add("staging:" + actorUserId + ":" + captureSessionId + ":" + imageStagingId + ":" + stagingStateCode);
        }
    }

    private static final class FakeRelationshipRepository implements RelationshipQueryRepository {
        @Override
        public List<RelationshipVisibilityItem> findVisibleRelationships(final RelationshipQueryCriteria criteria) {
            final List<RelationshipVisibilityItem> items = new ArrayList<>();

            final RelationshipVisibilityItem item1 = new RelationshipVisibilityItem();
            item1.relationshipVisibilityId = UUID.randomUUID();
            item1.sourceNamecardId = criteria.sourceNamecardId;
            item1.targetEntityType = "namecard";
            item1.targetNamecardId = UUID.randomUUID();
            item1.relationshipType = "client_contact";
            item1.relationshipLabel = "Client Contact";
            item1.visibilityLevel = "visible";
            item1.evidenceSource = "manual_confirmation";
            item1.displayPriority = Integer.valueOf(10);
            item1.userConfirmed = Boolean.TRUE;
            item1.relationshipStrength = "strong";
            item1.relationshipNote = "Primary client-side point of contact";
            item1.createdAt = OffsetDateTime.now();
            item1.updatedAt = item1.createdAt;
            items.add(item1);

            final RelationshipVisibilityItem item2 = new RelationshipVisibilityItem();
            item2.relationshipVisibilityId = UUID.randomUUID();
            item2.sourceNamecardId = criteria.sourceNamecardId;
            item2.targetEntityType = "external_entity";
            item2.targetExternalRef = "partner-ref-001";
            item2.relationshipType = "partner";
            item2.relationshipLabel = "Partner";
            item2.visibilityLevel = "visible";
            item2.evidenceSource = "timeline_inference";
            item2.displayPriority = Integer.valueOf(20);
            item2.userConfirmed = Boolean.TRUE;
            item2.relationshipStrength = "medium";
            item2.relationshipNote = "Linked by company activity";
            item2.createdAt = OffsetDateTime.now();
            item2.updatedAt = item2.createdAt;
            items.add(item2);

            return items;
        }

        @Override
        public String findNextPageToken(final RelationshipQueryCriteria criteria, final int currentResultSize) {
            return null;
        }
    }

    private static final class FakeCompanyTimelineRepositoryImpl implements CompanyTimelineRepository {
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

    private static final class FakeCaptureSessionRepository implements NameCardCaptureSessionRepository {
        @Override
        public NameCardCaptureSession createCaptureSession(final NameCardCaptureSession session) {
            return session;
        }
    }

    private static final class FakeImageStagingRepositoryImpl implements ImageStagingRepository {
        @Override
        public ImageStagingItem registerImageStaging(final ImageStagingItem item) {
            return item;
        }
    }
}
