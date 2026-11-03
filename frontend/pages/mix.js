// Search enabled metadata sources together and save the merged source identity with each library entry.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.mix = context => {
    const { config, prefs, esc, mixQuery = "" } = context;
    const sources = window.SplitAppSources.available(config.categories[0].key, prefs);
    const chips = sources.map(source => `<span class="mix-chip">${esc(source.name)}</span>`).join("") || `<span class="mix-chip mix-chip-off">No sources enabled</span>`;
    const hasSources = sources.length > 0;
    return `<section class="mix-page${hasSources ? "" : " mix-page-no-sources"}">
      <header class="explore-heading mix-heading"><a class="settings-back" data-back href="#explore"><span aria-hidden="true">‹</span> Explore</a><span class="mix-beta">MULTI-SOURCE</span></header>
      <div class="mix-title-block"><h1>Mix fetch</h1><p>Search enabled sources together and bring the best details into one game entry.</p></div>
      <section class="mix-intro"><span class="mix-intro-icon" aria-hidden="true"><i data-lucide="layers-2"></i></span><div><strong>One search, combined results</strong><p>Each result keeps its source links. Saved games stay marked as Mix entries and can merge details again later.</p></div></section>
      <section class="mix-source-panel"><div><strong>${hasSources ? `${sources.length} ${sources.length === 1 ? "source" : "sources"} ready` : "No sources enabled"}</strong><a class="mix-manage-sources" href="#settings/metadata-sources">Manage sources <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div><div class="mix-sources" aria-label="Sources used">${chips}</div></section>
      <div class="discover-search-row" role="search"><label class="search-box discover-search"><i data-lucide="search" aria-hidden="true"></i><input id="mix-query" type="search" placeholder="${hasSources ? "Search games" : "Enable a source to search"}" autocomplete="off" enterkeyhint="search" value="${esc(mixQuery)}" aria-label="Search games" ${hasSources ? "" : "disabled"}></label><button class="discover-submit" data-mix-search type="button" aria-label="Search" title="Search" ${hasSources ? "" : "disabled"}><i data-lucide="search" aria-hidden="true"></i></button></div>
      <p id="mix-message" class="discover-message mix-message" aria-live="polite">${hasSources ? "Search by game title to see matches from every enabled source." : "Enable at least one metadata source to search across providers."}</p>
      <ul id="mix-results" class="mix-list"></ul>
    </section>`;
  };
})();
