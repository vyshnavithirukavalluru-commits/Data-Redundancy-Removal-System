/**
 * store.js
 * Central in-memory data store for the application.
 *
 * Holds all database records, counters, and provides
 * CRUD operations. Acts as the single source of truth.
 */

const Store = (() => {

  // ── Private state ─────────────────────────────────────
  let _records      = [];   // Array of record objects
  let _nextId       = 1;    // Auto-incrementing primary key
  let _blockedCount = 0;    // Total duplicates blocked
  let _fpCount      = 0;    // Total false positives detected

  // ── Record structure ──────────────────────────────────
  /**
   * @typedef {Object} Record
   * @property {number} id
   * @property {string} name
   * @property {string} email
   * @property {string} phone
   * @property {string} category
   * @property {string} notes
   * @property {string} status    - 'unique' | 'fp'
   * @property {string} time      - Human-readable timestamp
   */

  // ── Public API ────────────────────────────────────────

  /**
   * Inserts a new validated record into the store.
   * @param {Omit<Record,'id'|'time'>} entry
   * @returns {Record} The stored record with id and time assigned.
   */
  function insert(entry) {
    const record = {
      ...entry,
      id:   _nextId++,
      time: Helpers.currentTime()
    };
    _records.push(record);
    return record;
  }

  /**
   * Removes a record by its id.
   * @param {number} id
   * @returns {Record|null} The removed record, or null if not found.
   */
  function remove(id) {
    const idx = _records.findIndex(r => r.id === id);
    if (idx === -1) return null;
    const [removed] = _records.splice(idx, 1);
    return removed;
  }

  /**
   * Returns all records, optionally filtered.
   * @param {{ query?: string, category?: string }} [filters]
   * @returns {Record[]}
   */
  function getAll({ query = '', category = '' } = {}) {
    const q = Helpers.normalize(query);
    return _records.filter(r => {
      if (category && r.category !== category) return false;
      if (q) {
        const inName     = Helpers.normalize(r.name).includes(q);
        const inEmail    = Helpers.normalize(r.email).includes(q);
        const inCategory = Helpers.normalize(r.category).includes(q);
        const inNotes    = Helpers.normalize(r.notes).includes(q);
        if (!inName && !inEmail && !inCategory && !inNotes) return false;
      }
      return true;
    });
  }

  /**
   * Returns every record without any filtering.
   * @returns {Record[]}
   */
  function getRaw() { return _records; }

  /**
   * Wipes all records and resets all counters.
   */
  function clear() {
    _records      = [];
    _nextId       = 1;
    _blockedCount = 0;
    _fpCount      = 0;
  }

  /** @returns {number} */
  function count()        { return _records.length; }

  /** @returns {number} */
  function blockedCount() { return _blockedCount; }

  /** @returns {number} */
  function fpCount()      { return _fpCount; }

  /** Increments the blocked counter by one. */
  function incrementBlocked() { _blockedCount++; }

  /** Increments the false-positive counter by one. */
  function incrementFP()      { _fpCount++; }

  return {
    insert,
    remove,
    getAll,
    getRaw,
    clear,
    count,
    blockedCount,
    fpCount,
    incrementBlocked,
    incrementFP
  };
})();
