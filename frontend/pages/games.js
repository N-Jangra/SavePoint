// Games home: Ongoing (playing now) and Upcoming (announced / unreleased) in ScreenMark's watchlist layout.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const hoursText = value => `${Math.round((Number(value) || 0) * 10) / 10}`;
  const statusOf = item => String(item?.status || "").toLowerCase();
  const ongoingOf = items => items.filter(item => statusOf(item) === "playing").sort((a, b) => (Number(b.lastProgressAt) || Number(b.updatedAt) || 0) - (Number(a.lastProgressAt) || Number(a.updatedAt) || 0));
  // Upcoming = games you plan to play: announced (Upcoming) and waiting in the backlog. Dropped / On Hold / Completed never show here.
  const upcomingOf = items => items.filter(item => ["upcoming", "backlog"].includes(statusOf(item))).sort((a, b) => {
    const rank = item => statusOf(item) === "upcoming" ? 0 : 1;
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    const left = Date.parse(a.releaseDate || "") || Infinity, right = Date.parse(b.releaseDate || "") || Infinity;
    return left - right || String(a.title || "").localeCompare(String(b.title || ""), undefined, { sensitivity: "base" });
  });
  const releaseLabel = item => {
    const stamp = Date.parse(item.releaseDate || "");
    if (stamp > 0) {
      const days = Math.ceil((stamp - Date.now()) / 86400000);
      return days <= 0 ? "Out now" : days === 1 ? "Tomorrow" : days < 60 ? `${days} days` : new Date(stamp).toLocaleDateString(undefined, { month: "short", year: "numeric" });
    }
    return item.year ? String(item.year).slice(0, 4) : "TBD";
  };
  const upcomingLabel = item => statusOf(item) === "backlog" ? "Backlog" : releaseLabel(item);
  function gameCard(item, esc, view, upcoming) {
    const art = window.SplitAppPages.profileArt;
    const goal = Math.max(0, Number(item.goal) || 0, Number(item.completionTargetHours) || 0), hours = Math.max(0, Number(item.progress) || 0);
    const percent = goal ? Math.min(100, Math.round(hours / goal * 100)) : 0;
    const year = item.year ? ` (${esc(String(item.year).slice(0, 4))})` : "";
    const open = `data-watchlist-open="${esc(item.id)}" role="button" tabindex="0" aria-label="Open details for ${esc(item.title)}"`;
    const check = upcoming
      ? (statusOf(item) === "backlog"
        ? `<button type="button" class="watchlist-check" data-games-start="${esc(item.id)}" aria-label="Start playing ${esc(item.title)}" title="Move to Ongoing">+</button>`
        : `<span class="watchlist-airdate">${esc(upcomingLabel(item))}</span>`)
      : `<button type="button" class="watchlist-check" data-action="progress" data-id="${esc(item.id)}" aria-label="Add playtime to ${esc(item.title)}" title="Add playtime">+</button>`;
    const thumb = art.imgMarkup(item, esc);
    const platform = item.platform ? esc(item.platform) : "";
    if (view === "cards") {
      const land = art.imgMarkup(item, esc, { landscape: true });
      const label = upcoming ? upcomingLabel(item).toUpperCase() : `PLAYING \u00b7 ${percent}%`;
      const sub = upcoming ? (statusOf(item) === "backlog" ? "Waiting in your backlog" : "Not released yet") : (goal ? `${hoursText(hours)} / ${hoursText(goal)} h played` : `${hoursText(hours)} h played`);
      return `<article class="watchlist-card is-card-view${upcoming ? " is-upcoming" : ""}" data-watchlist-root="${esc(item.id)}" ${open}><div class="watchlist-card-art">${land}</div><div class="watchlist-card-shade"></div><div class="watchlist-card-top"><span>${esc(label)}</span>${platform ? `<small>${platform}</small>` : ""}</div><div class="watchlist-card-copy"><strong>${esc(item.title)}</strong><span>${esc(sub)}</span></div>${check}<span class="watchlist-card-progress"><i style="width:${upcoming ? 0 : percent}%"></i></span></article>`;
    }
    if (view === "posters") {
      const count = upcoming ? "" : `<span class="watchlist-poster-progress-count">${goal ? `${hoursText(hours)} / ${hoursText(goal)} h` : `${hoursText(hours)} h`}</span><span class="watchlist-poster-progress"><i class="${percent >= 100 ? "is-done" : ""}" style="width:${percent}%"></i></span>`;
      return `<article class="watchlist-card is-poster-view${upcoming ? " is-upcoming" : ""}" data-watchlist-root="${esc(item.id)}" ${open}><div class="watchlist-thumb">${thumb}</div><span class="watchlist-poster-shade" aria-hidden="true"></span><span class="watchlist-poster-episode${upcoming ? " is-upcoming" : ""}">${esc(upcoming ? releaseLabel(item) : platform || "GAME")}</span><span class="watchlist-poster-title">${esc(item.title)}</span>${count}${check}</article>`;
    }
    const line = upcoming ? (platform || (statusOf(item) === "backlog" ? "In your backlog" : "Upcoming release")) : (goal ? `${hoursText(hours)} / ${hoursText(goal)} h played` : `${hoursText(hours)} h played`);
    const sub = upcoming ? (statusOf(item) === "backlog" ? "Backlog" : "Not released yet") : [platform, `${percent}%`].filter(Boolean).join(" · ");
    return `<article class="watchlist-card${upcoming ? " is-upcoming" : ""}" data-watchlist-root="${esc(item.id)}" ${open}><div class="watchlist-thumb">${thumb}</div><div class="watchlist-copy"><button type="button" class="watchlist-series-tag" data-open-details data-action="details" data-id="${esc(item.id)}">${esc(item.title)}${year} ›</button><strong>${esc(line)}</strong><span>${esc(sub)}</span></div>${check}</article>`;
  }
  // Long lists (a big backlog) are shown in batches with "Show more", so the page stays light.
  const BATCH = 60, shownByTab = new Map();
  window.SplitAppPages.gamesShowMore = tab => shownByTab.set(tab, (shownByTab.get(tab) || BATCH) + BATCH);
  window.SplitAppPages.gamesResetShown = () => shownByTab.clear();
  window.SplitAppPages.games = context => {
    const { items = [], esc, gamesTab = "ongoing", gamesView = "list" } = context;
    const tab = gamesTab === "upcoming" ? "upcoming" : "ongoing";
    const view = ["list", "posters", "cards"].includes(gamesView) ? gamesView : "list";
    const ongoing = ongoingOf(items), upcoming = upcomingOf(items), rows = tab === "upcoming" ? upcoming : ongoing;
    const viewIcon = view === "list" ? "list" : view === "posters" ? "layout-grid" : "rectangle-horizontal", viewLabel = view === "list" ? "List" : view === "posters" ? "Posters" : "Cards";
    const toggle = `<button type="button" class="watchlist-view-toggle" data-games-view aria-label="Current view: ${viewLabel}. Tap to change view" title="${viewLabel} view · tap to cycle"><i data-lucide="${viewIcon}" aria-hidden="true"></i></button>`;
    const heading = `<div class="watchlist-section-heading"><span class="watchlist-section-heading-spacer" aria-hidden="true"></span><h3>${tab === "upcoming" ? "Backlog" : "Playing now"}</h3>${toggle}</div>`;
    const restoring = Boolean(context.libraryLoading);
    const emptyTitle = restoring ? "Loading your games…" : tab === "upcoming" ? "Backlog is empty" : "Nothing in progress";
    const emptyHint = restoring ? "Your saved collection is being restored." : tab === "upcoming" ? "Games in your backlog (and upcoming releases) wait here. Tap + to move one to Ongoing." : "Start a game and mark it Playing to keep it right here.";
    const empty = `<div class="watchlist-empty"${restoring ? ' role="status" aria-live="polite"' : ""}><span class="watchlist-empty-illustration"><i data-lucide="${restoring ? "loader-circle" : tab === "upcoming" ? "calendar-clock" : "gamepad-2"}" aria-hidden="true"></i></span><h2>${emptyTitle}</h2><p>${emptyHint}</p>${restoring ? "" : '<button type="button" data-go="discover">Explore games</button>'}</div>`;
    const hasRows = rows.length > 0;
    return `<section class="watchlist-page games-page${hasRows ? "" : " is-empty"}"><header class="watchlist-tabs" role="tablist"><button type="button" class="${tab === "ongoing" ? "active" : ""}" data-games-tab="ongoing" role="tab" aria-selected="${tab === "ongoing"}">Ongoing</button><button type="button" class="${tab === "upcoming" ? "active" : ""}" data-games-tab="upcoming" role="tab" aria-selected="${tab === "upcoming"}">Backlog</button></header><main class="watchlist-content${hasRows ? ` is-${view}` : " is-empty"}">${hasRows ? `<section class="watchlist-section">${heading}${rows.slice(0, shownByTab.get(tab) || BATCH).map(item => gameCard(item, esc, view, tab === "upcoming")).join("")}${rows.length > (shownByTab.get(tab) || BATCH) ? `<button type="button" class="watchlist-browse" data-games-more="${tab}">Show more · ${Math.min(BATCH, rows.length - (shownByTab.get(tab) || BATCH))} of ${rows.length - (shownByTab.get(tab) || BATCH)} remaining</button>` : ""}</section>` : empty}</main>${hasRows ? `<button type="button" class="watchlist-browse" data-go="library">Browse all games</button>` : ""}</section>`;
  };
})();
