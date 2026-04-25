export function renderCommonShell(target, options = {}) {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) {
    throw new Error('CommonShell target not found');
  }
  const title = options.title || 'CommonOS';
  const subtitle = options.subtitle || 'shared shell';
  const navItems = Array.isArray(options.navItems) ? options.navItems : [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'list', label: 'List' },
    { key: 'detail', label: 'Detail' },
    { key: 'settings', label: 'Settings' }
  ];
  const activeKey = options.activeKey || navItems[0]?.key || '';
  root.innerHTML = `
    <style>
      .co-shell{display:grid;grid-template-columns:260px 1fr;min-height:100vh;background:#0b1220;color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .co-side{border-right:1px solid #334155;padding:20px;background:#111827}
      .co-brand{font-size:1.1rem;font-weight:800;margin-bottom:6px}
      .co-sub{font-size:.85rem;color:#94a3b8;margin-bottom:18px}
      .co-nav{display:grid;gap:8px}
      .co-nav button{height:40px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#e5e7eb;text-align:left;padding:0 12px;cursor:pointer}
      .co-nav button[data-active="true"]{background:#2563eb;border-color:#3b82f6;color:#fff}
      .co-main{display:grid;grid-template-rows:auto 1fr}
      .co-top{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #334155;background:#111827;position:sticky;top:0}
      .co-content{padding:20px;display:grid;gap:16px}
      .co-slot{border:1px dashed #475569;border-radius:16px;padding:20px;background:#0f172a;color:#cbd5e1}
      @media (max-width: 900px){.co-shell{grid-template-columns:1fr}.co-side{border-right:none;border-bottom:1px solid #334155}}
    </style>
    <div class="co-shell">
      <aside class="co-side">
        <div class="co-brand">${title}</div>
        <div class="co-sub">${subtitle}</div>
        <nav class="co-nav">
          ${navItems.map((item)=>`<button data-key="${item.key}" data-active="${item.key===activeKey}">${item.label}</button>`).join('')}
        </nav>
      </aside>
      <section class="co-main">
        <header class="co-top">
          <strong>${options.headerTitle || 'Shared App Shell'}</strong>
          <span>${options.headerMeta || 'CommonOS Phase 1'}</span>
        </header>
        <main class="co-content">
          <div class="co-slot" id="co-shell-slot"></div>
        </main>
      </section>
    </div>
  `;
  return root.querySelector('#co-shell-slot');
}
