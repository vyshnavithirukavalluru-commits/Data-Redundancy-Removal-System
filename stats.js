/**
 * stats.js
 * Manages the four summary stat cards at the top of the page.
 *
 * Reads counts from Store and updates the DOM.
 */

const Stats = (() => {

  /**
   * Refreshes all four stat card values from the current Store state.
   */
  function update() {
    const total   = Store.count() + Store.blockedCount();
    const unique  = Store.count();
    const blocked = Store.blockedCount();
    const fp      = Store.fpCount();

    document.getElementById('s-total').textContent  = total;
    document.getElementById('s-unique').textContent  = unique;
    document.getElementById('s-dupes').textContent   = blocked;
    document.getElementById('s-fp').textContent      = fp;
  }

  return { update };
})();
