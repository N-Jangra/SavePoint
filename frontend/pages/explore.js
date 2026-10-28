// CueMark-style Explore hub for activity pages and individual metadata sources.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.explore = context => {
    const { config, prefs, esc, labelCategory } = context;
    const category = config.categories[0];
    const orderedSources = prefs.metadataSourceOrder
      .map(key => window.SplitAppSources.list(category.key).find(source => source.key === key))
      .filter(source => source && window.SplitAppSources.isEnabled(source.key, prefs));
    const sourceIcons = { wikidata: "globe-2", freetogame: "swords", steamdb: "database", howlongtobeat: "clock-3", rawg: "gamepad-2" };
    const sourceRows = orderedSources.map(source => {
      const missingKey = source.keyRequired && !prefs.apiKeys[source.key];
      const note = missingKey ? "API key needed · configure in Metadata Sources"
          : source.categories.map(labelCategory).join(", ");
      return `<a class="explore-source-card explore-source-row" href="#discover?source=${encodeURIComponent(source.key)}" data-explore-source="${esc(source.key)}" data-explore-search="${esc(`${source.name} ${note}`.toLowerCase())}">
          <span class="explore-source-icon"><i data-lucide="${sourceIcons[source.key] || "database"}" aria-hidden="true"></i></span>
          <span class="explore-source-row-copy"><strong>${esc(source.name)}</strong><small>${esc(note)}</small></span>
          ${missingKey ? `<span class="explore-source-state">Setup</span>` : ""}
          <i data-lucide="chevron-right" aria-hidden="true"></i>
        </a>`;
    }).join("");
    return `<section class="explore-page">
      <header class="explore-heading"><h1>Explore</h1><a class="explore-icon-btn" href="#settings/metadata-sources" aria-label="Manage metadata sources" title="Manage metadata sources"><i data-lucide="wrench" aria-hidden="true"></i></a></header>
      <h2 class="explore-group-title">Insights &amp; Activity</h2>
      <div class="explore-list-group">
        <button class="explore-list-row" type="button" data-go="timeline"><span class="explore-list-icon" style="background:#34c759"><i data-lucide="clock" aria-hidden="true"></i></span><span class="explore-list-body"><span class="explore-list-name">Timeline</span></span><i data-lucide="chevron-right" class="explore-list-chevron" aria-hidden="true"></i></button>
        <button class="explore-list-row" type="button" data-go="statistics"><span class="explore-list-icon" style="background:#ff9500"><i data-lucide="bar-chart-3" aria-hidden="true"></i></span><span class="explore-list-body"><span class="explore-list-name">Statistics</span></span><i data-lucide="chevron-right" class="explore-list-chevron" aria-hidden="true"></i></button>
      </div>
      <h2 class="explore-group-title">Metadata Sources</h2>
      <label class="search-box explore-source-search"><span aria-hidden="true">⌕</span><input id="explore-source-search" type="search" placeholder="Search metadata sources" autocomplete="off" aria-label="Search metadata sources"></label>
      <div class="explore-source-list">${sourceRows}</div><p class="explore-no-sources" id="explore-no-sources" hidden>No matching metadata sources.</p>
      <h2 class="explore-group-title">Beta</h2>
      <div class="explore-list-group">
        <button class="explore-list-row" type="button" data-go="mix"><span class="explore-list-icon" style="background:#7c3aed"><i data-lucide="blend" aria-hidden="true"></i></span><span class="explore-list-body"><span class="explore-list-name">Mix fetch <em class="mix-beta">EXPERIMENTAL</em></span><small class="explore-list-sub">One list from all sources; details merged when you open or add a game.</small></span><i data-lucide="chevron-right" class="explore-list-chevron" aria-hidden="true"></i></button>
      </div>
    </section>`;
  };
})();
