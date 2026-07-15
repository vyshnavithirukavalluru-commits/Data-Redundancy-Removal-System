/**
 * validator.js
 * Core validation and classification engine.
 *
 * Classifies an incoming entry against existing records as one of:
 *   - 'unique'        → safe to add, no significant match found
 *   - 'duplicate'     → exact or fuzzy email match; entry should be blocked
 *   - 'false_positive'→ name + phone match but different email; add with warning
 *
 * Thresholds are read live from the Settings sliders in the DOM.
 */

const Validator = (() => {

  // ── Threshold helpers ─────────────────────────────────

  /**
   * Reads the three configurable similarity thresholds from the UI.
   * @returns {{ email: number, name: number, phone: number }}
   */
  function getThresholds() {
    return {
      email: parseInt(document.getElementById('t-email').value, 10),
      name:  parseInt(document.getElementById('t-name').value,  10),
      phone: parseInt(document.getElementById('t-phone').value, 10)
    };
  }

  // ── Main classification function ──────────────────────

  /**
   * Classifies an incoming entry against all records in the Store.
   *
   * @param {{ name: string, email: string, phone: string }} entry
   * @returns {{
   *   status:  'unique' | 'duplicate' | 'false_positive',
   *   reason:  string,
   *   matches: Array<{
   *     rec:      object,
   *     emailSim: number,
   *     nameSim:  number,
   *     phoneSim: number,
   *     type:     'exact' | 'fuzzy' | 'fp'
   *   }>
   * }}
   */
  function classify(entry) {
    const thresholds = getThresholds();
    const result     = { status: 'unique', reason: '', matches: [] };
    const existing   = Store.getRaw();

    for (const rec of existing) {
      const emailSim = Similarity.score(entry.email, rec.email);
      const nameSim  = Similarity.score(entry.name,  rec.name);
      const phoneSim = (entry.phone && rec.phone)
        ? Similarity.score(entry.phone, rec.phone)
        : 0;

      // ── 1. Exact duplicate (email matches exactly) ──────────
      if (Helpers.normalize(entry.email) === Helpers.normalize(rec.email)) {
        result.status = 'duplicate';
        result.reason = 'Exact email match with an existing record';
        result.matches.push({ rec, emailSim, nameSim, phoneSim, type: 'exact' });
        break; // No need to check further
      }

      // ── 2. Fuzzy duplicate (email very similar) ─────────────
      if (emailSim >= thresholds.email) {
        result.status = 'duplicate';
        result.reason = `High email similarity detected (${emailSim}% ≥ ${thresholds.email}% threshold)`;
        result.matches.push({ rec, emailSim, nameSim, phoneSim, type: 'fuzzy' });
        // Continue checking — there could be an exact match later
      }

      // ── 3. False positive (name + phone match, email differs) ─
      if (
        result.status !== 'duplicate' &&
        nameSim  >= thresholds.name  &&
        phoneSim >= thresholds.phone &&
        entry.phone &&
        rec.phone
      ) {
        result.status = 'false_positive';
        result.reason = `Name (${nameSim}%) and phone (${phoneSim}%) match an existing record, but email differs`;
        result.matches.push({ rec, emailSim, nameSim, phoneSim, type: 'fp' });
      }
    }

    return result;
  }

  /**
   * Validates required fields and email format before classification.
   * @param {{ name: string, email: string }} entry
   * @returns {{ valid: boolean, error: string }}
   */
  function validateFields(entry) {
    if (!entry.name.trim()) {
      return { valid: false, error: 'Name is a required field.' };
    }
    if (!entry.email.trim()) {
      return { valid: false, error: 'Email is a required field.' };
    }
    if (!Helpers.isValidEmail(entry.email)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    return { valid: true, error: '' };
  }

  return { classify, validateFields, getThresholds };
})();
