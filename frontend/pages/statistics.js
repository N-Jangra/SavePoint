// Statistics overview in ScreenMark's layout: charts, big numbers and top lists for the current library.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const renderStatistics = context => {
    const { items = [], prefs = {}, esc } = context;
    const total = items.length;
    const status = item => String(item.status || "").toLowerCase();
    const completed = items.filter(item => status(item) === "completed");
    const playing = items.filter(item => status(item) === "playing");
    const backlog = items.filter(item => ["backlog", "upcoming"].includes(status(item)));
    const lengthOf = item => Number(item.completionTargetHours) || Number(item.goal) || Number(item.facts?.mainHours) || Number(item.facts?.averageHours) || 0;
    // A finished game with no logged hours still counts its known length, so totals stay useful after a cache reset.
    const hoursOf = item => status(item) === "completed" ? Math.max(Number(item.progress) || 0, lengthOf(item)) : Math.max(0, Number(item.progress) || 0);
    const totalHours = items.reduce((sum, item) => sum + hoursOf(item), 0);
    const hoursText = hours => `${Math.round(hours * 10) / 10}`;
    const durText = hours => { const h = Number(hours) || 0; if (h <= 0) return "0 h"; if (h < 1) return `${Math.round(h * 60)} min`; return `${hoursText(h)} h`; };
    const rated = items.filter(item => Number(item.rating) > 0);
    const ratingMax = prefs.ratingFormat === "10-point" ? 10 : 5;
    const avgRating = rated.length ? (rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length).toFixed(1) : "—";

    const chartMarkup = (rows, unit, emptyText) => {
      if (!rows.length) return `<p class="stats-reference-empty">${emptyText}</p>`;
      const maximum = rows.reduce((max, row) => Math.max(max, Number(row.value) || 0), 0);
      return `<div class="stats-reference-chart"><div class="stats-reference-bars">${rows.map(({ item, label, value }) => `<div class="stats-reference-bar"><b>${value}</b><span><i style="height:${Math.max(5, maximum ? value / maximum * 100 : 0)}%"></i></span><small title="${esc(item?.title || label)}">${esc(item?.title || label)}</small></div>`).join("")}</div><p>${unit}</p></div>`;
    };
    const bigNumberCard = (title, value, caption) => `<article class="stats-reference-card stats-reference-number"><h2>${title}</h2><strong>${value}</strong><p>${caption}</p></article>`;
    const tableCard = (title, left, right, rows, emptyText) => `<article class="stats-reference-card stats-reference-table-card"><h2>${title}</h2><div class="stats-reference-table"><div class="stats-reference-table-head"><span>${left}</span><span>${right}</span></div>${rows || `<p class="stats-reference-empty">${emptyText}</p>`}</div></article>`;

    const timeRows = items.map(item => ({ item, value: Math.round(hoursOf(item)) })).filter(row => row.value > 0).sort((a, b) => b.value - a.value).slice(0, 7);
    const statusOrder = ["Playing", "Completed", "Backlog", "Upcoming", "On Hold", "Dropped"];
    const statusRows = statusOrder.map(name => ({ label: name, value: items.filter(item => status(item) === name.toLowerCase()).length })).filter(row => row.value > 0);

    const countBy = pick => {
      const counts = new Map();
      items.forEach(item => { [...new Set(pick(item))].forEach(name => counts.set(name, (counts.get(name) || 0) + 1)); });
      return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([name, count]) => `<div class="stats-reference-table-row"><span>${esc(name)}</span><span>${count}</span></div>`).join("");
    };
    const listOf = raw => (Array.isArray(raw) ? raw : String(raw || "").split(/[,;/|]/)).map(value => String(value?.name || value || "").trim()).filter(Boolean);
    const fieldOf = (item, pattern) => item.cachedDetails?.fields?.find(field => pattern.test(String(field.label || "").trim()))?.value;
    const genreRows = countBy(item => listOf(item.facts?.genres || fieldOf(item, /^(genres?|genre)$/i) || item.cachedDetails?.genres));
    const studioRows = countBy(item => listOf(item.facts?.developers || fieldOf(item, /^(developers?|studios?|publishers?)$/i) || item.cachedDetails?.developer));
    const platformRows = countBy(item => listOf(item.platform));

    const marathons = [...items].filter(item => hoursOf(item) > 0).sort((a, b) => hoursOf(b) - hoursOf(a)).slice(0, 3);
    const marathonRows = marathons.map(item => {
      const length = lengthOf(item), percent = length ? Math.min(100, Math.round(hoursOf(item) / length * 100)) : 0;
      return `<button type="button" class="stats-reference-table-row stats-reference-marathon-row" data-open-details data-id="${esc(item.id)}"><span>${esc(item.title)}</span><span>${esc(durText(hoursOf(item)))}</span><span>${length ? `${percent}%` : "—"}</span></button>`;
    }).join("");
    const marathonPanel = `<article class="stats-reference-card stats-reference-table-card"><h2>Biggest play sessions</h2><div class="stats-reference-table stats-reference-marathon-table"><div class="stats-reference-table-head"><span>GAME</span><span>PLAYED</span><span>DONE</span></div>${marathonRows || `<p class="stats-reference-empty">Log playtime on your games to build this list.</p>`}</div></article>`;

    const board = `<div class="stats-reference-board">
      <article class="stats-reference-card stats-reference-chart-card"><h2>Time spent playing</h2>${chartMarkup(timeRows, "HOURS BY GAME", "Playtime details will appear here as you log hours on your games.")}</article>
      ${bigNumberCard("Total hours played", Math.round(totalHours).toLocaleString(), `Across ${total.toLocaleString()} ${total === 1 ? "game" : "games"} in your library`)}
      ${bigNumberCard("Games completed", completed.length.toLocaleString(), `${playing.length} playing now · ${backlog.length} waiting`)}
      ${tableCard("Top genres", "GENRE", "GAMES", genreRows, "Genres appear once your games have details.")}
      ${studioRows ? tableCard("Top studios", "STUDIO", "GAMES", studioRows, "") : tableCard("Platforms", "PLATFORM", "GAMES", platformRows, "Platforms appear once your games have one.")}
      ${marathonPanel}
      <article class="stats-reference-card stats-reference-chart-card"><h2>Games by status</h2>${chartMarkup(statusRows, "GAMES", "Add games to see how your library is spread.")}</article>
      ${bigNumberCard("Average rating", rated.length ? `${avgRating}<small>/${ratingMax}</small>` : "—", rated.length ? `From ${rated.length} rated ${rated.length === 1 ? "game" : "games"}` : "Rate completed games from their page")}
    </div>`;
    const empty = total === 0
      ? context.libraryLoading
        ? `<div class="stats-empty-state" role="status" aria-live="polite"><span aria-hidden="true">◌</span><strong>Loading your statistics…</strong><p>Your saved collection is being restored.</p></div>`
        : `<div class="stats-empty-state"><span aria-hidden="true">▥</span><strong>Your stats will appear here.</strong><p>Add games to your library to get started.</p><a href="#discover">Explore games <span aria-hidden="true">→</span></a></div>`
      : "";
    const detailedView = context.statsView === "detailed";
    const toggle = `<nav class="stats-media-tabs" role="tablist" aria-label="Statistics view"><button type="button" role="tab" aria-selected="${!detailedView}" class="${detailedView ? "" : "active"}" data-stats-view="overall">Overall</button><button type="button" role="tab" aria-selected="${detailedView}" class="${detailedView ? "active" : ""}" data-stats-view="detailed">Detailed</button></nav>`;
    // Detailed = the play-time page (hours by game, split by status); its own back header is replaced by the shared one above.
    const detailed = (window.SplitAppPages.statisticsDetailed?.(context) || "").replace(/<header class="detail-page-heading analytics-page-heading">[\s\S]*?<\/header>/, "");
    const heading = `<header class="detail-page-heading analytics-page-heading"><button type="button" class="detail-back" data-go="profile"><span aria-hidden="true">‹</span> Profile</button><strong>Statistics</strong><span class="stats-subpage-badge">${total} ${total === 1 ? "GAME" : "GAMES"}</span></header>`;
    return `<section class="stats-page"><section class="stats-overview">${heading}${toggle}${total ? (detailedView ? `<div class="stats-detailed-view">${detailed}</div>` : board) : ""}</section>${empty}</section>`;
  };

  // The page is a pure function of the library and a few preferences, so identical inputs reuse the previous HTML.
  let cache = { key: "", html: "" };
  window.SplitAppPages.statistics = context => {
    if (context.dataRevision === undefined) return renderStatistics(context);
    const key = [context.dataRevision, context.items.length, context.history?.length || 0, new Date().toDateString(), JSON.stringify(context.prefs || {}), context.statsView, JSON.stringify(context.statsLimits || null), context.statsRange].join("|");
    if (cache.key !== key) cache = { key, html: renderStatistics(context) };
    return cache.html;
  };
})();
