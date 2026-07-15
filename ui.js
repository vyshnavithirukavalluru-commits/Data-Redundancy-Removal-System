/**
 * ui.js
 * General UI controller: tab switching and shared UI utilities.
 */

const UI = (() => {

  /**
   * Switches the active tab panel.
   *
   * @param {string}      tabId   - The ID suffix used in "tab-{tabId}".
   * @param {HTMLElement} tabBtn  - The button element that was clicked.
   */
  function switchTab(tabId, tabBtn) {
    // Deactivate all tab buttons
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    // Hide all panels
    document.querySelectorAll('.panel').forEach(p => {
      p.classList.remove('active');
    });

    // Activate the selected tab + panel
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // Re-render the database table whenever that tab is opened
    if (tabId === 'db') DatabaseView.render();
  }

  return { switchTab };
})();
