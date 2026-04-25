package com.lsam.NameCardManager.api.facade;

import java.util.UUID;

import com.lsam.NameCardManager.api.controller.capture.NameCardCaptureController;
import com.lsam.NameCardManager.api.controller.companytimeline.CompanyTimelineQueryController;
import com.lsam.NameCardManager.api.controller.relationship.RelationshipQueryController;
import com.lsam.NameCardManager.api.dto.capture.request.ImageStagingRegisterRequest;
import com.lsam.NameCardManager.api.dto.capture.request.NameCardCaptureCreateRequest;
import com.lsam.NameCardManager.api.dto.companytimeline.request.CompanyTimelineQueryRequest;
import com.lsam.NameCardManager.api.dto.relationship.request.RelationshipQueryRequest;
import com.lsam.NameCardManager.api.payload.adapter.NameCardManagerPhaseAApiPayloadAdapter;
import com.lsam.NameCardManager.api.payload.capture.ImageStagingRegisterResponsePayload;
import com.lsam.NameCardManager.api.payload.capture.NameCardCaptureCreateResponsePayload;
import com.lsam.NameCardManager.api.payload.companytimeline.CompanyTimelineQueryResponsePayload;
import com.lsam.NameCardManager.api.payload.relationship.RelationshipQueryResponsePayload;

public final class NameCardManagerPhaseAApiFacade {

    private final RelationshipQueryController relationshipQueryController;
    private final CompanyTimelineQueryController companyTimelineQueryController;
    private final NameCardCaptureController nameCardCaptureController;
    private final NameCardManagerPhaseAApiPayloadAdapter payloadAdapter;

    public NameCardManagerPhaseAApiFacade(
            final RelationshipQueryController relationshipQueryController,
            final CompanyTimelineQueryController companyTimelineQueryController,
            final NameCardCaptureController nameCardCaptureController,
            final NameCardManagerPhaseAApiPayloadAdapter payloadAdapter
    ) {
        this.relationshipQueryController = relationshipQueryController;
        this.companyTimelineQueryController = companyTimelineQueryController;
        this.nameCardCaptureController = nameCardCaptureController;
        this.payloadAdapter = payloadAdapter;
    }

    public RelationshipQueryResponsePayload relationshipQuery(
            final UUID requesterUserId,
            final RelationshipQueryRequest request
    ) {
        try {
            return payloadAdapter.adaptRelationshipQuerySuccess(
                    relationshipQueryController.query(requesterUserId, request)
            );
        } catch (RuntimeException e) {
            return payloadAdapter.adaptRelationshipQueryFailure(
                    "NCM_API_RELATIONSHIP_QUERY_FAILED",
                    safeMessage(e)
            );
        }
    }

    public CompanyTimelineQueryResponsePayload companyTimelineQuery(
            final UUID requesterUserId,
            final CompanyTimelineQueryRequest request
    ) {
        try {
            return payloadAdapter.adaptCompanyTimelineSuccess(
                    companyTimelineQueryController.query(requesterUserId, request)
            );
        } catch (RuntimeException e) {
            return payloadAdapter.adaptCompanyTimelineFailure(
                    "NCM_API_COMPANY_TIMELINE_QUERY_FAILED",
                    safeMessage(e)
            );
        }
    }

    public NameCardCaptureCreateResponsePayload createCaptureSession(
            final NameCardCaptureCreateRequest request
    ) {
        try {
            return payloadAdapter.adaptCaptureCreateSuccess(
                    nameCardCaptureController.createCaptureSession(request)
            );
        } catch (RuntimeException e) {
            return payloadAdapter.adaptCaptureCreateFailure(
                    "NCM_API_CAPTURE_CREATE_FAILED",
                    safeMessage(e)
            );
        }
    }

    public ImageStagingRegisterResponsePayload registerImageStaging(
            final ImageStagingRegisterRequest request
    ) {
        try {
            return payloadAdapter.adaptImageStagingSuccess(
                    nameCardCaptureController.registerImageStaging(request)
            );
        } catch (RuntimeException e) {
            return payloadAdapter.adaptImageStagingFailure(
                    "NCM_API_IMAGE_STAGING_REGISTER_FAILED",
                    safeMessage(e)
            );
        }
    }

    private String safeMessage(final RuntimeException e) {
        final String message = e.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return "Unhandled runtime exception";
        }
        return message;
    }
}
