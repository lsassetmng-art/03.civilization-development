const COMMON_OS_VERSION = '0.1.0';

const BASE_STYLE = `
:host {
  --co-font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --co-bg: #0b1220;
  --co-surface: #111827;
  --co-surface-muted: #1f2937;
  --co-surface-soft: #0f172a;
  --co-border: #334155;
  --co-border-strong: #475569;
  --co-text: #e5e7eb;
  --co-text-muted: #94a3b8;
  --co-text-strong: #ffffff;
  --co-primary: #3b82f6;
  --co-primary-strong: #2563eb;
  --co-danger: #ef4444;
  --co-success: #10b981;
  --co-warning: #f59e0b;
  --co-shadow: 0 12px 24px rgba(2, 6, 23, 0.28);
  --co-radius: 16px;
  --co-radius-sm: 12px;
  --co-gap: 12px;
  --co-gap-lg: 16px;
  --co-pad: 14px;
  --co-pad-lg: 20px;
  --co-input-h: 44px;
  --co-input-h-compact: 36px;
  --co-input-h-dense: 32px;
  --co-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.28);
  color: var(--co-text);
  font-family: var(--co-font-family);
  box-sizing: border-box;
}
*, *::before, *::after { box-sizing: border-box; }
button, input, select, textarea { font: inherit; }
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[role="button"]:focus-visible {
  outline: none;
  box-shadow: var(--co-focus-ring);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.field, .stack {
  display: grid;
  gap: 8px;
}
.label {
  color: var(--co-text-strong);
  font-size: 0.92rem;
  font-weight: 650;
}
.hint {
  color: var(--co-text-muted);
  font-size: 0.82rem;
}
.error {
  color: #fecaca;
  font-size: 0.82rem;
}
.input, .select, .textarea {
  width: 100%;
  border: 1px solid var(--co-border);
  background: var(--co-surface-soft);
  color: var(--co-text);
  border-radius: 14px;
  padding: 0 14px;
}
.input, .select { height: var(--co-input-h); }
.textarea {
  min-height: 108px;
  padding: 12px 14px;
  resize: vertical;
}
.input--compact, .select--compact { height: var(--co-input-h-compact); }
.input--erp_dense, .select--erp_dense { height: var(--co-input-h-dense); border-radius: 10px; padding: 0 10px; }
.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid var(--co-border);
  border-radius: var(--co-radius);
  padding: var(--co-pad-lg);
  box-shadow: var(--co-shadow);
}
.card--record { border-radius: 12px; padding: var(--co-pad); }
.card__title {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--co-text-strong);
}
.card__body { color: var(--co-text); }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  border-radius: 14px;
  padding: 0 14px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, opacity 120ms ease;
  font-weight: 700;
}
.btn:hover { transform: translateY(-1px); }
.btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.btn--primary { background: var(--co-primary); color: white; }
.btn--primary:hover { background: var(--co-primary-strong); }
.btn--secondary { background: var(--co-surface-muted); border-color: var(--co-border); color: var(--co-text-strong); }
.btn--ghost { background: transparent; border-color: var(--co-border); color: var(--co-text); }
.btn--destructive { background: rgba(239, 68, 68, 0.16); color: #fecaca; border-color: rgba(239, 68, 68, 0.4); }
.icon-only { min-width: 42px; padding: 0; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  border-radius: 999px;
  padding: 0 10px;
  border: 1px solid var(--co-border);
  background: var(--co-surface-soft);
  color: var(--co-text);
  font-size: 0.82rem;
  font-weight: 650;
}
.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.95;
}
.chip--success { color: #6ee7b7; }
.chip--warning { color: #fde68a; }
.chip--danger { color: #fca5a5; }
.chip--info { color: #93c5fd; }
.chip--muted { color: #cbd5e1; }
.panel {
  border: 1px solid var(--co-border);
  border-radius: var(--co-radius-sm);
  background: rgba(15, 23, 42, 0.72);
  padding: var(--co-pad);
  display: grid;
  gap: 10px;
}
.panel__title {
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--co-text-strong);
}
.panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.panel__meta {
  color: var(--co-text-muted);
  font-size: 0.84rem;
}
.state {
  display: grid;
  gap: 8px;
  border: 1px dashed var(--co-border-strong);
  border-radius: var(--co-radius-sm);
  padding: var(--co-pad-lg);
}
.state__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--co-text-strong);
}
.state__message { color: var(--co-text-muted); }
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background: radial-gradient(circle at top, rgba(59,130,246,0.08), rgba(11,18,32,1) 36%);
  color: var(--co-text);
}
.shell--dense { grid-template-columns: 240px minmax(0, 1fr); }
.shell__nav {
  border-right: 1px solid var(--co-border);
  background: rgba(15, 23, 42, 0.86);
  padding: 24px 18px;
  display: grid;
  gap: 16px;
}
.shell__main {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
}
.shell__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(11, 18, 32, 0.84);
  backdrop-filter: blur(14px);
}
.shell__title {
  font-size: 1.15rem;
  font-weight: 750;
  color: var(--co-text-strong);
}
.shell__subtitle {
  color: var(--co-text-muted);
  font-size: 0.88rem;
}
.shell__content {
  min-width: 0;
  padding: 24px;
  display: grid;
  gap: 16px;
  align-content: start;
}
.list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.list__item {
  border: 1px solid var(--co-border);
  border-radius: 12px;
  padding: 12px;
  background: rgba(17, 24, 39, 0.72);
}
.table-wrap {
  overflow: auto;
  border: 1px solid var(--co-border);
  border-radius: 14px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(15, 23, 42, 0.76);
}
.table th,
.table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  text-align: left;
}
.table th {
  color: var(--co-text-strong);
  font-size: 0.88rem;
}
.table td {
  color: var(--co-text);
  font-size: 0.9rem;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.toggle__control {
  width: 48px;
  height: 28px;
  border-radius: 999px;
  background: var(--co-surface-muted);
  border: 1px solid var(--co-border);
  position: relative;
  transition: background 120ms ease;
}
.toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: white;
  transition: transform 120ms ease;
}
.toggle[data-checked="true"] .toggle__control {
  background: var(--co-primary);
}
.toggle[data-checked="true"] .toggle__thumb {
  transform: translateX(20px);
}
.check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.check__box {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1px solid var(--co-border);
  background: var(--co-surface-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
}
.check[data-checked="true"] .check__box {
  background: var(--co-primary);
  border-color: var(--co-primary);
}
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.dialog-backdrop[data-open="true"] { display: flex; }
.dialog {
  width: min(560px, 100%);
  border: 1px solid var(--co-border);
  border-radius: 20px;
  background: var(--co-surface);
  padding: 20px;
  box-shadow: var(--co-shadow);
  display: grid;
  gap: 16px;
}
.dialog__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--co-text-strong);
}
.dialog__description {
  color: var(--co-text-muted);
}
.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.toast-stack {
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: grid;
  gap: 10px;
  width: min(320px, calc(100vw - 32px));
  z-index: 1000;
}
.toast {
  border: 1px solid var(--co-border);
  background: rgba(15, 23, 42, 0.96);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: var(--co-shadow);
}
.toast__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--co-text-strong);
}
.toast__message {
  color: var(--co-text-muted);
  margin-top: 4px;
  font-size: 0.84rem;
}
@media (max-width: 900px) {
  .shell { grid-template-columns: 1fr; }
  .shell__nav { border-right: none; border-bottom: 1px solid var(--co-border); }
}
`;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function jsonAttr(element, name, fallback = []) {
  const raw = element.getAttribute(name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function boolAttr(element, name) {
  return element.hasAttribute(name) && element.getAttribute(name) !== 'false';
}

function setShadowTemplate(element, html) {
  if (typeof element.attachShadow !== 'function') return;
  if (!element.shadowRoot) {
    element.attachShadow({ mode: 'open' });
  }
  element.shadowRoot.innerHTML = `<style>${BASE_STYLE}</style>${html}`;
}

const HTMLElementBase = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

class CommonOSBase extends HTMLElementBase {
  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

class COButton extends CommonOSBase {
  static get observedAttributes() {
    return ['variant', 'disabled', 'loading', 'icon-only', 'type', 'aria-label'];
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const disabled = boolAttr(this, 'disabled');
    const loading = boolAttr(this, 'loading');
    const iconOnly = boolAttr(this, 'icon-only');
    const type = this.getAttribute('type') || 'button';
    const label = this.getAttribute('aria-label') || '';

    setShadowTemplate(this, `
      <button class="btn btn--${escapeHtml(variant)} ${iconOnly ? 'icon-only' : ''}" type="${escapeHtml(type)}" ${disabled ? 'disabled' : ''} aria-busy="${loading}">
        ${loading ? '<span aria-hidden="true">⏳</span>' : ''}
        <slot></slot>
        ${iconOnly && label ? `<span class="sr-only">${escapeHtml(label)}</span>` : ''}
      </button>
    `);

    this.shadowRoot.querySelector('button')?.addEventListener('click', (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.emit('co-click');
    });
  }
}

class COCard extends CommonOSBase {
  static get observedAttributes() {
    return ['variant', 'title'];
  }

  render() {
    const variant = this.getAttribute('variant') || 'standard';
    const title = this.getAttribute('title') || '';
    setShadowTemplate(this, `
      <section class="card ${variant === 'record' ? 'card--record' : ''}">
        ${title ? `<h3 class="card__title">${escapeHtml(title)}</h3>` : '<slot name="title"></slot>'}
        <div class="card__body"><slot></slot></div>
      </section>
    `);
  }
}

class COTextField extends CommonOSBase {
  static get observedAttributes() {
    return ['label', 'placeholder', 'value', 'hint', 'error', 'type', 'name', 'variant', 'disabled', 'required'];
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(next) {
    this.setAttribute('value', next ?? '');
  }

  render() {
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const type = this.getAttribute('type') || 'text';
    const name = this.getAttribute('name') || '';
    const variant = this.getAttribute('variant') || 'default';
    const disabled = boolAttr(this, 'disabled');
    const required = boolAttr(this, 'required');
    const className = variant === 'erp_dense' ? 'input input--erp_dense' : variant === 'compact' ? 'input input--compact' : 'input';

    setShadowTemplate(this, `
      <label class="field">
        ${label ? `<span class="label">${escapeHtml(label)}</span>` : ''}
        <input class="${className}" type="${escapeHtml(type)}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${disabled ? 'disabled' : ''} ${required ? 'required' : ''} />
        ${error ? `<span class="error" role="alert">${escapeHtml(error)}</span>` : hint ? `<span class="hint">${escapeHtml(hint)}</span>` : ''}
      </label>
    `);

    const input = this.shadowRoot.querySelector('input');
    input?.addEventListener('input', () => {
      this.setAttribute('value', input.value);
      this.emit('co-input', { value: input.value });
    });
    input?.addEventListener('change', () => {
      this.emit('co-change', { value: input.value });
    });
  }
}

class COTextArea extends CommonOSBase {
  static get observedAttributes() {
    return ['label', 'placeholder', 'value', 'hint', 'error', 'name', 'disabled', 'required'];
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(next) {
    this.setAttribute('value', next ?? '');
  }

  render() {
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const name = this.getAttribute('name') || '';
    const disabled = boolAttr(this, 'disabled');
    const required = boolAttr(this, 'required');

    setShadowTemplate(this, `
      <label class="field">
        ${label ? `<span class="label">${escapeHtml(label)}</span>` : ''}
        <textarea class="textarea" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" ${disabled ? 'disabled' : ''} ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>
        ${error ? `<span class="error" role="alert">${escapeHtml(error)}</span>` : hint ? `<span class="hint">${escapeHtml(hint)}</span>` : ''}
      </label>
    `);

    const textarea = this.shadowRoot.querySelector('textarea');
    textarea?.addEventListener('input', () => {
      this.setAttribute('value', textarea.value);
      this.emit('co-input', { value: textarea.value });
    });
    textarea?.addEventListener('change', () => {
      this.emit('co-change', { value: textarea.value });
    });
  }
}

class COSelect extends CommonOSBase {
  static get observedAttributes() {
    return ['label', 'value', 'hint', 'error', 'name', 'options', 'variant', 'disabled'];
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(next) {
    this.setAttribute('value', next ?? '');
  }

  render() {
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const name = this.getAttribute('name') || '';
    const variant = this.getAttribute('variant') || 'default';
    const disabled = boolAttr(this, 'disabled');
    const options = jsonAttr(this, 'options', []);
    const className = variant === 'erp_dense' ? 'select select--erp_dense' : variant === 'compact' ? 'select select--compact' : 'select';
    const optionHtml = options.map((option) => {
      const optionValue = escapeHtml(option.value ?? option.id ?? '');
      const optionLabel = escapeHtml(option.label ?? option.name ?? optionValue);
      const selected = String(option.value ?? option.id ?? '') === value ? 'selected' : '';
      return `<option value="${optionValue}" ${selected}>${optionLabel}</option>`;
    }).join('');

    setShadowTemplate(this, `
      <label class="field">
        ${label ? `<span class="label">${escapeHtml(label)}</span>` : ''}
        <select class="${className}" name="${escapeHtml(name)}" ${disabled ? 'disabled' : ''}>${optionHtml}</select>
        ${error ? `<span class="error" role="alert">${escapeHtml(error)}</span>` : hint ? `<span class="hint">${escapeHtml(hint)}</span>` : ''}
      </label>
    `);

    const select = this.shadowRoot.querySelector('select');
    select?.addEventListener('change', () => {
      this.setAttribute('value', select.value);
      this.emit('co-change', { value: select.value });
    });
  }
}

class COCheckbox extends CommonOSBase {
  static get observedAttributes() {
    return ['label', 'checked', 'disabled'];
  }

  render() {
    const label = this.getAttribute('label') || '';
    const checked = boolAttr(this, 'checked');
    const disabled = boolAttr(this, 'disabled');
    setShadowTemplate(this, `
      <label class="check" data-checked="${checked}" aria-disabled="${disabled}">
        <button class="check__box" type="button" aria-pressed="${checked}" ${disabled ? 'disabled' : ''}>${checked ? '✓' : ''}</button>
        <span>${escapeHtml(label)}</span>
      </label>
    `);

    this.shadowRoot.querySelector('button')?.addEventListener('click', () => {
      if (disabled) return;
      const next = !boolAttr(this, 'checked');
      this.toggleAttribute('checked', next);
      this.emit('co-change', { checked: next });
    });
  }
}

class COSwitch extends CommonOSBase {
  static get observedAttributes() {
    return ['label', 'checked', 'disabled'];
  }

  render() {
    const label = this.getAttribute('label') || '';
    const checked = boolAttr(this, 'checked');
    const disabled = boolAttr(this, 'disabled');
    setShadowTemplate(this, `
      <label class="toggle" data-checked="${checked}" aria-disabled="${disabled}">
        <button class="toggle__control" type="button" role="switch" aria-checked="${checked}" ${disabled ? 'disabled' : ''}>
          <span class="toggle__thumb"></span>
        </button>
        <span>${escapeHtml(label)}</span>
      </label>
    `);

    this.shadowRoot.querySelector('button')?.addEventListener('click', () => {
      if (disabled) return;
      const next = !boolAttr(this, 'checked');
      this.toggleAttribute('checked', next);
      this.emit('co-change', { checked: next });
    });
  }
}

class COStatusChip extends CommonOSBase {
  static get observedAttributes() {
    return ['tone', 'label'];
  }

  render() {
    const tone = this.getAttribute('tone') || 'muted';
    const label = this.getAttribute('label') || this.textContent || '';
    setShadowTemplate(this, `<span class="chip chip--${escapeHtml(tone)}"><span class="chip__dot"></span><span>${escapeHtml(label.trim())}</span></span>`);
  }
}

class COStatePanel extends CommonOSBase {
  static get observedAttributes() {
    return ['state', 'title', 'message', 'action-label'];
  }

  render() {
    const state = this.getAttribute('state') || 'empty';
    const title = this.getAttribute('title') || 'State';
    const message = this.getAttribute('message') || '';
    const actionLabel = this.getAttribute('action-label') || '';
    const toneMap = {
      loading: 'info',
      empty: 'muted',
      error: 'danger',
      success: 'success'
    };

    setShadowTemplate(this, `
      <section class="state" aria-live="polite">
        <co-status-chip tone="${toneMap[state] || 'muted'}" label="${escapeHtml(state)}"></co-status-chip>
        <h3 class="state__title">${escapeHtml(title)}</h3>
        <div class="state__message">${escapeHtml(message)}</div>
        ${actionLabel ? `<div><button class="btn btn--secondary" type="button">${escapeHtml(actionLabel)}</button></div>` : ''}
      </section>
    `);

    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.emit('co-action'));
  }
}

class COQueueStatus extends CommonOSBase {
  static get observedAttributes() {
    return ['status', 'count', 'last-sync', 'message', 'retryable'];
  }

  render() {
    const status = this.getAttribute('status') || 'pending';
    const count = this.getAttribute('count') || '0';
    const lastSync = this.getAttribute('last-sync') || 'not yet synced';
    const message = this.getAttribute('message') || '';
    const toneMap = {
      offline: 'warning',
      pending: 'info',
      processing: 'info',
      retry_wait: 'warning',
      sent: 'success',
      failed: 'danger',
      conflict: 'danger'
    };
    const retryable = boolAttr(this, 'retryable');

    setShadowTemplate(this, `
      <section class="panel" aria-live="polite">
        <div class="panel__row">
          <div class="stack">
            <div class="panel__title">Queue status</div>
            <div class="panel__meta">Shared queue presentation only. Domain meaning stays outside CommonOS.</div>
          </div>
          <co-status-chip tone="${toneMap[status] || 'muted'}" label="${escapeHtml(status)}"></co-status-chip>
        </div>
        <div class="panel__row">
          <span>Items in queue</span>
          <strong>${escapeHtml(count)}</strong>
        </div>
        <div class="panel__row">
          <span>Last sync</span>
          <span class="panel__meta">${escapeHtml(lastSync)}</span>
        </div>
        ${message ? `<div class="panel__meta">${escapeHtml(message)}</div>` : ''}
        ${retryable ? `<div><button class="btn btn--secondary" type="button">Retry now</button></div>` : ''}
      </section>
    `);

    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.emit('co-retry'));
  }
}

class COSyncRetry extends CommonOSBase {
  static get observedAttributes() {
    return ['offline', 'pending', 'failed', 'conflict', 'next-retry-at'];
  }

  render() {
    const offline = boolAttr(this, 'offline');
    const pending = Number(this.getAttribute('pending') || '0');
    const failed = Number(this.getAttribute('failed') || '0');
    const conflict = Number(this.getAttribute('conflict') || '0');
    const nextRetryAt = this.getAttribute('next-retry-at') || 'not scheduled';

    setShadowTemplate(this, `
      <section class="panel" aria-live="polite">
        <div class="panel__title">Sync retry</div>
        <div class="panel__row"><span>Network</span><co-status-chip tone="${offline ? 'warning' : 'success'}" label="${offline ? 'offline' : 'online'}"></co-status-chip></div>
        <div class="panel__row"><span>Pending</span><strong>${pending}</strong></div>
        <div class="panel__row"><span>Failed</span><strong>${failed}</strong></div>
        <div class="panel__row"><span>Conflict</span><strong>${conflict}</strong></div>
        <div class="panel__meta">Next retry: ${escapeHtml(nextRetryAt)}</div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn--primary" type="button">Run sync</button>
          <button class="btn btn--ghost" type="button" data-kind="dismiss">Dismiss</button>
        </div>
      </section>
    `);

    const [runButton, dismissButton] = this.shadowRoot.querySelectorAll('button');
    runButton?.addEventListener('click', () => this.emit('co-sync-now'));
    dismissButton?.addEventListener('click', () => this.emit('co-dismiss'));
  }
}

class COConflictPanel extends CommonOSBase {
  static get observedAttributes() {
    return ['title', 'summary', 'left-label', 'right-label'];
  }

  render() {
    const title = this.getAttribute('title') || 'Conflict detected';
    const summary = this.getAttribute('summary') || 'A shared conflict panel base for domain wrappers.';
    const leftLabel = this.getAttribute('left-label') || 'Keep local';
    const rightLabel = this.getAttribute('right-label') || 'Accept remote';
    setShadowTemplate(this, `
      <section class="panel">
        <co-status-chip tone="danger" label="conflict"></co-status-chip>
        <div class="panel__title">${escapeHtml(title)}</div>
        <div class="panel__meta">${escapeHtml(summary)}</div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn--secondary" type="button" data-decision="local">${escapeHtml(leftLabel)}</button>
          <button class="btn btn--primary" type="button" data-decision="remote">${escapeHtml(rightLabel)}</button>
        </div>
      </section>
    `);

    this.shadowRoot.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => this.emit('co-conflict-decision', { decision: button.dataset.decision }));
    });
  }
}

class COList extends CommonOSBase {
  render() {
    setShadowTemplate(this, `<div class="list"><slot></slot></div>`);
  }
}

class COListItem extends CommonOSBase {
  render() {
    setShadowTemplate(this, `<div class="list__item"><slot></slot></div>`);
  }
}

class COTable extends CommonOSBase {
  render() {
    setShadowTemplate(this, `<div class="table-wrap"><table class="table"><slot></slot></table></div>`);
  }
}

class CODialog extends CommonOSBase {
  static get observedAttributes() {
    return ['open', 'title', 'description', 'confirm-label', 'cancel-label', 'destructive'];
  }

  render() {
    const open = boolAttr(this, 'open');
    const title = this.getAttribute('title') || 'Dialog';
    const description = this.getAttribute('description') || '';
    const confirmLabel = this.getAttribute('confirm-label') || 'Confirm';
    const cancelLabel = this.getAttribute('cancel-label') || 'Cancel';
    const destructive = boolAttr(this, 'destructive');

    setShadowTemplate(this, `
      <div class="dialog-backdrop" data-open="${open}" role="presentation">
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <div>
            <h3 id="dialog-title" class="dialog__title">${escapeHtml(title)}</h3>
            ${description ? `<div class="dialog__description">${escapeHtml(description)}</div>` : ''}
          </div>
          <div><slot></slot></div>
          <div class="dialog__actions">
            <button class="btn btn--ghost" type="button" data-action="cancel">${escapeHtml(cancelLabel)}</button>
            <button class="btn ${destructive ? 'btn--destructive' : 'btn--primary'}" type="button" data-action="confirm">${escapeHtml(confirmLabel)}</button>
          </div>
        </section>
      </div>
    `);

    this.shadowRoot.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'cancel') {
          this.removeAttribute('open');
        }
        if (action === 'confirm') {
          this.removeAttribute('open');
        }
        this.emit(`co-${action}`);
      });
    });
  }
}

class COToastStack extends CommonOSBase {
  static get observedAttributes() {
    return ['items'];
  }

  render() {
    const items = jsonAttr(this, 'items', []);
    const html = items.map((item) => `
      <section class="toast">
        <div class="toast__title">${escapeHtml(item.title ?? 'Notice')}</div>
        <div class="toast__message">${escapeHtml(item.message ?? '')}</div>
      </section>
    `).join('');
    setShadowTemplate(this, `<div class="toast-stack" aria-live="polite">${html}</div>`);
  }
}

class COAppShell extends CommonOSBase {
  static get observedAttributes() {
    return ['title', 'subtitle', 'variant'];
  }

  render() {
    const title = this.getAttribute('title') || 'CommonOS Shell';
    const subtitle = this.getAttribute('subtitle') || 'Shared shell foundation';
    const variant = this.getAttribute('variant') || 'default';
    setShadowTemplate(this, `
      <section class="shell ${variant === 'dense' ? 'shell--dense' : ''}">
        <aside class="shell__nav">
          <div>
            <div class="shell__title">${escapeHtml(title)}</div>
            <div class="shell__subtitle">${escapeHtml(subtitle)}</div>
          </div>
          <slot name="nav"></slot>
        </aside>
        <div class="shell__main">
          <header class="shell__header">
            <div>
              <div class="shell__title">${escapeHtml(title)}</div>
              <div class="shell__subtitle">${escapeHtml(subtitle)}</div>
            </div>
            <div><slot name="header-actions"></slot></div>
          </header>
          <main class="shell__content"><slot></slot></main>
        </div>
      </section>
    `);
  }
}

const REGISTRY = {
  'co-button': COButton,
  'co-card': COCard,
  'co-text-field': COTextField,
  'co-text-area': COTextArea,
  'co-select': COSelect,
  'co-checkbox': COCheckbox,
  'co-switch': COSwitch,
  'co-status-chip': COStatusChip,
  'co-state-panel': COStatePanel,
  'co-queue-status': COQueueStatus,
  'co-sync-retry': COSyncRetry,
  'co-conflict-panel': COConflictPanel,
  'co-list': COList,
  'co-list-item': COListItem,
  'co-table': COTable,
  'co-dialog': CODialog,
  'co-toast-stack': COToastStack,
  'co-app-shell': COAppShell
};

export function registerCommonOS() {
  if (typeof customElements === 'undefined') return;
  Object.entries(REGISTRY).forEach(([tag, klass]) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, klass);
    }
  });
}

export function getCommonOSVersion() {
  return COMMON_OS_VERSION;
}

export function createToastItems(items = []) {
  return JSON.stringify(items);
}

registerCommonOS();
