/**
 * databaseView.js
 * Renders the records table in the Database tab, and handles
 * per-row deletion and the "Clear All" action.
 */

const DatabaseView = (() => {

  /**
   * Re-renders the database table using the current search/filter values.
   * Called whenever the store changes or the user types in the search box.
   */
  function render() {
    const query    = document.getElementById('db-search').value;
    const category = document.getElementById('db-filter').value;
    const rows     = Store.getAll({ query, category });
    const tbody    = document.getElementById('db-body');

    if (!rows.length) {
      const msg = Store.count()
        ? 'No records match your search.'
        : 'No records yet. Add your first entry.';

      tbody.innerHTML = `
        <tr><td colspan="8">
          <div class="empty-state">
            <i class="ti ti-database-off" aria-hidden="true"></i>
            <p>${msg}</p>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td style="color:var(--color-text-hint);font-size:12px;">${r.id}</td>
        <td style="font-weight:500;">${Helpers.escapeHTML(r.name)}</td>
        <td style="color:var(--color-text-muted);">${Helpers.escapeHTML(r.email)}</td>
        <td style="color:var(--color-text-muted);">${Helpers.escapeHTML(r.phone || '—')}</td>
        <td>${Helpers.escapeHTML(r.category)}</td>
        <td>${_statusPill(r.status)}</td>
        <td style="color:var(--color-text-hint);font-size:12px;">${r.time}</td>
        <td>
          <button
            class="action-btn"
            onclick="DatabaseView.deleteRecord(${r.id})"
            title="Delete this record"
            aria-label="Delete record for ${Helpers.escapeHTML(r.name)}"
          >
            <i class="ti ti-trash" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Deletes a single record after user confirmation.
   * @param {number} id
   */
  function deleteRecord(id) {
    const record = Store.getRaw().find(r => r.id === id);
    if (!record) return;

    if (!confirm(`Delete record for "${record.name}"?\nThis action cannot be undone.`)) return;

    Store.remove(id);
    AuditLog.append('DEL', `Deleted: ${record.name} <${record.email}>`);
    Stats.update();
    render();
  }

  /**
   * Clears the entire database after confirmation.
   */
  function clearAll() {
    const total = Store.count();
    if (!total) return;

    if (!confirm(`This will permanently delete all ${total} records.\nAre you sure?`)) return;

    AuditLog.append('DEL', `Cleared entire database — ${total} record(s) removed.`);
    Store.clear();
    Stats.update();
    render();
  }

  // ── Private helpers ───────────────────────────────────

  function _statusPill(status) {
    const map = {
      unique: '<span class="pill unique">Unique</span>',
      fp:     '<span class="pill fp">False Positive</span>'
    };
    return map[status] || `<span class="pill">${Helpers.escapeHTML(status)}</span>`;
  }

  return { render, deleteRecord, clearAll };
})();
