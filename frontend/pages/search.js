// Search page template for this app.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  let shown = 60;
  window.SplitAppPages.search = context => {
    const { esc, libraryQuery } = context;
    const { listOrEmpty, filteredItems } = window.SplitAppLibrary.create(context);
  function renderSearch() {
    const q = libraryQuery;
    const list = filteredItems(q);
    const visible = list.slice(0, shown);
    const restoring = Boolean(context.libraryLoading);
    const emptyTitle = restoring ? "Loading your games…" : q ? "No matches found." : "Your collection is empty.";
    const emptyHint = restoring ? "Your saved collection is being restored." : q ? "Try another title or shorten your search." : "Add a game to your library to get started.";
    const more = list.length > visible.length ? `<button type="button" class="dashboard-load-more" data-search-more>Show ${Math.min(60, list.length - visible.length)} more · ${list.length - visible.length} remaining</button>` : "";
    return `<section class="search-page"><div class="search-box collection-search" role="search"><i data-lucide="search" aria-hidden="true"></i><input id="library-search" type="search" placeholder="Search your collection" value="${esc(q)}" autofocus aria-label="Search your collection"><button type="button" data-clear-library-search aria-label="Clear search" ${q ? "" : "hidden"}>×</button></div><div id="search-results"><p class="search-result-count" role="status">${restoring ? "Restoring your collection…" : `${list.length} ${list.length === 1 ? "game" : "games"}${q ? " found" : " in your collection"}`}</p>${listOrEmpty(visible, emptyTitle, emptyHint)}${more}</div></section>`;
  }
    return renderSearch();
  };
  window.SplitAppPages.resetSearchWindow = () => { shown = 60; };
  window.SplitAppPages.showMoreSearch = () => { shown += 60; };
})();
