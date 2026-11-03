// Dashboard page template for this app.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.dashboard = context => {
    const { config, esc, items, libraryQuery, dashboardStatusFilter = "all", prefs, labelCategory } = context;
    const { dashboardItems, card, listOrEmpty } = window.SplitAppLibrary.create(context);
    const pageSize = 24;
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
    const allCount = dashboardItems(null, "").length;
    const total = grouped.reduce((sum, group) => sum + group.games.length, 0);
    const groups = grouped.map(group => {
      const visibleGames = group.games.slice(0, pageSize);
      const safeKey = esc(group.key);
      return `<section class="library-group dashboard-status-group" data-dashboard-status-group="${safeKey}"><h2>${esc(group.title)} <span>${group.games.length}</span></h2><div class="${listClass}" data-dashboard-items="${safeKey}" data-total-count="${group.games.length}" data-rendered-count="${visibleGames.length}">${visibleGames.map(card).join("")}</div>${group.games.length > pageSize ? `<button type="button" class="dashboard-load-more" data-dashboard-load-more="${safeKey}" data-offset="${pageSize}" aria-label="Load more ${esc(group.title)} games">Load more · ${group.games.length - pageSize} remaining</button>` : ""}</section>`;
    }).join("");
    const views = [["list", "List"], ["detailed-grid", "Detailed grid"], ["compact-grid", "Compact grid"], ["large-grid", "Large poster grid"]];
    
    const sortList = [["updated-desc", "Recently updated"], ["created-desc", "Recently added"], ["progress-desc", "Most progress"], ["progress-asc", "Least progress"], ["rating-desc", "Highest rated"], ["release-desc", "Newest release"], ["alphabetical-asc", "Title A–Z"], ["alphabetical-desc", "Title Z–A"]];
    const pillList = (name, options, current, extra = "") => `<div class="ios-pills ${extra}"><input type="hidden" name="${name}" value="${esc(current)}">${options.map(([key, label]) => `<button type="button" class="ios-pill${String(current) === String(key) ? " active" : ""}" data-pill-name="${name}" data-pill-value="${esc(key)}" aria-pressed="${String(current) === String(key)}">${esc(label)}</button>`).join("")}</div>`;
    const sheetCard = (title, body, selected = "") => `<section class="ios-card dashboard-filter-card"><div class="dashboard-filter-card-heading"><span class="ios-label">${title}</span>${selected ? `<span class="dashboard-filter-card-selection">${esc(selected)}</span>` : ""}</div>${body}</section>`;
    const row = (label, body) => `<div class="ios-row"><span>${label}</span>${body}</div>`;
    const groupList = [["status", "Status"], ["category", "Category"], ["release", "Release"], ["none", "None"]];
    const emptyResults = libraryQuery
      ? listOrEmpty([], "No matching games found.", "Try another title or clear your search.")
      : dashboardStatusFilter !== "all"
        ? `<div class="dashboard-filter-empty"><strong>No ${esc(dashboardStatusFilter.toLowerCase())} games yet</strong><p>Choose another status or show your full collection.</p><button type="button" class="button secondary small" data-quick-status="all">Show all games</button></div>`
        : items.length
          ? listOrEmpty([], "No games to show.", "Try a different category or adjust your filters.")
          : `<div class="dashboard-empty-state"><span class="dashboard-empty-icon"><i data-lucide="gamepad-2" aria-hidden="true"></i></span><h2>Start your game collection</h2><p>Add a game you own, or explore connected sources to find something new.</p><div class="dashboard-empty-actions"><a class="button primary" href="#add"><i data-lucide="plus" aria-hidden="true"></i> Add a game</a><a class="button secondary" href="#discover"><i data-lucide="compass" aria-hidden="true"></i> Discover games</a></div></div>`;
    const statusCount = status => dashboardItems(status, "").length;
    const sortLabel = sortList.find(([key]) => key === prefs.dashboardSort)?.[1] || "Recently updated";
    const viewLabel = views.find(([key]) => key === view)?.[1] || "List";
    const homeViewLabel = gridViews.has(view) ? "Grid" : "List";
    const groupLabel = groupList.find(([key]) => key === (prefs.dashboardGroupBy || "status"))?.[1] || "Status";
    const statusOptions = [["all", "All statuses"], ...statuses.map(status => [status, status])];
    const filteredStatusCount = status => dashboardItems(status === "all" ? null : status, libraryQuery).length;
    const sortIcons = { "updated-desc": "clock-3", "created-desc": "calendar-plus", "progress-desc": "trending-up", "progress-asc": "trending-down", "rating-desc": "star", "release-desc": "calendar-days", "alphabetical-asc": "arrow-down-wide-narrow", "alphabetical-desc": "arrow-up-wide-narrow" };
    const sortPills = `<div class="ios-pills dashboard-sort-grid"><input type="hidden" name="sort" value="${esc(prefs.dashboardSort)}">${sortList.map(([key, label]) => `<button type="button" class="dashboard-sort-option${prefs.dashboardSort === key ? " active" : ""}" data-pill-name="sort" data-pill-value="${esc(key)}" aria-pressed="${prefs.dashboardSort === key}"><i data-lucide="${sortIcons[key]}" aria-hidden="true"></i><span>${esc(label)}</span><i class="dashboard-sort-check" data-lucide="check" aria-hidden="true"></i></button>`).join("")}</div>`;
    const statusColors = { all: "var(--accent)", Playing: "var(--status-color-playing)", Backlog: "var(--status-color-backlog)", Completed: "var(--status-color-completed)", "On Hold": "var(--status-color-on-hold)", Dropped: "var(--status-color-dropped)" };
    const statusPills = `<div class="ios-pills dashboard-status-pills"><input type="hidden" name="status" value="${esc(dashboardStatusFilter)}">${statusOptions.map(([key, label]) => {
      const count = filteredStatusCount(key);
      return `<button type="button" class="ios-pill${dashboardStatusFilter === key ? " active" : ""}" data-pill-name="status" data-pill-value="${esc(key)}" aria-pressed="${dashboardStatusFilter === key}"><i class="dashboard-status-dot" style="--status-dot:${statusColors[key] || "#8b5cf6"}" aria-hidden="true"></i><span>${esc(key === "all" ? "All" : label)}</span><em>${count}</em></button>`;
    }).join("")}</div>`;
    const viewMarks = {
      list: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="4" height="4" rx="1"/><path d="M10 6h11M3 11h4v4H3zM10 13h11M3 18h4v3H3zM10 19.5h11"/></svg>`,
      "detailed-grid": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="10" rx="1.5"/><path d="M4 16h6M4 19h5M14 16h6M14 19h5"/></svg>`,
      "compact-grid": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="9.5" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><rect x="16" y="9.5" width="5" height="5" rx="1"/></svg>`,
      "large-grid": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="2.5" width="8" height="13" rx="1.5"/><rect x="13" y="2.5" width="8" height="13" rx="1.5"/><path d="M4 19h6M14 19h6"/></svg>`
    };
    const viewPills = `<div class="ios-pills dashboard-view-grid"><input type="hidden" name="view" value="${esc(view)}">${views.map(([key, label]) => `<button type="button" class="dashboard-view-option${view === key ? " active" : ""}" data-pill-name="view" data-pill-value="${esc(key)}" aria-pressed="${view === key}"><span class="dashboard-view-icon">${viewMarks[key]}</span><span class="dashboard-view-label">${esc(label)}</span><i class="dashboard-view-check" data-lucide="check" aria-hidden="true"></i></button>`).join("")}</div>`;
    const progressBar = (count, denominator) => `<i class="collection-overview-progress" aria-hidden="true"><b style="width:${denominator ? Math.min(100, Math.round(count / denominator * 100)) : 0}%"></b></i>`;
    return `<section class="search-page home-collection-page"><div class="collection-search-row"><div class="search-box collection-search" role="search"><i data-lucide="search" aria-hidden="true"></i><input id="global-search" type="search" placeholder="Search your collection" value="${esc(libraryQuery)}" autocomplete="off" aria-label="Search your collection"><button type="button" data-clear-collection-search aria-label="Clear search" ${libraryQuery ? "" : "hidden"}>×</button></div></div><div class="collection-overview" aria-label="Collection overview"><button type="button" data-quick-status="all" aria-pressed="${dashboardStatusFilter === "all"}"><strong>${allCount}<i class="collection-overview-dot dot-all" aria-hidden="true"></i></strong><span>In collection</span>${progressBar(allCount, allCount)}</button><button type="button" data-quick-status="Playing" aria-pressed="${dashboardStatusFilter === "Playing"}"><strong>${statusCount("Playing")}<i class="collection-overview-dot dot-playing" aria-hidden="true"></i></strong><span>Playing now</span>${progressBar(statusCount("Playing"), allCount)}</button><button type="button" data-quick-status="Completed" aria-pressed="${dashboardStatusFilter === "Completed"}"><strong>${statusCount("Completed")}<i class="collection-overview-dot dot-completed" aria-hidden="true"></i></strong><span>Completed</span>${progressBar(statusCount("Completed"), allCount)}</button></div><div class="collection-active-filter"><button type="button" class="collection-active-filter-summary" data-open-dashboard-filter aria-label="Open collection filters"><span class="collection-active-chip">${esc(dashboardStatusFilter === "all" ? "All statuses" : dashboardStatusFilter)}</span><span class="collection-active-meta">Sort: ${esc(sortLabel)} · ${esc(homeViewLabel)} view</span></button><div class="collection-quick-views" role="group" aria-label="Collection view"><button type="button" data-dashboard-view="list" aria-label="List view" aria-pressed="${!gridViews.has(view)}" class="${!gridViews.has(view) ? "active" : ""}">List</button><button type="button" data-dashboard-view="detailed-grid" aria-label="Detailed grid view" aria-pressed="${gridViews.has(view)}" class="${gridViews.has(view) ? "active" : ""}">Grid</button></div>${dashboardStatusFilter !== "all" ? `<button type="button" data-quick-status="all">Show all <span aria-hidden="true">×</span></button>` : ""}</div><section class="library-section"><div id="collection-results" class="dashboard-view-${esc(view)}">${groups || emptyResults}</div></section><dialog class="choice-dialog dashboard-filter-dialog" id="dashboard-filter-dialog" aria-labelledby="dashboard-filter-title"><form id="dashboard-filter-form"><div class="choice-dialog-grabber" aria-hidden="true"></div><header class="choice-dialog-header"><div><p class="settings-overline">HOME</p><h2 id="dashboard-filter-title">Filter games</h2></div><button type="button" class="choice-dialog-close" data-close-dashboard-filter aria-label="Close filter options">×</button></header><div class="ios-sheet-body">${sheetCard("Sort By", sortPills, sortLabel)}${sheetCard("Category Status", statusPills, dashboardStatusFilter === "all" ? "All statuses" : dashboardStatusFilter)}${sheetCard("View &amp; Layout", `${row("Layout", "")}${viewPills}<div class="dashboard-group-by"><span>Group by</span>${pillList("groupBy", groupList, prefs.dashboardGroupBy || "status", "segmented")}</div>`, `${viewLabel} · ${groupLabel}`)}</div><footer class="choice-dialog-actions"><button type="button" class="button secondary" data-reset-dashboard-filter>Clear filter</button><button type="submit" class="button primary">Apply filter (${total})</button></footer></form></dialog></section>`;
  };
})();
