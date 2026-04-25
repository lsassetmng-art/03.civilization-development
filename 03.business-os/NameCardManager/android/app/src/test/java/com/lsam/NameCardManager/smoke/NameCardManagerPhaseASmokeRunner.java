package com.lsam.NameCardManager.smoke;

import java.util.UUID;

import com.lsam.NameCardManager.api.controller.capture.NameCardCaptureController;
import com.lsam.NameCardManager.api.controller.companytimeline.CompanyTimelineQueryController;
import com.lsam.NameCardManager.api.controller.relationship.RelationshipQueryController;
import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;
import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;
import com.lsam.NameCardManager.api.dto.capture.response.ImageStagingRegisterResponse;
import com.lsam.NameCardManager.api.dto.capture.response.NameCardCaptureCreateResponse;
import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryResponse;
import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryResponse;
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

public final class NameCardManagerPhaseASmokeRunner {

    public static void main(final String[] args) {
        final UUID actorUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        final UUID sourceNamecardId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        final UUID companyId = UUID.fromString("33333333-3333-3333-3333-333333333333");

        final FakeNameCardManagerAuditPort auditPort = new FakeNameCardManagerAuditPort();

        final RelationshipQueryController relationshipController =
                new RelationshipQueryController(
                        new RelationshipQueryService(
                                new RelationshipQueryValidator(),
                                new RelationshipQueryMapper(),
                                new FakeRelationshipQueryRepository(),
                                auditPort
                        )
                );

        final CompanyTimelineQueryController companyTimelineController =
                new CompanyTimelineQueryController(
                        new CompanyTimelineQueryService(
                                new CompanyTimelineQueryValidator(),
                                new CompanyTimelineQueryMapper(),
                                new FakeCompanyTimelineRepository(),
                                auditPort
                        )
                );

        final NameCardCaptureController captureController =
                new NameCardCaptureController(
                        new CaptureImageStagingService(
                                new NameCardCaptureCreateValidator(),
                                new ImageStagingRegisterValidator(),
                                new CaptureImageStagingMapper(),
                                new FakeNameCardCaptureSessionRepository(),
                                new FakeImageStagingRepository(),
                                auditPort
                        )
                );

        final RelationshipQueryRequest relationshipRequest = new RelationshipQueryRequest();
        relationshipRequest.sourceNamecardId = sourceNamecardId;
        relationshipRequest.includeUnconfirmed = Boolean.TRUE;
        relationshipRequest.includeSameCompany = Boolean.TRUE;
        relationshipRequest.includeExternalTargets = Boolean.TRUE;
        relationshipRequest.pageSize = Integer.valueOf(20);
        relationshipRequest.pageToken = null;

        final RelationshipQueryResponse relationshipResponse =
                relationshipController.query(actorUserId, relationshipRequest);

        final CompanyTimelineQueryRequest timelineRequest = new CompanyTimelineQueryRequest();
        timelineRequest.companyId = companyId;
        timelineRequest.includeInternalEvents = Boolean.TRUE;
        timelineRequest.includeExternalEvents = Boolean.TRUE;
        timelineRequest.includeUnconfirmed = Boolean.TRUE;
        timelineRequest.pageSize = Integer.valueOf(20);
        timelineRequest.pageToken = null;

        final CompanyTimelineQueryResponse timelineResponse =
                companyTimelineController.query(actorUserId, timelineRequest);

        final NameCardCaptureCreateRequest captureRequest = new NameCardCaptureCreateRequest();
        captureRequest.actorUserId = actorUserId;
        captureRequest.captureSourceType = "camera";
        captureRequest.originalFileName = "boss-card-front.jpg";
        captureRequest.mimeType = "image/jpeg";
        captureRequest.fileSizeBytes = Long.valueOf(123456L);
        captureRequest.createImageStagingRow = Boolean.TRUE;
        captureRequest.requestOcrLater = Boolean.TRUE;
        captureRequest.clientRequestId = "smoke-capture-001";

        final NameCardCaptureCreateResponse captureResponse =
                captureController.createCaptureSession(captureRequest);

        final ImageStagingRegisterRequest stagingRequest = new ImageStagingRegisterRequest();
        stagingRequest.captureSessionId = captureResponse.captureSessionId;
        stagingRequest.actorUserId = actorUserId;
        stagingRequest.stagingObjectKey = "staging/namecard/boss-card-front.jpg";
        stagingRequest.imageRoleType = "front";
        stagingRequest.pageIndex = Integer.valueOf(0);
        stagingRequest.displayOrder = Integer.valueOf(0);
        stagingRequest.widthPx = Integer.valueOf(1200);
        stagingRequest.heightPx = Integer.valueOf(800);
        stagingRequest.checksumSha256 = "smoke-sha256-value";

        final ImageStagingRegisterResponse stagingResponse =
                captureController.registerImageStaging(stagingRequest);

        assertCondition(relationshipResponse != null, "relationship response required");
        assertCondition(relationshipResponse.relationshipItems != null, "relationship items required");
        assertCondition(relationshipResponse.relationshipItems.size() == 2, "relationship items size must be 2");

        assertCondition(timelineResponse != null, "timeline response required");
        assertCondition(timelineResponse.timelineItems != null, "timeline items required");
        assertCondition(timelineResponse.timelineItems.size() == 2, "timeline items size must be 2");

        assertCondition(captureResponse != null, "capture response required");
        assertCondition(captureResponse.captureSessionId != null, "capture session id required");

        assertCondition(stagingResponse != null, "staging response required");
        assertCondition(stagingResponse.imageStagingId != null, "image staging id required");

        assertCondition(auditPort.logs.size() == 4, "audit log size must be 4");

        System.out.println("SMOKE_OK");
        System.out.println("RELATIONSHIP_ITEMS=" + relationshipResponse.relationshipItems.size());
        System.out.println("TIMELINE_ITEMS=" + timelineResponse.timelineItems.size());
        System.out.println("CAPTURE_SESSION_ID=" + captureResponse.captureSessionId);
        System.out.println("IMAGE_STAGING_ID=" + stagingResponse.imageStagingId);
        System.out.println("AUDIT_LOG_COUNT=" + auditPort.logs.size());
    }

    private static void assertCondition(final boolean condition, final String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
