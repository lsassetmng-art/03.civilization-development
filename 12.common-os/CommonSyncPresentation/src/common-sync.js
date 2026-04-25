export function renderSyncPanel(target, model = {}) {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) {
    throw new Error('CommonSyncPresentation target not found');
  }
  const queueCount = Number(model.queueCount || 0);
  const retryCount = Number(model.retryCount || 0);
  const conflictCount = Number(model.conflictCount || 0);
  const lastSyncAt = model.lastSyncAt || 'not yet';
  root.innerHTML = `
    <style>
      .sync-wrap{display:grid;gap:12px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .sync-card{border:1px solid #334155;border-radius:16px;padding:16px;background:#111827;color:#e5e7eb}
      .sync-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .sync-kpi{border:1px solid #334155;border-radius:14px;padding:14px;background:#0f172a}
      .sync-num{font-size:1.5rem;font-weight:800}
      .sync-label{font-size:.85rem;color:#94a3b8}
      @media (max-width: 700px){.sync-grid{grid-template-columns:1fr}}
    </style>
    <div class="sync-wrap">
      <div class="sync-card">
        <strong>Sync overview</strong>
        <div style="margin-top:8px;color:#94a3b8;">Last sync: ${lastSyncAt}</div>
      </div>
      <div class="sync-grid">
        <div class="sync-kpi"><div class="sync-num">${queueCount}</div><div class="sync-label">Queued</div></div>
        <div class="sync-kpi"><div class="sync-num">${retryCount}</div><div class="sync-label">Retry</div></div>
        <div class="sync-kpi"><div class="sync-num">${conflictCount}</div><div class="sync-label">Conflict</div></div>
      </div>
    </div>
  `;
}
