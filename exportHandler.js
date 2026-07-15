/**
 * exportHandler.js
 * Exports the current database to CSV or JSON and triggers a browser download.
 */

const ExportHandler = (() => {

  /**
   * Wraps a value in double quotes and escapes any internal double quotes.
   * @param {*} val
   * @returns {string}
   */
  function _csvCell(val) {
    return '"' + String(val || '').replace(/"/g, '""') + '"';
  }

  /**
   * Exports all records as a UTF-8 CSV file.
   */
  function toCSV() {
    const records = Store.getRaw();
    if (!records.length) {
      alert('No records to export.');
      return;
    }

    const header = ['id', 'name', 'email', 'phone', 'category', 'status', 'added'].map(_csvCell).join(',');
    const rows   = records.map(r =>
      [r.id, r.name, r.email, r.phone || '', r.category, r.status, r.time]
        .map(_csvCell)
        .join(',')
    );

    const content = [header, ...rows].join('\n');
    Helpers.downloadFile('database_export.csv', content, 'text/csv;charset=utf-8;');
  }

  /**
   * Exports all records as a formatted JSON file.
   */
  function toJSON() {
    const records = Store.getRaw();
    if (!records.length) {
      alert('No records to export.');
      return;
    }

    const content = JSON.stringify(records, null, 2);
    Helpers.downloadFile('database_export.json', content, 'application/json');
  }

  return { toCSV, toJSON };
})();
