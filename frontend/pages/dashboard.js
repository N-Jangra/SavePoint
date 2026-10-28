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
    const allCount = dashboardItems(null, libraryQuery).length;
    const total = grouped.reduce((sum, group) => sum + group.games.length, 0);
    const groups = grouped.map(group => {
      const visibleGames = group.games.slice(0, pageSize);
      const safeKey = esc(group.key);
      return `<section class="library-group dashboard-status-group" data-dashboard-status-group="${safeKey}"><h2>${esc(group.title)} <span>${group.games.length}</span></h2><div class="${listClass}" data-dashboard-items="${safeKey}" data-total-count="${group.games.length}" data-rendered-count="${visibleGames.length}">${visibleGames.map(card).join("")}</div>${group.games.length > pageSize ? `<button type="button" class="dashboard-load-more" data-dashboard-load-more="${safeKey}" data-offset="${pageSize}" aria-label="Load more ${esc(group.title)} games">Load more · ${group.games.length - pageSize} remaining</button>` : ""}</section>`;
    }).join("");
    const views = [["list", "List"], ["compact-list", "Compact list"], ["grid", "Poster grid"], ["detailed-grid", "Detailed grid"], ["compact-grid", "Compact grid"], ["table", "Table"], ["minimal-list", "Minimal list"], ["large-grid", "Large poster grid"], ["kanban", "Kanban board"], ["timeline", "Timeline"]];
    
    const sortList = [["updated-desc", "Recently updated"], ["created-desc", "Recently added"], ["progress-desc", "Most progress"], ["progress-asc", "Least progress"], ["rating-desc", "Highest rated"], ["release-desc", "Newest release"], ["alphabetical-asc", "Title A–Z"], ["alphabetical-desc", "Title Z–A"]];
    const themeList = [["light", "Light"], ["dark", "Dark"], ["grey", "Grey"], ["amoled", "AMOLED"], ["flashbang", "Flashbang"], ["material-you", "Material You"], ["ocean", "Ocean"], ["forest", "Forest"], ["sunset", "Sunset"], ["rose", "Rose"], ["lavender", "Lavender"], ["nord", "Nord"], ["sand", "Sand"], ["mint", "Mint"], ["system", "System"]];
    const pillList = (name, options, current, extra = "") => `<div class="ios-pills ${extra}"><input type="hidden" name="${name}" value="${esc(current)}">${options.map(([key, label]) => `<button type="button" class="ios-pill${String(current) === String(key) ? " active" : ""}" data-pill-name="${name}" data-pill-value="${esc(key)}" aria-pressed="${String(current) === String(key)}">${esc(label)}</button>`).join("")}</div>`;
    const sheetCard = (title, body) => `<section class="ios-card"><span class="ios-label">${title}</span>${body}</section>`;
    const row = (label, body) => `<div class="ios-row"><span>${label}</span>${body}</div>`;
    const toggle = (label, name) => `<label class="ios-row ios-switch-row"><span>${label}</span><input type="checkbox" class="ios-switch" name="${name}" role="switch" ${prefs[name] ? "checked" : ""}></label>`;
    const groupList = [["status", "Status"], ["category", "Category"], ["release", "Release"], ["none", "None"]];
    const emptyMessage = libraryQuery ? "No matching games found." : "Your collection is empty.";
    return `<section class="search-page home-collection-page"><label class="search-box collection-search"><span aria-hidden="true">⌕</span><input id="global-search" type="search" placeholder="Search your collection" value="${esc(libraryQuery)}" autocomplete="off" aria-label="Search your collection"><button type="button" data-clear-collection-search aria-label="Clear search" ${libraryQuery ? "" : "hidden"}>×</button></label>${`<div class="quick-status-strip" role="group" aria-label="Filter by status">${[["all","All"],...statuses.map(x => [x, x])].map(([key, label]) => `<button type="button" class="ios-pill${dashboardStatusFilter === key ? " active" : ""}" data-quick-status="${esc(key)}" aria-pressed="${dashboardStatusFilter === key}">${esc(label)}<em>${key === "all" ? allCount : dashboardItems(key, libraryQuery).length}</em></button>`).join("")}</div><div class="collection-summary"><span>Showing ${total} ${total === 1 ? "game" : "games"} • Grouped by ${esc({ status: "Status", category: "Category", release: "Release", none: "nothing" }[prefs.dashboardGroupBy || "status"] || "Status")}</span></div>`}<div id="collection-results" class="dashboard-view-${esc(view)}">${groups || listOrEmpty([], emptyMessage)}</div><dialog class="choice-dialog dashboard-filter-dialog" id="dashboard-filter-dialog"><form id="dashboard-filter-form"><div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">HOME</p><h2>Filter games</h2></div><button type="button" class="choice-dialog-close" data-close-dashboard-filter aria-label="Close">×</button></header><div class="ios-sheet-body">${sheetCard("Sort By", pillList("sort", sortList, prefs.dashboardSort))}${sheetCard("Category Status", pillList("status", [["all", "All statuses"], ...statuses.map(status => [status, status])], dashboardStatusFilter))}${sheetCard("View &amp; Layout", `${row("Layout", "")}${pillList("view", views, view)}${row("Group by", "")}${pillList("groupBy", groupList, prefs.dashboardGroupBy || "status", "segmented")}`)}${sheetCard("Appearance &amp; Display", `${row("Theme", "")}${pillList("theme", themeList, prefs.theme)}${row("Density", pillList("density", [["compact", "Compact"], ["comfortable", "Comfortable"]], prefs.dashboardDensity || "comfortable", "segmented"))}${toggle("Show ratings", "showRatings")}${toggle("Show progress", "showProgress")}${toggle("Show thumbnails", "showThumbnails")}`)}</div><footer class="choice-dialog-actions"><button type="button" class="button secondary" data-reset-dashboard-filter>Clear filter</button><button type="submit" class="button primary">Apply filter</button></footer></form></dialog></section>`;
  };
})();
