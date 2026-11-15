// My games: the full library in ScreenMark's collection layout (poster grid / list, search, filters, share).
// The grid is windowed (see mountVirtualGrids in app.js), so thousands of games scroll like a handful.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const collator = new Intl.Collator(undefined, { sensitivity: "base" });
  const virtualSources = new Map();
  const lowerTitles = new WeakMap();
  const lowerTitle = item => { let value = lowerTitles.get(item); if (value === undefined) { value = String(item.title || "").toLocaleLowerCase(); lowerTitles.set(item, value); } return value; };
  let lastRows = [];
  const SORTS = [["alpha", "Alphabetical"], ["recent", "Recently added"], ["played", "Most played"], ["rating", "Top rated"], ["updated", "Recently updated"]];
  const VIEWS = [["grid", "Posters", "layout-grid"], ["large", "Large", "square"], ["list", "List", "list"]];
  const VIRTUAL_MIN = 60;
  const statusOrder = ["Playing", "Backlog", "Upcoming", "On Hold", "Completed", "Dropped"];
  const hoursOf = item => Math.max(0, Number(item?.progress) || 0);
  const goalOf = item => Math.max(0, Number(item?.goal) || 0, Number(item?.completionTargetHours) || 0);
  const sorters = {
    alpha: (a, b) => collator.compare(a.title || "", b.title || ""),
    recent: (a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0) || collator.compare(a.title || "", b.title || ""),
    played: (a, b) => hoursOf(b) - hoursOf(a) || collator.compare(a.title || "", b.title || ""),
    rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || collator.compare(a.title || "", b.title || ""),
    updated: (a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0) || collator.compare(a.title || "", b.title || "")
  };
  // Sorting 10k+ games is only redone when the library or the sort changes.
  let sortCache = { items: null, revision: null, key: "", rows: [] };
  let facetCache = { items: null, revision: null, status: "", value: null };
  function filterFacets(items, revision, statusFilter) {
    if (facetCache.items === items && facetCache.revision === revision && facetCache.status === statusFilter && facetCache.value) return facetCache.value;
    const statuses = [...new Set([...statusOrder, ...items.map(item => item.status).filter(Boolean)])].filter(status => items.some(item => item.status === status));
    const tagScope = statusFilter === "all" ? items : items.filter(item => item.status === statusFilter);
    const tags = [...new Set(tagScope.flatMap(tagsOf))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    const platformCounts = new Map();
    items.forEach(item => platformsOf(item).forEach(name => platformCounts.set(name, (platformCounts.get(name) || 0) + 1)));
    const platforms = [...platformCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 14).map(([name]) => name);
    const value = { statuses, tags, platforms };
    facetCache = { items, revision, status: statusFilter, value };
    return value;
  }
  function sortedItems(items, sort, revision) {
    if (sortCache.items === items && sortCache.revision === revision && sortCache.key === sort) return sortCache.rows;
    sortCache = { items, revision, key: sort, rows: [...items].sort(sorters[sort] || sorters.alpha) };
    return sortCache.rows;
  }
  const platformsOf = item => [...new Set(String(item.platform || "").split(/[,/|]/).map(value => value.trim()).filter(Boolean))];
  const tagsCache = new WeakMap();
  const tagsOf = item => {
    if (!item || typeof item !== "object") return [];
    let tags = tagsCache.get(item);
    if (tags) return tags;
    const asNames = value => (Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,;|]/) : [])
      .map(tag => typeof tag === "string" ? tag : tag?.name || tag?.label || "")
      .map(tag => String(tag).trim()).filter(Boolean);
    const details = item.cachedDetails || {}, facts = item.facts || {};
    tags = [...new Set([...asNames(item.tags), ...asNames(item.categories), ...asNames(item.genres), ...asNames(item.genre), ...asNames(details.tags), ...asNames(facts.tags)])];
    tagsCache.set(item, tags);
    return tags;
  };
  const tagKey = value => String(value || "").trim().toLocaleLowerCase();
  function filterRows(context) {
    const state = context.libraryState || {};
    const needle = String(state.query || "").trim().toLocaleLowerCase();
    const sort = sorters[state.sort] ? state.sort : "alpha";
    const platform = String(state.platform || "all"), status = String(state.status || "all");
    const tag = tagKey(state.tag);
    return sortedItems(context.items || [], sort, context.dataRevision).filter(item =>
      (status === "all" || item.status === status)
      && (platform === "all" || platformsOf(item).some(value => value.toLocaleLowerCase() === platform.toLocaleLowerCase()))
      && (!state.favorites || item.favorite)
      && (!tag || tagsOf(item).some(value => tagKey(value) === tag))
      && (!needle || lowerTitle(item).includes(needle)));
  }
  function tileFor(item, view, esc) {
    const { imgMarkup, posterButton } = window.SplitAppPages.profileArt;
    const goal = goalOf(item), hours = hoursOf(item), done = String(item.status).toLowerCase() === "completed";
    const percent = done ? 100 : goal ? Math.min(100, Math.round(hours / goal * 100)) : 0;
    if (view !== "list") return posterButton(item, esc);
    const meta = [item.platform, item.status].filter(Boolean).join(" · ");
    return `<button type="button" class="library-row" data-open-details data-action="details" data-id="${esc(item.id)}" aria-label="Open ${esc(item.title)}"><span class="library-row-art">${imgMarkup(item, esc)}</span><span class="library-row-copy"><strong>${esc(item.title)}${item.favorite ? ' <i class="library-row-heart" aria-label="Favorite">♥</i>' : ""}</strong><small>${esc(meta)}</small><span class="library-row-bar" data-status="${esc(String(item.status || "").toLowerCase().replace(/\s+/g, "-"))}"><i style="width:${percent}%"></i></span></span><span class="library-row-hours">${goal ? `${Math.round(hours * 10) / 10}/${Math.round(goal * 10) / 10} h` : `${Math.round(hours * 10) / 10} h`}</span></button>`;
  }
  window.SplitAppPages.library = context => {
    const { items = [], esc, libraryStatusGroups = false } = context;
    const state = context.libraryState || {};
    const routeStatus = String(context.libraryStatus || "");
    const statusFilter = routeStatus || state.status || "all";
    const view = VIEWS.some(([key]) => key === state.view) ? state.view : "grid";
    virtualSources.clear();
    const rows = filterRows({ ...context, libraryState: { ...state, status: statusFilter, favorites: false } });
    lastRows = rows;
    const { statuses, tags, platforms } = filterFacets(items, context.dataRevision, statusFilter);
    const sortKey = sorters[state.sort] ? state.sort : "alpha", sortLabel = SORTS.find(([key]) => key === sortKey)[1];
    // A status route is a collection page (Playing, Backlog, etc.), not an
    // extra filter layered over the collection. Alphabetical is the neutral
    // default, so keep the compact Filters control until a custom sort or
    // another optional filter is actually selected.
    const filtersApplied = sortKey !== "alpha" || (state.platform && state.platform !== "all") || Boolean(state.tag) || Boolean(state.favorites);
    const viewDef = VIEWS.find(([key]) => key === view);
    const chip = (name, value, label, current) => `<button type="button" class="library-chip${current === value ? " active" : ""}" data-library-${name}="${esc(value)}" aria-pressed="${current === value}">${esc(label)}</button>`;
    const libraryTitle = statusFilter === "all" ? "All games" : statusFilter === "Completed" ? "Completed games" : statusFilter;
    const dialog = `<dialog class="choice-dialog profile-filter-dialog library-filter-dialog" id="library-filter-dialog"><div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">${esc(libraryTitle.toUpperCase())}</p><h2>Filters</h2></div><button type="button" class="choice-dialog-close" data-library-filter-close aria-label="Close">×</button></header><div class="library-filter-body"><section><h3>Sort by</h3><div class="library-chips">${SORTS.map(([key, label]) => chip("sort", key, label, sortKey)).join("")}</div></section>${statusFilter === "all" ? `<section><h3>Status</h3><div class="library-chips">${chip("status", "all", "All", statusFilter)}${statuses.map(status => chip("status", status, status, statusFilter)).join("")}</div></section>` : ""}${platforms.length ? `<section><h3>Platform</h3><div class="library-chips">${chip("platform", "all", "All", state.platform || "all")}${platforms.map(name => chip("platform", name, name, state.platform || "all")).join("")}</div></section>` : ""}${tags.length ? `<section><h3>Tags</h3><div class="library-chips">${chip("tag", "", "All tags", state.tag || "")}${tags.map(name => chip("tag", name, name, state.tag || "")).join("")}</div></section>` : ""}</div><footer class="choice-dialog-actions library-filter-actions"><button type="button" class="button secondary" data-library-reset>Reset</button><button type="button" class="button primary" data-library-filter-close>Show ${rows.length} ${rows.length === 1 ? "game" : "games"}</button></footer></dialog>`;
    let content;
    const gridFor = (list, group = "library") => {
      if (list.length < VIRTUAL_MIN) return `<div class="profile-collection-grid library-grid is-${view}">${list.map(item => tileFor(item, view, esc)).join("")}</div>`;
      const id = group === "library" ? "library" : `library-${group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
      virtualSources.set(id, { count: list.length, tile: index => tileFor(list[index], view, esc) });
      return `<div class="profile-collection-grid library-grid is-virtual is-${view}" data-virtual-grid="${esc(id)}" data-virtual-total="${list.length}"${view === "list" ? ' data-virtual-row="74"' : ""} aria-label="${list.length} ${esc(group)} games"></div>`;
    };
    if (!rows.length) {
      const restoring = Boolean(context.libraryLoading);
      content = restoring
        ? `<div class="profile-empty profile-list-empty" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><strong>Loading your games…</strong><span>Your saved collection is being restored.</span></div>`
        : `<div class="profile-empty profile-list-empty"><i data-lucide="library" aria-hidden="true"></i><strong>${items.length ? "No games match" : "No games yet"}</strong><span>${items.length ? "Change the search or the filters." : "Add games from Explore, or add one manually from your profile."}</span>${items.length ? "" : '<button type="button" data-go="discover">Explore games</button>'}</div>`;
    } else if (libraryStatusGroups && statusFilter === "all") {
      const ordered = [...statusOrder.filter(status => status !== "Completed"), "Completed"];
      const groups = ordered.map(status => ({ status, rows: rows.filter(item => item.status === status) })).filter(group => group.rows.length);
      content = groups.length ? `<div class="profile-status-groups library-status-groups">${groups.map(group => `<section class="profile-status-group library-status-group"><h3>${esc(group.status)} <span>${group.rows.length}</span></h3>${gridFor(group.rows, group.status)}</section>`).join("")}</div>` : "";
    } else content = gridFor(rows);
    const filterControl = filtersApplied
      ? `<footer class="profile-filter-bar"><button type="button" class="profile-filter-icon" data-library-filters aria-label="Open filters"><i data-lucide="sliders-horizontal" aria-hidden="true"></i></button><button type="button" class="profile-sort-pill" data-library-filters aria-label="Sort by ${esc(sortLabel)}">${esc(sortLabel)} <i data-lucide="chevron-down" aria-hidden="true"></i></button><button type="button" class="profile-filter-reset" data-library-reset aria-label="Reset filters">Reset</button></footer>`
      : `<button type="button" class="profile-filter-pill" data-library-filters><i data-lucide="sliders-horizontal" aria-hidden="true"></i><span>Filters</span></button>`;
    const groupingToggle = statusFilter === "all"
      ? `<button type="button" class="profile-visibility-toggle${libraryStatusGroups ? " is-active" : ""}" data-library-groups aria-label="${libraryStatusGroups ? "Show all games in one grid" : "Group games by status"}" aria-pressed="${libraryStatusGroups}"><i data-lucide="eye" aria-hidden="true"></i></button>`
      : "";
    return `<section class="profile-page profile-list-page library-page"><header class="profile-list-header"><button type="button" data-go="profile" aria-label="Back to profile"><i data-lucide="chevron-left" aria-hidden="true"></i></button><h2>${esc(libraryTitle)}</h2><div class="profile-list-header-actions">${groupingToggle}<button type="button" class="profile-visibility-toggle" data-library-view data-view="${view}" aria-label="${viewDef[1]} view. Tap to change layout"><i data-lucide="${viewDef[2]}" aria-hidden="true"></i></button><button type="button" class="profile-visibility-toggle" data-library-share aria-label="Share this list"${rows.length ? "" : " disabled"}><i data-lucide="share-2" aria-hidden="true"></i></button></div></header><label class="profile-collection-search library-search"><i data-lucide="search" aria-hidden="true"></i><input type="search" data-library-search value="${esc(state.query || "")}" placeholder="Search ${libraryTitle.toLowerCase()}" autocomplete="off" aria-label="Search ${libraryTitle.toLowerCase()}"></label>${content}${filterControl}${dialog}</section>`;
  };
  window.SplitAppPages.virtualGrid = id => { const source = virtualSources.get(id); return source ? { count: source.count, tile: source.tile } : null; };
  window.SplitAppPages.libraryRows = () => lastRows;
  window.SplitAppPages.libraryViews = VIEWS.map(([key]) => key);
})();
