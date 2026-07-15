/**
 * bulkHandler.js
 * Handles the Bulk Upload tab: parses CSV text, runs validation
 * on each row, and imports valid unique records into the Store.
 */

const BulkHandler = (() => {

  // ── Sample data ───────────────────────────────────────
  const SAMPLE_CSV = `name,email,phone,category
Alice Johnson,alice@example.com,9876543210,Customer
Bob Smith,bob@acme.com,9123456789,Employee
Charlie Brown,charlie@corp.com,9988776655,Vendor
Alice Johnson,alice@example.com,9876543210,Customer
Alice_Johnson,alise@example.com,9876543210,Customer
David Lee,david@example.com,,Partner
Eve Martin,eve@corp.com,9911223344,Employee
Bob Smith,bob@acme.com,,Employee
Vendor X,vendorx@supply.com,9000000001,Vendor`;

  // ── Result banner helpers ─────────────────────────────

  function _showResult(type, html) {
    const el = document.getElementById('bulk-result');
    el.className = `result-box ${type}`;
    el.innerHTML = html;
    el.classList.remove('hidden');
  }

  // ── CSV parsing ───────────────────────────────────────

  /**
   * Parses a single CSV line into field parts, handling basic quoting.
   * @param {string} line
   * @returns {string[]}
   */
  function _parseLine(line) {
    return line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
  }

  /**
   * Returns true if a row looks like a CSV header (first cell is 'name').
   * @param {string[]} parts
   */
  function _isHeader(parts) {
    return (parts[0] || '').toLowerCase() === 'name' ||
           (parts[0] || '').toLowerCase() === '#';
  }

  // ── Public API ────────────────────────────────────────

  /**
   * Processes the pasted CSV content and imports valid unique records.
   */
  function process() {
    const raw = document.getElementById('bulk-input').value.trim();
    if (!raw) {
      _showResult('error', '<i class="ti ti-alert-circle"></i> Please paste some CSV data first.');
      return;
    }

    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

    let added   = 0;
    let dupes   = 0;
    let fps     = 0;
    let skipped = 0; // invalid / unparseable rows

    for (const line of lines) {
      const parts = _parseLine(line);

      // Skip header row
      if (_isHeader(parts)) continue;

      // Require at least name + email
      if (parts.length < 2) { skipped++; continue; }

      const entry = {
        name:     parts[0] || '',
        email:    parts[1] || '',
        phone:    parts[2] || '',
        category: parts[3] || 'Customer',
        notes:    ''
      };

      // Basic field validation
      const { valid } = Validator.validateFields(entry);
      if (!valid) { skipped++; continue; }

      const result = Validator.classify(entry);

      if (result.status === 'duplicate') {
        Store.incrementBlocked();
        dupes++;
        AuditLog.append('SKIP', `[Bulk] Blocked duplicate: ${entry.name} <${entry.email}>`);

      } else if (result.status === 'false_positive') {
        Store.incrementFP();
        Store.insert({ ...entry, status: 'fp' });
        fps++;
        added++;
        AuditLog.append('FP', `[Bulk] False positive: ${entry.name} — added with flag.`);

      } else {
        Store.insert({ ...entry, status: 'unique' });
        added++;
        AuditLog.append('ADD', `[Bulk] Added unique: ${entry.name} <${entry.email}>`);
      }
    }

    Stats.update();
    DatabaseView.render();

    _showResult('success',
      `<i class="ti ti-circle-check"></i>
       <div>
         <strong>Import complete.</strong>
         <p style="margin-top:4px;font-size:12px;">
           Processed <strong>${lines.length}</strong> rows &mdash;
           <span style="color:var(--color-green)">${added} added</span>,
           <span style="color:var(--color-red)">${dupes} duplicates blocked</span>,
           <span style="color:var(--color-amber)">${fps} false positives flagged</span>,
           ${skipped} invalid rows skipped.
         </p>
       </div>`
    );
  }

  /**
   * Populates the textarea with sample CSV data for demonstration.
   */
  function loadSample() {
    document.getElementById('bulk-input').value = SAMPLE_CSV;
    const el = document.getElementById('bulk-result');
    el.classList.add('hidden');
  }

  return { process, loadSample };
})();
