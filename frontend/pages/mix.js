// Search enabled metadata sources together and save the merged source identity with each library entry.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.mix = context => {
    const { config, prefs, esc, mixQuery = "" } = context;
    const sources = window.SplitAppSources.available(config.categories[0].key, prefs);
    const hasSources = sources.length > 0;
    return `<section class="mix-page settings-page settings-detail-page${hasSources ? "" : " mix-page-no-sources"}">
      <header class="settings-page-heading settings-subpage-heading"><a class="settings-back" data-back href="#explore"><span aria-hidden="true">‹</span> Explore</a><span class="settings-subpage-icon" aria-hidden="true"><i data-lucide="layers-2"></i></span><h1>Mix fetch</h1></header>
      <section class="mix-intro"><span class="mix-intro-icon" aria-hidden="true"><i data-lucide="layers-2"></i></span><div><strong>One search, combined results</strong><p>Each result keeps its source links. Saved games stay marked as Mix entries and can merge details again later.</p></div></section>
      <div class="discover-search-row" role="search"><label class="search-box discover-search"><i data-lucide="search" aria-hidden="true"></i><input id="mix-query" type="search" placeholder="${hasSources ? "Search games" : "Enable a source to search"}" autocomplete="off" enterkeyhint="search" value="${esc(mixQuery)}" aria-label="Search games" ${hasSources ? "" : "disabled"}></label><button class="discover-submit" data-mix-search type="button" aria-label="Search" title="Search" ${hasSources ? "" : "disabled"}><i data-lucide="search" aria-hidden="true"></i></button></div>
      <p id="mix-message" class="discover-message mix-message" aria-live="polite">${hasSources ? "Search by game title to see matches from every enabled source." : "Enable at least one metadata source to search across providers."}</p>
      <ul id="mix-results" class="mix-list"></ul>
    </section>`;
  };
})();
