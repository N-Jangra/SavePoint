// Search page template for this app.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.search = context => {
    const { esc, libraryQuery } = context;
    const { listOrEmpty, filteredItems } = window.SplitAppLibrary.create(context);
  function renderSearch() {
    const q = libraryQuery;
    const list = filteredItems(q);
    const emptyTitle = q ? "No matches found." : "Your collection is empty.";
    const emptyHint = q ? "Try another title or shorten your search." : "Add a game to your library to get started.";
    return `<section class="search-page"><div class="search-box collection-search" role="search"><i data-lucide="search" aria-hidden="true"></i><input id="library-search" type="search" placeholder="Search your collection" value="${esc(q)}" autofocus aria-label="Search your collection"><button type="button" data-clear-library-search aria-label="Clear search" ${q ? "" : "hidden"}>×</button></div><div id="search-results">${listOrEmpty(list, emptyTitle, emptyHint)}</div></section>`;
  }
    return renderSearch();
  };
})();
