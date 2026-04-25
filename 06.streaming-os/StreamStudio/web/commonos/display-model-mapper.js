(function (global) {
  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function mapDashboard(dashboardResponse) {
    const summary = dashboardResponse && dashboardResponse.summary ? dashboardResponse.summary : {};
    return {
      draftProjects: Number(summary.draft_projects || 0),
      uploadsProcessing: Number(summary.uploads_processing || 0),
      approvalWaiting: Number(summary.approval_waiting || 0),
      scheduledToday: Number(summary.scheduled_today || 0)
    };
  }

  function mapProjects(projectsResponse) {
    return {
      cards: safeArray(projectsResponse && projectsResponse.items).map(function (item) {
        return {
          cardId: item.creator_project_id || 'cp_unknown',
          title: item.project_title || item.creator_project_id || 'Untitled Project',
          meta: 'Status: ' + String(item.project_status || 'unknown')
        };
      })
    };
  }

  function mapUploadQueue(uploadQueueResponse) {
    return {
      cards: safeArray(uploadQueueResponse && uploadQueueResponse.items).map(function (item) {
        return {
          cardId: item.creator_upload_job_id || 'up_unknown',
          title: item.creator_upload_job_id || 'Unknown Upload',
          meta: 'Target: ' + String(item.upload_target_type || 'unknown') + ' / Status: ' + String(item.upload_status || 'unknown')
        };
      })
    };
  }

  function describeMappingScope() {
    return 'dashboard -> dashboard_model, projects -> project_card_model, upload_queue -> upload_card_model';
  }

  global.StreamStudioDisplayModelMapper = {
    mapDashboard: mapDashboard,
    mapProjects: mapProjects,
    mapUploadQueue: mapUploadQueue,
    describeMappingScope: describeMappingScope
  };
})(window);
