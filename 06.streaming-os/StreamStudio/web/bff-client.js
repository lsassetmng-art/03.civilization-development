(function (global) {
  const routeCatalog = {
    dashboard: { method: 'GET', path: '/api/v1/streamstudio/dashboard' },
    projects: { method: 'GET', path: '/api/v1/streamstudio/projects' },
    upload_queue: { method: 'GET', path: '/api/v1/streamstudio/upload-queue' },
    project_create: { method: 'POST', path: '/api/v1/streamstudio/project/create' },
    upload_create: { method: 'POST', path: '/api/v1/streamstudio/upload/create' },
    approval_request: { method: 'POST', path: '/api/v1/streamstudio/approval/request' },
    publish_request: { method: 'POST', path: '/api/v1/streamstudio/publish/request' }
  };

  const fallbackData = {
    dashboard: {
      ok: true,
      summary: {
        draft_projects: 3,
        uploads_processing: 1,
        approval_waiting: 2,
        scheduled_today: 1
      }
    },
    projects: {
      ok: true,
      items: [
        { creator_project_id: 'cp_001', project_title: 'Spring Launch Stream', project_status: 'project_draft' },
        { creator_project_id: 'cp_002', project_title: 'Creator Interview Archive', project_status: 'project_publish_ready' }
      ]
    },
    upload_queue: {
      ok: true,
      items: [
        { creator_upload_job_id: 'up_001', upload_target_type: 'project_asset', upload_status: 'processing' }
      ]
    }
  };

  async function request(routeKey, body) {
    const route = routeCatalog[routeKey];
    if (!route) {
      throw new Error('Unknown route key: ' + routeKey);
    }

    try {
      const response = await fetch(route.path, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
        body: route.method === 'GET' ? undefined : JSON.stringify(body || {})
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      return await response.json();
    } catch (error) {
      if (Object.prototype.hasOwnProperty.call(fallbackData, routeKey)) {
        return fallbackData[routeKey];
      }
      return { ok: false, error: String(error) };
    }
  }

  global.StreamStudioBffClient = {
    routeCatalog,
    loadDashboard() {
      return request('dashboard');
    },
    loadProjects() {
      return request('projects');
    },
    loadUploadQueue() {
      return request('upload_queue');
    },
    createProject(payload) {
      return request('project_create', payload);
    },
    createUpload(payload) {
      return request('upload_create', payload);
    },
    requestApproval(payload) {
      return request('approval_request', payload);
    },
    requestPublish(payload) {
      return request('publish_request', payload);
    }
  };
})(window);
