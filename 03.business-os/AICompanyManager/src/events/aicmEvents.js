window.AICM_EVENTS = {
  create: function (type, message, detail) {
    return {
      id: "evt-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
      type: type,
      message: message,
      detail: detail || "",
      created_at: new Date().toISOString()
    };
  },

  add: function (state, type, message, detail) {
    var next = state.events.slice();
    next.unshift(window.AICM_EVENTS.create(type, message, detail));
    state.events = next.slice(0, 30);
    return state;
  }
};
