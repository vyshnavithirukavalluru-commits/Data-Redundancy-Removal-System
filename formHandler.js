/**
 * formHandler.js
 * Handles the single-entry Add Entry form:
 *   - reads field values
 *   - calls Validator.classify()
 *   - updates the Store, Stats, AuditLog, and UI feedback
 */

const FormHandler = (() => {

  // ── Form read helpers ─────────────────────────────────

  /**
   * Reads and returns current form field values as a plain object.
   * @returns {{ name, email, phone, category, notes }}
   */
  function _readForm() {
    return {
      name:     document.getElementById('f-name').value.trim(),
      email:    document.getElementById('f-email').value.trim(),
      phone:    document.getElementById('f-phone').value.trim(),
      category: document.getElementById('f-cat').value,
      notes:    document.getElementById('f-notes').value.trim()
    };
  }

  // ── Result banner helpers ─────────────────────────────

  /**
   * Displays the result banner beneath the form.
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {string} html - Inner HTML of the banner message.
   */
  function _showResult(type, html) {
    const el = document.getElementById('result-box');
    el.className = `result-box ${type}`;
    el.innerHTML = html;
    el.classList.remove('hidden');
  }

  function _hideResult() {
    const el = document.getElementById('result-box');
    el.classList.add('hidden');
    el.innerHTML = '';
  }

  // ── Public API ────────────────────────────────────────

  /**
   * Main validation + add handler, called when the user clicks "Validate & Add".
   * Reads the form, validates fields, classifies the entry, then acts on the result.
   */
  function validateAndAdd() {
    const entry = _readForm();

    // Field-level validation
    const { valid, error } = Validator.validateFields(entry);
    if (!valid) {
      _showResult('error', `<i class="ti ti-alert-circle"></i> ${Helpers.escapeHTML(error)}`);
      SimilarityCard.hide();
      return;
    }

    // Redundancy classification
    const result = Validator.classify(entry);

    if (result.status === 'duplicate') {
      // ── Blocked ──────────────────────────────────────
      Store.incrementBlocked();
      Stats.update();
      AuditLog.append('SKIP',
        `Blocked duplicate: ${entry.name} <${entry.email}> — ${result.reason}`
      );
      _showResult('error',
        `<i class="ti ti-ban"></i>
         <div>
           <strong>Entry blocked.</strong>
           <p style="margin-top:4px;font-size:12px;">${Helpers.escapeHTML(result.reason)}</p>
         </div>`
      );
      SimilarityCard.show(result.matches);

    } else if (result.status === 'false_positive') {
      // ── False positive — add with warning ────────────
      Store.incrementFP();
      Store.insert({ ...entry, status: 'fp' });
      Stats.update();
      DatabaseView.render();
      AuditLog.append('FP',
        `False positive: ${entry.name} — name/phone match with existing record. Added with flag.`
      );
      _showResult('warning',
        `<i class="ti ti-alert-triangle"></i>
         <div>
           <strong>False positive detected.</strong>
           <p style="margin-top:4px;font-size:12px;">${Helpers.escapeHTML(result.reason)}</p>
         </div>`
      );
      SimilarityCard.show(result.matches);

    } else {
      // ── Unique — add to database ──────────────────────
      Store.insert({ ...entry, status: 'unique' });
      Stats.update();
      DatabaseView.render();
      AuditLog.append('ADD',
        `Added unique record: ${entry.name} <${entry.email}>`
      );
      _showResult('success',
        `<i class="ti ti-circle-check"></i>
         <strong>Entry added successfully.</strong>
         Record verified as unique and stored in the database.`
      );
      SimilarityCard.hide();
      clearForm(/* keepResult= */ true);
    }
  }

  /**
   * Resets all form fields and optionally hides the result banner.
   * @param {boolean} [keepResult=false]
   */
  function clearForm(keepResult = false) {
    ['f-name', 'f-email', 'f-phone', 'f-notes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    if (!keepResult) {
      _hideResult();
      SimilarityCard.hide();
    }
  }

  return { validateAndAdd, clearForm };
})();
