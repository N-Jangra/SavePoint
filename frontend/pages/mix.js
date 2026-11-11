// Search enabled metadata sources together and save the merged source identity with each library entry.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  // Mix may be the first Explore route opened after startup; don't depend on Discover having rendered first.
  window.SplitAppPages.exploreBar = window.SplitAppPages.exploreBar || (active => `<div class="explore-bar"><nav class="explore-mode-tabs" role="tablist" aria-label="Explore mode"><button type="button" role="tab" class="${active === "discover" ? "active" : ""}" aria-selected="${active === "discover"}" data-go="discover">Normal</button><button type="button" role="tab" class="${active === "mix" ? "active" : ""}" aria-selected="${active === "mix"}" data-go="mix">Mix fetch</button></nav></div>`);
  window.SplitAppPages.mix = context => {
    const { config, prefs, esc, mixQuery = "" } = context;
    const sources = window.SplitAppSources.available(config.categories[0].key, prefs);
    const hasSources = sources.length > 0;
    return `<section class="mix-page${hasSources ? "" : " mix-page-no-sources"}">
      ${window.SplitAppPages.exploreBar("mix")}
      <section class="mix-intro"><span class="mix-intro-icon" aria-hidden="true"><i data-lucide="layers-2"></i></span><div><span class="mix-kicker">MULTI-SOURCE SEARCH</span><strong>Search once. Compare sources.</strong><p>Open a result to combine its details, or add it to your library for background syncing.</p></div></section>
      <div class="discover-search-row mix-search-row" role="search"><label class="search-box discover-search"><i data-lucide="search" aria-hidden="true"></i><input id="mix-query" type="search" placeholder="${hasSources ? "Search games" : "Enable a source to search"}" autocomplete="off" enterkeyhint="search" value="${esc(mixQuery)}" aria-label="Search games" ${hasSources ? "" : "disabled"}></label><button class="discover-submit" data-mix-search type="button" aria-label="Search" title="Search" ${hasSources ? "" : "disabled"}><i data-lucide="search" aria-hidden="true"></i><span>Search</span></button></div>
      <p id="mix-message" class="discover-message mix-message" role="status" aria-live="polite">${hasSources ? "Search by game title to find matches from your enabled sources." : "Enable at least one metadata source to search across providers."}</p>
      <ul id="mix-results" class="mix-list"></ul>
    </section>`;
  };
})();
