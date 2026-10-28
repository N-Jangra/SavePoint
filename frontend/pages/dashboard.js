// Dashboard page template for this app.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.dashboard = context => {
    const { config, esc, libraryQuery, dashboardStatusFilter = "all", prefs, labelCategory } = context;
    const { dashboardItems, card, listOrEmpty } = window.SplitAppLibrary.create(context);
    const pageSize = 40;
    const view = prefs.dashboardView || "list";
    const gridViews = new Set(["grid", "detailed-grid", "compact-grid", "large-grid"]);
    const listClass = gridViews.has(view) ? "item-grid" : "item-list";
    const statusOrder = ["Playing", "Backlog", "Completed", "On Hold", "Dropped"];
    const statuses = [...statusOrder.filter(status => config.categories[0]?.statuses?.includes(status)), ...(config.categories[0]?.statuses || []).filter(status => !statusOrder.includes(status))];
    const grouped = [];
    if ((prefs.dashboardGroupBy || "status") === "status") {
      statuses.filter(status => dashboardStatusFilter === "all" || status === dashboardStatusFilter).forEach(status => {
        const games = dashboardItems(status, libraryQuery);
        if (games.length) grouped.push({ key: status, title: status, games });
      });
    } else {
      let games = dashboardItems(null, libraryQuery);
      if (dashboardStatusFilter !== "all") games = games.filter(item => item.status === dashboardStatusFilter);
      if (prefs.dashboardGroupBy === "none") {
        if (games.length) grouped.push({ key: "all-games", title: "All games", games });
      } else {
        const groups = new Map();
        games.forEach(item => {
          const key = prefs.dashboardGroupBy === "category" ? String(item.category || "other") : String(item.year || "Unknown release date");
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(item);
        });
        const entries = [...groups];
        if (prefs.dashboardGroupBy === "release") entries.sort(([a], [b]) => a === "Unknown release date" ? 1 : b === "Unknown release date" ? -1 : Number(b) - Number(a));
        entries.forEach(([key, entries]) => grouped.push({ key, title: prefs.dashboardGroupBy === "category" ? labelCategory(key) : key, games: entries }));
      }
    }
    const groups = grouped.map(group => {
      const visibleGames = group.games.slice(0, pageSize);
      const safeKey = esc(group.key);
      return `<section class="library-group dashboard-status-group" data-dashboard-status-group="${safeKey}"><h2>${esc(group.title)} <span>${group.games.length}</span></h2><div class="${listClass}" data-dashboard-items="${safeKey}" data-total-count="${group.games.length}" data-rendered-count="${visibleGames.length}">${visibleGames.map(card).join("")}</div>${group.games.length > pageSize ? `<button type="button" class="dashboard-load-more" data-dashboard-load-more="${safeKey}" data-offset="${pageSize}" aria-label="Load more ${esc(group.title)} games">Load more · ${group.games.length - pageSize} remaining</button>` : ""}</section>`;
    }).join("");
    const views = [["list", "List"], ["compact-list", "Compact list"], ["grid", "Poster grid"], ["detailed-grid", "Detailed grid"], ["compact-grid", "Compact grid"], ["table", "Table"], ["minimal-list", "Minimal list"], ["large-grid", "Large poster grid"], ["kanban", "Kanban board"], ["timeline", "Timeline"]];
    const viewOptions = views.map(([key, label]) => `<option value="${key}" ${view === key ? "selected" : ""}>${label}</option>`).join("");
    const sortOptions = [["updated-desc", "Recently updated"], ["created-desc", "Recently added"], ["progress-desc", "Most progress"], ["progress-asc", "Least progress"], ["rating-desc", "Highest rated"], ["release-desc", "Newest release"], ["alphabetical-asc", "Title A–Z"], ["alphabetical-desc", "Title Z–A"]].map(([key, label]) => `<option value="${key}" ${prefs.dashboardSort === key ? "selected" : ""}>${label}</option>`).join("");
    const themeOptions = [["light", "Light"], ["dark", "Dark"], ["grey", "Grey"], ["amoled", "AMOLED"], ["flashbang", "Flashbang"], ["material-you", "Material You"], ["ocean", "Ocean"], ["forest", "Forest"], ["sunset", "Sunset"], ["rose", "Rose"], ["lavender", "Lavender"], ["nord", "Nord"], ["sand", "Sand"], ["mint", "Mint"], ["system", "System"]].map(([key, label]) => `<option value="${key}" ${prefs.theme === key ? "selected" : ""}>${label}</option>`).join("");
    const select = (label, name, options) => `<label class="dashboard-filter-field">${label}<select name="${name}">${options}</select></label>`;
    const toggle = (label, name) => `<label class="dashboard-filter-toggle"><span>${label}</span><input type="checkbox" name="${name}" role="switch" ${prefs[name] ? "checked" : ""}></label>`;
    const groupOptions = [["status", "Status"], ["category", "Category"], ["release", "Release date"], ["none", "None"]].map(([key, label]) => `<option value="${key}" ${(prefs.dashboardGroupBy || "status") === key ? "selected" : ""}>${label}</option>`).join("");
    const emptyMessage = libraryQuery ? "No matching games found." : "Your collection is empty.";
    return `<section class="search-page home-collection-page"><label class="search-box collection-search"><span aria-hidden="true">⌕</span><input id="global-search" type="search" placeholder="Search your collection" value="${esc(libraryQuery)}" autocomplete="off" aria-label="Search your collection"><button type="button" data-clear-collection-search aria-label="Clear search" ${libraryQuery ? "" : "hidden"}>×</button></label><div id="collection-results" class="dashboard-view-${esc(view)}">${groups || listOrEmpty([], emptyMessage)}</div><dialog class="choice-dialog dashboard-filter-dialog" id="dashboard-filter-dialog"><form id="dashboard-filter-form"><div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">HOME</p><h2>Filter games</h2></div><button type="button" class="choice-dialog-close" data-close-dashboard-filter aria-label="Close">×</button></header><h3 class="dashboard-filter-section-title">Sort by</h3>${select("Sort by", "sort", sortOptions)}${select("Category status", "status", `<option value="all" ${dashboardStatusFilter === "all" ? "selected" : ""}>All statuses</option>${statuses.map(status => `<option value="${esc(status)}" ${dashboardStatusFilter === status ? "selected" : ""}>${esc(status)}</option>`).join("")}`)}<h3 class="dashboard-filter-section-title">View &amp; layout</h3>${select("Layout", "view", viewOptions)}<h3 class="dashboard-filter-section-title">Appearance &amp; display</h3>${select("Theme", "theme", themeOptions)}${select("Density", "density", `<option value="comfortable" ${prefs.dashboardDensity === "comfortable" ? "selected" : ""}>Comfortable</option><option value="compact" ${prefs.dashboardDensity === "compact" ? "selected" : ""}>Compact</option>`)}${select("Group by", "groupBy", groupOptions)}${toggle("Show ratings", "showRatings")}${toggle("Show progress", "showProgress")}${toggle("Show thumbnails", "showThumbnails")}<footer class="choice-dialog-actions"><button type="button" class="button secondary" data-reset-dashboard-filter>Clear filter</button><button type="submit" class="button primary">Apply filter</button></footer></form></dialog></section>`;
  };
})();
