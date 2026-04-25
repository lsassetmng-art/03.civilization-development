package com.lsam.NameCardManager.domain.port.capture;

import com.lsam.NameCardManager.domain.model.capture.NameCardCaptureSession;

public interface NameCardCaptureSessionRepository {
    NameCardCaptureSession createCaptureSession(NameCardCaptureSession session);
}
