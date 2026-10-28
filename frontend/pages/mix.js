// Experimental Mix fetch page: one plain list across all enabled sources; details are merged when a game is opened or added.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.mix = context => {
    const { config, prefs, esc, mixQuery = "" } = context;
    const sources = window.SplitAppSources.available(config.categories[0].key, prefs);
    const chips = sources.map(source => `<span class="mix-chip">${esc(source.name)}</span>`).join("") || `<span class="mix-chip mix-chip-off">No sources enabled</span>`;
    return `<section class="mix-page">
      <header class="explore-heading mix-heading"><a class="settings-back" data-back href="#explore"><span aria-hidden="true">‹</span> Explore</a><h1>Mix fetch</h1><span class="mix-beta">BETA</span></header>
      <section class="mix-intro"><span class="mix-intro-icon" aria-hidden="true"><i data-lucide="flask-conical"></i></span><div><strong>Experimental</strong><p>Search shows one plain list from every enabled source. Opening or adding a game fetches details from all of them and merges the results.</p></div></section>
      <div class="mix-sources" aria-label="Sources used">${chips}</div>
      <div class="discover-search-row" role="search"><label class="search-box discover-search"><span aria-hidden="true">⌕</span><input id="mix-query" type="search" placeholder="Search games" autocomplete="off" enterkeyhint="search" value="${esc(mixQuery)}" aria-label="Search games"></label><button class="discover-submit" data-mix-search type="button" aria-label="Search" title="Search">⌕</button></div>
      <p id="mix-message" class="discover-message" aria-live="polite"></p>
      <ul id="mix-results" class="mix-list"></ul>
    </section>`;
  };
})();
