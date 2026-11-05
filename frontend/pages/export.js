// Export page: pick a format and what to include before saving.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.export = context => {
    const { exportOptions: opt, itemCount, esc } = context;
    const formats = [["json", "JSON", "Full backup of every field. Best for restoring SavePoint."], ["txt", "TXT", "Names only, one per line."], ["csv", "CSV", "Spreadsheet with title, year and status."]];
    const radio = ([key, label, help]) => `<button type="button" role="radio" aria-checked="${opt.format === key}" class="export-choice${opt.format === key ? " active" : ""}" data-export-format="${key}"><span class="export-radio" aria-hidden="true"></span><span><strong>${label}</strong><small>${esc(help)}</small></span></button>`;
    const check = (key, label, help, checked, locked = false) => `<button type="button" role="checkbox" aria-checked="${checked}" class="export-choice${checked ? " active" : ""}${locked ? " locked" : ""}" ${locked ? "disabled" : `data-export-opt="${key}"`}><span class="export-check" aria-hidden="true"></span><span><strong>${label}</strong><small>${esc(help)}</small></span></button>`;
    return `<section class="settings-page settings-detail-page export-page"><header class="settings-page-heading settings-subpage-heading"><a class="settings-back" href="#settings/backups"><span aria-hidden="true">‹</span> Back</a><span class="settings-subpage-icon" aria-hidden="true"><i data-lucide="file-down"></i></span><h1>Export</h1></header>
      <h2 class="settings-section-title">FORMAT</h2><div class="export-group" role="radiogroup" aria-label="Export format">${formats.map(radio).join("")}</div>
      <h2 class="settings-section-title">INCLUDE</h2><div class="export-group">${check("names", "Names", "Game titles (always included).", true, true)}${check("ratings", "Ratings", "Your score for each game.", opt.ratings)}${check("reviews", "Reviews", "Your written reviews and notes, if any.", opt.reviews)}</div>
      <p class="export-summary">${itemCount} ${itemCount === 1 ? "game" : "games"} will be exported${opt.format === "json" ? " with all details, history and preferences" : ""}.</p>
      <button type="button" class="button primary export-run" data-run-export><i data-lucide="download" aria-hidden="true"></i> Export ${esc(opt.format.toUpperCase())}</button></section>`;
  };
})();
