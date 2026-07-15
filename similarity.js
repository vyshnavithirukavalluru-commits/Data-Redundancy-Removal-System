/**
 * similarity.js
 * String similarity algorithms used for duplicate detection.
 *
 * Core algorithm: Levenshtein distance — the minimum number of single-character
 * edits (insertions, deletions, substitutions) needed to transform one string
 * into another. The result is normalised to a 0–100 percentage.
 */

const Similarity = (() => {

  /**
   * Computes the Levenshtein edit distance between two strings.
   * Time:  O(m × n)   Space: O(m × n)
   *
   * @param {string} a
   * @param {string} b
   * @returns {number} Integer edit distance.
   */
  function levenshteinDistance(a, b) {
    a = Helpers.normalize(a);
    b = Helpers.normalize(b);

    if (a === b)        return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Build DP matrix
    const rows = a.length + 1;
    const cols = b.length + 1;
    const dp   = Array.from({ length: rows }, (_, i) => [i]);

    for (let j = 1; j < cols; j++) dp[0][j] = j;

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j - 1], // substitution
            dp[i - 1][j],     // deletion
            dp[i][j - 1]      // insertion
          );
        }
      }
    }

    return dp[a.length][b.length];
  }

  /**
   * Returns a normalised similarity score between two strings (0–100).
   * 100 = identical, 0 = completely different.
   *
   * @param {string} a
   * @param {string} b
   * @returns {number} Integer percentage (0–100).
   */
  function score(a, b) {
    const na = Helpers.normalize(a);
    const nb = Helpers.normalize(b);

    if (!na && !nb) return 100;
    if (!na || !nb)  return 0;

    const maxLen = Math.max(na.length, nb.length);
    if (maxLen === 0) return 100;

    const dist = levenshteinDistance(na, nb);
    return Math.round((1 - dist / maxLen) * 100);
  }

  return { score, levenshteinDistance };
})();
