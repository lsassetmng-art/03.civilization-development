window.CCW_APP_STATE = {
  value: {
    filter: "all",
    selectedWorker: null,
    selectedDuration: 30,
    quote: null,
    activeContract: null,
    remainingSeconds: 0,
    timerId: null,
    messageCount: 0
  },

  set(patch) {
    this.value = {
      ...this.value,
      ...patch
    };
    return this.value;
  },

  get() {
    return this.value;
  }
};
