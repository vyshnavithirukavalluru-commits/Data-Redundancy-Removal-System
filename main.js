/**
 * main.js
 * Application bootstrap — runs once the DOM is fully loaded.
 *
 * Responsibilities:
 *   1. Initialise the stats display.
 *   2. Render the (empty) database table.
 *   3. Render the (empty) audit log.
 *   4. Wire up keyboard shortcut (Enter on form fields → validate).
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Initial render ────────────────────────────────────
  Stats.update();
  DatabaseView.render();
  AuditLog.render();

  // ── Keyboard convenience: Enter key submits the add form ──
  const formFields = ['f-name', 'f-email', 'f-phone', 'f-notes'];
  formFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') FormHandler.validateAndAdd();
      });
    }
  });

  console.info(
    '%c Data Redundancy Removal System %c v1.0 ',
    'background:#185FA5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:600;',
    'background:#3B6D11;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;'
  );
});
