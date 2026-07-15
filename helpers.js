/**
 * helpers.js
 * General-purpose utility functions used across the application.
 */

const Helpers = (() => {

  /**
   * Escapes HTML special characters to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Normalises a string: trim, lowercase, collapse whitespace.
   * Used as a preprocessing step before similarity comparisons.
   * @param {string} str
   * @returns {string}
   */
  function normalize(str) {
    return (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Validates that an email address has a basic valid format.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  /**
   * Returns a formatted time string (HH:MM:SS) for the current moment.
   * @returns {string}
   */
  function currentTime() {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Triggers a file download in the browser.
   * @param {string} filename - The name of the file to download.
   * @param {string} content  - The text content of the file.
   * @param {string} mimeType - MIME type, e.g. 'text/csv'.
   */
  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { escapeHTML, normalize, isValidEmail, currentTime, downloadFile };
})();
