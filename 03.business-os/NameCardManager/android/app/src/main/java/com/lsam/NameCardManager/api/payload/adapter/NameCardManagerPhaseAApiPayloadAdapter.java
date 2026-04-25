package com.lsam.NameCardManager.api.payload.adapter;

import java.util.ArrayList;
import java.util.List;

import com.lsam.NameCardManager.api.dto.capture.response.ImageStagingRegisterResponse;
import com.lsam.NameCardManager.api.dto.capture.response.NameCardCaptureCreateResponse;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryItemResponse;
import com.lsam.NameCardManager.api.dto.companytimeline.response.CompanyTimelineQueryResponse;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryItemResponse;
import com.lsam.NameCardManager.api.dto.relationship.response.RelationshipQueryResponse;
import com.lsam.NameCardManager.api.payload.capture.ImageStagingRegisterResponsePayload;
import com.lsam.NameCardManager.api.payload.capture.NameCardCaptureCreateResponsePayload;
import com.lsam.NameCardManager.api.payload.companytimeline.CompanyTimelineEntryPayload;
import com.lsam.NameCardManager.api.payload.companytimeline.CompanyTimelineQueryResponsePayload;
import com.lsam.NameCardManager.api.payload.relationship.RelationshipEntryPayload;
import com.lsam.NameCardManager.api.payload.relationship.RelationshipQueryResponsePayload;

public final class NameCardManagerPhaseAApiPayloadAdapter {

    public RelationshipQueryResponsePayload adaptRelationshipQuerySuccess(final RelationshipQueryResponse response) {
        final RelationshipQueryResponsePayload payload = new RelationshipQueryResponsePayload();
        payload.success = true;
        payload.relationshipEntries = mapRelationshipEntries(response == null ? null : response.relationshipItems);
        payload.errorCode = null;
        payload.errorMessage = null;
        return payload;
    }

    public RelationshipQueryResponsePayload adaptRelationshipQueryFailure(
            final String errorCode,
            final String errorMessage
    ) {
        final RelationshipQueryResponsePayload payload = new RelationshipQueryResponsePayload();
        payload.success = false;
        payload.relationshipEntries = new ArrayList<>();
        payload.errorCode = errorCode;
        payload.errorMessage = errorMessage;
        return payload;
    }

    public CompanyTimelineQueryResponsePayload adaptCompanyTimelineSuccess(final CompanyTimelineQueryResponse response) {
        final CompanyTimelineQueryResponsePayload payload = new CompanyTimelineQueryResponsePayload();
        payload.success = true;
        payload.timelineEntries = mapTimelineEntries(response == null ? null : response.timelineItems);
        payload.errorCode = null;
        payload.errorMessage = null;
        return payload;
    }

    public CompanyTimelineQueryResponsePayload adaptCompanyTimelineFailure(
            final String errorCode,
            final String errorMessage
    ) {
        final CompanyTimelineQueryResponsePayload payload = new CompanyTimelineQueryResponsePayload();
        payload.success = false;
        payload.timelineEntries = new ArrayList<>();
        payload.errorCode = errorCode;
        payload.errorMessage = errorMessage;
        return payload;
    }

    public NameCardCaptureCreateResponsePayload adaptCaptureCreateSuccess(final NameCardCaptureCreateResponse response) {
        final NameCardCaptureCreateResponsePayload payload = new NameCardCaptureCreateResponsePayload();
        payload.success = true;
        if (response != null) {
            payload.captureSessionId = response.captureSessionId;
            payload.captureStateCode = response.captureStateCode;
            payload.imageStagingCreated = response.imageStagingCreated;
            payload.uploadInstruction = response.uploadInstruction;
            payload.storageScope = response.storageScope;
            payload.createdAt = response.createdAt;
        }
        payload.errorCode = null;
        payload.errorMessage = null;
        return payload;
    }

    public NameCardCaptureCreateResponsePayload adaptCaptureCreateFailure(
            final String errorCode,
            final String errorMessage
    ) {
        final NameCardCaptureCreateResponsePayload payload = new NameCardCaptureCreateResponsePayload();
        payload.success = false;
        payload.errorCode = errorCode;
        payload.errorMessage = errorMessage;
        return payload;
    }

    public ImageStagingRegisterResponsePayload adaptImageStagingSuccess(final ImageStagingRegisterResponse response) {
        final ImageStagingRegisterResponsePayload payload = new ImageStagingRegisterResponsePayload();
        payload.success = true;
        if (response != null) {
            payload.imageStagingId = response.imageStagingId;
            payload.captureSessionId = response.captureSessionId;
            payload.stagingStateCode = response.stagingStateCode;
            payload.imageRoleType = response.imageRoleType;
            payload.pageIndex = response.pageIndex;
            payload.registeredAt = response.registeredAt;
        }
        payload.errorCode = null;
        payload.errorMessage = null;
        return payload;
    }

    public ImageStagingRegisterResponsePayload adaptImageStagingFailure(
            final String errorCode,
            final String errorMessage
    ) {
        final ImageStagingRegisterResponsePayload payload = new ImageStagingRegisterResponsePayload();
        payload.success = false;
        payload.errorCode = errorCode;
        payload.errorMessage = errorMessage;
        return payload;
    }

    private List<RelationshipEntryPayload> mapRelationshipEntries(final List<RelationshipQueryItemResponse> items) {
        final List<RelationshipEntryPayload> out = new ArrayList<>();
        if (items == null) {
            return out;
        }
        for (RelationshipQueryItemResponse item : items) {
            final RelationshipEntryPayload payload = new RelationshipEntryPayload();
            payload.relationshipVisibilityId = item.relationshipVisibilityId;
            payload.sourceNamecardId = item.sourceNamecardId;
            payload.targetEntityType = item.targetEntityType;
            payload.targetNamecardId = item.targetNamecardId;
            payload.targetExternalRef = item.targetExternalRef;
            payload.relationshipType = item.relationshipType;
            payload.relationshipLabel = item.relationshipLabel;
            payload.visibilityLevel = item.visibilityLevel;
            payload.evidenceSource = item.evidenceSource;
            payload.displayPriority = item.displayPriority;
            payload.userConfirmed = item.userConfirmed;
            payload.relationshipStrength = item.relationshipStrength;
            payload.relationshipNote = item.relationshipNote;
            payload.createdAt = item.createdAt;
            payload.updatedAt = item.updatedAt;
            out.add(payload);
        }
        return out;
    }

    private List<CompanyTimelineEntryPayload> mapTimelineEntries(final List<CompanyTimelineQueryItemResponse> items) {
        final List<CompanyTimelineEntryPayload> out = new ArrayList<>();
        if (items == null) {
            return out;
        }
        for (CompanyTimelineQueryItemResponse item : items) {
            final CompanyTimelineEntryPayload payload = new CompanyTimelineEntryPayload();
            payload.companyTimelineItemId = item.companyTimelineItemId;
            payload.companyId = item.companyId;
            payload.relatedNamecardId = item.relatedNamecardId;
            payload.eventTypeCode = item.eventTypeCode;
            payload.eventTitle = item.eventTitle;
            payload.eventSummary = item.eventSummary;
            payload.evidenceSource = item.evidenceSource;
            payload.visibilityLevel = item.visibilityLevel;
            payload.userConfirmed = item.userConfirmed;
            payload.occurredAt = item.occurredAt;
            payload.recordedAt = item.recordedAt;
            payload.updatedAt = item.updatedAt;
            out.add(payload);
        }
        return out;
    }
}
