window.AICM_STATE = (function () {
  var state = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function buildInitialState() {
    return {
      company: clone(window.AICM_MOCK_DATA.company),
      roles: clone(window.AICM_MOCK_DATA.roles),
      reviews: clone(window.AICM_MOCK_DATA.reviews),
      deliveries: clone(window.AICM_MOCK_DATA.deliveries),
      queue: window.AICM_QUEUE ? window.AICM_QUEUE.load() : clone(window.AICM_MOCK_DATA.queue),
      events: clone(window.AICM_MOCK_DATA.events),
      syncStatus: "offline-first ready",
      currentProject: {
        project_id: "mock-project-001",
        project_status: "draft"
      },
      currentPolicy: null,
      currentPipeline: null
    };
  }

  return {
    get: function () {
      if (!state) {
        state = buildInitialState();
      }
      return state;
    },

    set: function (nextState) {
      state = nextState;
      return state;
    },

    update: function (fn) {
      state = fn(window.AICM_STATE.get());
      return state;
    },

    reset: function () {
      state = buildInitialState();
      return state;
    }
  };
})();
