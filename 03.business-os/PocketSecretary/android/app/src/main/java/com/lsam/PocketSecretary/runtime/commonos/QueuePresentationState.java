package com.lsam.PocketSecretary.runtime.commonos;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class QueuePresentationState {
    private final String presentationOwner;
    private final String businessMeaningOwner;
    private final List<String> states;

    public QueuePresentationState(
            final String presentationOwner,
            final String businessMeaningOwner,
            final List<String> states
    ) {
        this.presentationOwner = presentationOwner;
        this.businessMeaningOwner = businessMeaningOwner;
        this.states = new ArrayList<>(states);
    }

    public String getPresentationOwner() {
        return presentationOwner;
    }

    public String getBusinessMeaningOwner() {
        return businessMeaningOwner;
    }

    public List<String> getStates() {
        return Collections.unmodifiableList(states);
    }
}
