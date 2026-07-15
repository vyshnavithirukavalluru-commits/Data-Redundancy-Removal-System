/**
 * similarityCard.js
 * Renders the "Similarity Analysis" card shown after a validation attempt.
 *
 * Displays a per-field similarity bar chart for each matched record,
 * helping users understand why an entry was flagged or blocked.
 */

const SimilarityCard = (() => {

  /**
   * Shows the similarity card populated with match data.
   *
   * @param {Array<{
   *   rec:      object,
   *   emailSim: number,
   *   nameSim:  number,
   *   phoneSim: number,
   *   type:     string
   * }>} matches
   */
  function show(matches) {
    const card = document.getElementById('similarity-card');
    const body = document.getElementById('similarity-details');

    if (!matches || !matches.length) {
      card.classList.add('hidden');
      return;
    }

    body.innerHTML = matches.map(m => `
      <div class="sim-match-block">
        <div class="sim-match-title">
          ${Helpers.escapeHTML(m.rec.name)}
          &lt;${Helpers.escapeHTML(m.rec.email)}&gt;
          ${_typeBadge(m.type)}
        </div>

        ${_bar('Email similarity', m.emailSim, _barColor(m.emailSim, 90))}
        ${_bar('Name similarity',  m.nameSim,  _barColor(m.nameSim,  80))}
        ${m.phoneSim ? _bar('Phone similarity', m.phoneSim, _barColor(m.phoneSim, 95)) : ''}
      </div>
    `).join('');

    card.classList.remove('hidden');
  }

  /** Hides the similarity card. */
  function hide() {
    document.getElementById('similarity-card').classList.add('hidden');
    document.getElementById('similarity-details').innerHTML = '';
  }

  // ── Private helpers ───────────────────────────────────

  function _bar(label, pct, color) {
    return `
      <div class="similarity-row">
        <span class="sim-label">${label}</span>
        <div class="sim-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="sim-fill" style="width:${pct}%; background:${color};"></div>
        </div>
        <span class="sim-pct" style="color:${color};">${pct}%</span>
      </div>`;
  }

  function _barColor(pct, danger) {
    if (pct >= danger) return '#A32D2D'; // red — above threshold
    if (pct >= 60)     return '#854F0B'; // amber — notable
    return '#185FA5';                    // blue — low
  }

  function _typeBadge(type) {
    const map = {
      exact: '<span class="pill duplicate" style="margin-left:6px;">Exact</span>',
      fuzzy: '<span class="pill fuzzy"    style="margin-left:6px;">Fuzzy</span>',
      fp:    '<span class="pill fp"       style="margin-left:6px;">False Positive</span>'
    };
    return map[type] || '';
  }

  return { show, hide };
})();
