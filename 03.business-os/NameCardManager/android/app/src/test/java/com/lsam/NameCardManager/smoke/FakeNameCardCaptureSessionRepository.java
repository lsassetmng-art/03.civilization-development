package com.lsam.NameCardManager.smoke;

import com.lsam.NameCardManager.domain.model.capture.NameCardCaptureSession;
import com.lsam.NameCardManager.domain.port.capture.NameCardCaptureSessionRepository;

public final class FakeNameCardCaptureSessionRepository implements NameCardCaptureSessionRepository {

    @Override
    public NameCardCaptureSession createCaptureSession(final NameCardCaptureSession session) {
        return session;
    }
}
