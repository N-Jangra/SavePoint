// CueMark-inspired activity timeline, backed by SavePoint's saved history.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.timeline = context => {
    const { config, history, items = [], esc, timelineFilter = "all", timelineSearch = "", timelineMonth = "", timelineYear = "" } = context;
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const configuredStatuses = (config?.categories || []).flatMap(category => category.statuses || []);
    const visibleStatuses = new Set(configuredStatuses.length ? configuredStatuses : ["Backlog", "Playing", "Completed", "On Hold", "Dropped"]);
    const historyEntryIndex = new Map(history.map((entry, index) => [entry, index]));
    const yearOptions = [...new Set(history.map(entry => new Date(entry.at || 0).getFullYear()).filter(year => year > 1970))].sort((a, b) => b - a);
    const entries = history.filter(entry => {
      const status = entry.status || entry.action;
      if (!visibleStatuses.has(status)) return false;
      const at = Number(entry.at) || Date.parse(entry.at) || 0;
      const date = new Date(at);
      if (timelineFilter === "week" && at < weekStart) return false;
      if (timelineFilter === "month" && at < monthStart) return false;
      if (timelineSearch && !String(entry.title || "").toLowerCase().includes(timelineSearch.toLowerCase())) return false;
      if (timelineMonth !== "" && date.getMonth() !== Number(timelineMonth)) return false;
      if (timelineYear && date.getFullYear() !== Number(timelineYear)) return false;
      return true;
    }).sort((a, b) => (Number(b.at) || Date.parse(b.at) || 0) - (Number(a.at) || Date.parse(a.at) || 0)).slice(0, 120);
    const groups = new Map();
    entries.forEach(entry => {
      const date = new Date(Number(entry.at) || Date.parse(entry.at) || Date.now());
      const key = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ entry, date });
    });
    const statusIcons = { Backlog: "▤", Dropped: "↓", Completed: "✓", "On Hold": "Ⅱ", Playing: "▶" };
    const findGame = entry => items.find(row => String(row.id) === String(entry.itemId)) || items.find(row => String(row.title).toLowerCase() === String(entry.title || "").toLowerCase());
    const cards = [...groups].map(([month, records]) => `<section class="timeline-month-group"><div class="timeline-month-marker"><span class="timeline-month-dot"></span><h2 class="timeline-month-title">${esc(month)}</h2><span class="timeline-month-count">${records.length}</span></div><div class="timeline-month-items">${records.map(({ entry, date }) => {
      const status = entry.status || entry.action;
      const game = findGame(entry);
      const localArt = game?.localThumbnailData
        || game?.localImageData?.image
        || game?.localImageData?.["cachedDetails.portraitImage"]
        || game?.localImageData?.["cachedDetails.image"]
        || entry.localThumbnailData
        || entry.localImageData?.image
        || "";
      const onlineArt = game?.cachedDetails?.portraitImage || game?.cachedDetails?.image || game?.image
        || entry.cachedDetails?.portraitImage || entry.cachedDetails?.image || entry.image || "";
      const art = localArt || onlineArt;
      const remoteArt = /^https?:\/\//i.test(onlineArt) ? onlineArt : "";
      const initialArt = localArt || (remoteArt ? "" : onlineArt);
      const itemId = game?.id || entry.itemId || "";
      const thumbItemId = itemId ? `data-timeline-item-id="${esc(itemId)}"` : "";
      const historyIndex = historyEntryIndex.get(entry) ?? -1;
      const thumbHistoryIndex = historyIndex >= 0 ? `data-timeline-history-index="${historyIndex}"` : "";
      const thumb = art
        ? `<span class="timeline-item-thumb has-art" ${thumbItemId} ${thumbHistoryIndex}><img data-timeline-art data-timeline-item-id="${esc(itemId)}" ${thumbHistoryIndex}${initialArt ? ` src="${esc(initialArt)}"` : ""}${remoteArt && remoteArt !== localArt ? ` data-online-fallback="${esc(remoteArt)}"` : ""} alt="" loading="lazy" decoding="async"><b class="timeline-status-dot" aria-label="${esc(status)}">${statusIcons[status] || "•"}</b></span>`
        : `<span class="timeline-item-thumb" ${thumbItemId} ${thumbHistoryIndex} aria-hidden="true">${statusIcons[status] || "•"}</span>`;
      return `<article class="timeline-item">${thumb}<div class="timeline-item-content"><strong class="timeline-item-text">${esc(entry.title || "Untitled")}</strong><span class="timeline-item-meta">${esc(status)} · ${esc(window.SplitAppDates.withWeekday(date))}</span></div></article>`;
    }).join("")}</div></section>`).join("");
    const hasAdvancedFilter = timelineSearch || timelineMonth !== "" || timelineYear;
    return `<section class="timeline-page"><header class="detail-page-heading analytics-page-heading"><button type="button" class="detail-back" data-go="dashboard"><span aria-hidden="true">‹</span> Back</button><strong>Timeline</strong><span class="detail-heading-spacer" aria-hidden="true"></span></header><div class="timeline-filters" role="group" aria-label="Filter activity by date"><button type="button" class="date-filter-btn ${timelineFilter === "all" ? "active" : ""}" data-timeline-filter="all" aria-pressed="${timelineFilter === "all"}">All time</button><button type="button" class="date-filter-btn ${timelineFilter === "week" ? "active" : ""}" data-timeline-filter="week" aria-pressed="${timelineFilter === "week"}">This week</button><button type="button" class="date-filter-btn ${timelineFilter === "month" ? "active" : ""}" data-timeline-filter="month" aria-pressed="${timelineFilter === "month"}">This month</button><button type="button" class="timeline-filter-icon-btn ${hasAdvancedFilter ? "active" : ""}" data-open-timeline-filters aria-label="More timeline filters" aria-controls="timeline-filter-dialog" aria-haspopup="dialog" aria-pressed="${Boolean(hasAdvancedFilter)}" title="More filters"><i data-lucide="sliders-horizontal" aria-hidden="true"></i></button></div><div class="timeline-summary"><div><span class="timeline-eyebrow">YOUR LIBRARY</span><h2>Recent activity</h2><p>Status changes across your collection.</p></div><span class="timeline-total">${entries.length} ${entries.length === 1 ? "event" : "events"}</span></div>${entries.length ? `<div class="timeline">${cards}</div>` : `<div class="timeline-empty"><span class="timeline-empty-icon" aria-hidden="true">◷</span><h3>${history.length ? "No status changes found" : "Your timeline starts here"}</h3><p>${history.length ? "Try another date range or clear your filters." : "Changes to game status will appear here."}</p></div>`}</section><dialog class="choice-dialog timeline-filter-dialog" id="timeline-filter-dialog" aria-labelledby="timeline-filter-title"><form method="dialog"><div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">ACTIVITY</p><h2 id="timeline-filter-title">Filter timeline</h2></div><button type="submit" class="choice-dialog-close" value="cancel" aria-label="Close filters">×</button></header><div class="timeline-filter-fields"><label>Search by title<input name="timeline-search" data-timeline-search type="search" value="${esc(timelineSearch)}" placeholder="Search games"></label><label>Month<select name="timeline-month" data-timeline-month><option value="">Any month</option>${Array.from({ length: 12 }, (_, index) => `<option value="${index}" ${String(index) === String(timelineMonth) ? "selected" : ""}>${new Date(2020, index, 1).toLocaleDateString(undefined, { month: "long" })}</option>`).join("")}</select></label><label>Year<select name="timeline-year" data-timeline-year><option value="">Any year</option>${yearOptions.map(year => `<option value="${year}" ${String(year) === String(timelineYear) ? "selected" : ""}>${year}</option>`).join("")}</select></label></div><footer class="choice-dialog-actions"><button type="button" class="button secondary" data-clear-timeline-filters>Clear</button><button type="submit" class="button primary" value="apply">Apply filters</button></footer></form></dialog>`;
  };
})();
