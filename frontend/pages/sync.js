// Metadata sync status page: what is syncing, what finished, what failed.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.sync = context => {
    const { syncJob: job, syncCounts, esc } = context;
    const heading = `<header class="settings-page-heading settings-subpage-heading"><a class="settings-back" href="#dashboard"><span aria-hidden="true">‹</span> Back</a><span class="settings-subpage-icon" aria-hidden="true"><i data-lucide="refresh-cw"></i></span><h1>Metadata Sync</h1></header>`;
    if (!job) return `<section class="settings-page settings-detail-page">${heading}<div class="import-restore-empty"><span class="import-restore-icon"><i data-lucide="circle-check" aria-hidden="true"></i></span><h1>Nothing syncing</h1><p>When you import games, their metadata is fetched in the background and shown here.</p><a class="button primary" href="#dashboard">Back to library</a></div></section>`;
    const c = syncCounts();
    const label = { syncing: "Syncing…", queued: "Waiting", done: "Updated", failed: "Failed" };
    const icon = { syncing: "loader-circle", queued: "clock", done: "circle-check", failed: "circle-alert" };
    const order = { syncing: 0, failed: 1, queued: 2, done: 3 };
    const sorted = [...job.entries].sort((a, b) => order[a.status] - order[b.status]);
    const shown = sorted.slice(0, 60), hidden = sorted.length - shown.length;
    const rows = shown.map(e =>
      `<li class="sync-row is-${e.status}" data-sync-row="${esc(e.id)}" data-status="${e.status}"><i data-lucide="${icon[e.status]}" aria-hidden="true"></i><span><strong>${esc(e.title)}</strong>${e.error ? `<small>${esc(e.error)}</small>` : ""}</span><em>${label[e.status]}</em></li>`).join("");
    return `<section class="settings-page settings-detail-page sync-page" id="sync-page" style="--p:${c.percent}%">${heading}
      <div class="sync-hero"><div class="sync-pie ${job.finished ? "is-done" : ""}"><b data-sync-percent>${c.percent}%</b></div><div><p class="settings-overline">${job.finished ? "SYNC FINISHED" : "SYNCING IN BACKGROUND"}</p><h2 data-sync-completed>${c.completed} / ${c.total}</h2><p class="sync-hint">${job.finished ? "All lookups have completed." : "You can keep using SavePoint while this runs."}</p></div></div>
      <div class="import-summary-grid"><article><strong data-sync-done>${c.done}</strong><span>Updated</span></article><article><strong data-sync-active>${c.total - c.completed}</strong><span>Remaining</span></article><article><strong data-sync-failed>${c.failed}</strong><span>Failed</span></article></div>
      ${job.finished ? `<div class="import-preview-actions">${c.failed ? `<button type="button" class="button secondary" data-sync-retry>Retry ${c.failed} failed</button>` : ""}<button type="button" class="button primary" data-sync-dismiss>Done</button></div>` : ""}
      <section class="import-preview-list sync-list"><h2>Games</h2><ul>${rows}${hidden > 0 ? `<li class="sync-more">+ ${hidden} more games</li>` : ""}</ul></section></section>`;
  };
})();
