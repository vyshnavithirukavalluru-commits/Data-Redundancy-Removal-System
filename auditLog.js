/**
 * auditLog.js
 * Maintains and renders the timestamped audit trail of all actions.
 *
 * Stores up to MAX_ENTRIES log entries in memory (newest first).
 * Renders into #audit-log.
 */

const AuditLog = (() => {

  const MAX_ENTRIES = 200;

  /** @type {{ type: string, msg: string, time: string }[]} */
  let _entries = [];

  /**
   * Appends a new entry to the log and re-renders.
   *
   * @param {'ADD'|'SKIP'|'FP'|'DEL'} type - Action type (controls badge colour).
   * @param {string} msg                    - Human-readable description.
   */
  function append(type, msg) {
    _entries.unshift({ type, msg, time: Helpers.currentTime() });
    if (_entries.length > MAX_ENTRIES) _entries.pop();
    render();
  }

  /**
   * Renders all log entries into the #audit-log container.
   */
  function render() {
    const el = document.getElementById('audit-log');

    if (!_entries.length) {
      el.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-notes" aria-hidden="true"></i>
          <p>No activity yet.</p>
        </div>`;
      return;
    }

    el.innerHTML = _entries.map(entry => `
      <div class="log-item">
        <span class="log-time">${Helpers.escapeHTML(entry.time)}</span>
        <span class="log-msg">${Helpers.escapeHTML(entry.msg)}</span>
        <span class="log-type ${entry.type}" aria-label="Action: ${entry.type}">${entry.type}</span>
      </div>
    `).join('');
  }

  /**
   * Returns a copy of all log entries (useful for export).
   * @returns {Array}
   */
  function getAll() { return [..._entries]; }

  return { append, render, getAll };
})();
