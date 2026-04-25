(function (global) {
  const CommonOSBridge = {
    appName: "StreamWatch",
    preferredSurfaces: [
      "app_shell",
      "header",
      "navigation",
      "button.primary",
      "input.default",
      "search_bar",
      "list",
      "card.record",
      "panel.sync",
      "panel.conflict"
    ],
    localStreamingSurfaces: [
      "playback_surface",
      "media_control_surface",
      "watch_progress_commit",
      "tv_handoff_execution"
    ],
    getPreferredSurfaceIds() {
      return this.preferredSurfaces.slice();
    },
    getLocalStreamingSurfaceIds() {
      return this.localStreamingSurfaces.slice();
    }
  };

  global.CommonOSBridge = CommonOSBridge;
})(window);
