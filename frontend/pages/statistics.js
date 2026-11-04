// Collection health and activity summaries for the current SavePoint library.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.statistics = context => {
    const { items, history, config, prefs = {}, esc, statsRange = "week", statsSubpage = "", statsActivityDate = "" } = context;
    const statisticsInBottomBar = prefs.navBar?.visible?.statistics !== false;
    const statisticsBack = statisticsInBottomBar
      ? `<span class="detail-heading-spacer" aria-hidden="true"></span>`
      : `<button type="button" class="detail-back" data-go="explore"><span aria-hidden="true">‹</span> Back</button>`;
    const total = items.length;
    const completed = items.filter(item => String(item.status).toLowerCase() === "completed").length;
    const active = items.filter(item => ["playing", "in progress"].includes(String(item.status).toLowerCase())).length;
    const queued = items.filter(item => ["backlog", "queued", "watchlist", "to play"].includes(String(item.status).toLowerCase())).length;
    const completionRate = total ? Math.round(completed / total * 100) : 0;
    const rated = items.filter(item => Number(item.rating) > 0);
    const ratingMax = prefs.ratingFormat === "10-point" ? 10 : 5;
    const avgRating = rated.length ? (rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length).toFixed(1) : "—";
    const gameArtwork = item => {
      const artwork = item.localThumbnailData || item.image;
      const localPending = !item.localThumbnailData && Boolean(item.thumbnailPath || item.localImageFiles?.length);
      const showArtwork = Boolean(artwork || localPending);
      return `<span class="stats-game-art">${showArtwork ? `<img data-deferred-image data-lazy-src="${esc(artwork || "")}"${localPending ? ` data-local-item-id="${esc(item.id)}"` : ""} alt="" loading="lazy" decoding="async" fetchpriority="low" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<i data-lucide="gamepad-2" aria-hidden="true"${showArtwork ? " hidden" : ""}></i></span>`;
    };
    const sortedRated = [...rated].sort((a, b) => Number(b.rating) - Number(a.rating));
    const allRatingRows = sortedRated.map(item => `<button type="button" class="stats-rated-entry" data-open-details data-id="${esc(item.id)}">${gameArtwork(item)}<span class="stats-rated-copy"><strong>${esc(item.title)}</strong><small>${esc(item.status || "In your library")}</small></span><span class="stats-rated-score" aria-label="${Number(item.rating)} out of ${ratingMax}">${ratingMax === 5 ? "★".repeat(Math.min(5, Math.max(0, Math.round(Number(item.rating))))).padEnd(5, "☆") : `${Number(item.rating)}/${ratingMax}`}<small>${Number(item.rating)}</small></span></button>`).join("");
    const unrated = items.filter(item => !(Number(item.rating) > 0));
    const quickRateRows = unrated.map(item => `<div class="stats-unrated-entry">${gameArtwork(item)}<span class="stats-rated-copy"><strong>${esc(item.title)}</strong><small>${esc(item.status || "In your library")} · Choose a score</small></span><span class="stats-quick-rate" role="group" aria-label="Rate ${esc(item.title)}">${Array.from({ length: ratingMax }, (_, index) => index + 1).map(score => `<button type="button" data-stats-rating="${esc(item.id)}" data-score="${score}" aria-label="Rate ${score} out of ${ratingMax}">${ratingMax === 5 ? "★" : score}</button>`).join("")}</span></div>`).join("");
    const lengthOf = item => Number(item.completionTargetHours)
      || Number(item.facts?.[item.completionTarget])
      || (String(item.status).toLowerCase() === "completed" ? Number(item.goal) : 0)
      || Number(item.facts?.mainHours) || Number(item.facts?.averageHours) || 0;
    // Older saves may have a Completed status but no progress value. Count a
    // known target as finished so the totals stay useful after a cache reset.
    const loggedOf = item => Number(item.progress) || (String(item.status).toLowerCase() === "completed" ? lengthOf(item) : 0);
    const humanReadable = prefs.humanReadableStats === true;
    const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
    const rawHours = value => `${value >= 100 ? Math.round(value) : Math.round(value * 10) / 10} h`;
    const formatHours = value => {
      if (!humanReadable) return rawHours(value);
      let hours = Math.max(0, Math.round(Number(value) || 0));
      const months = Math.floor(hours / 720); hours %= 720;
      const days = Math.floor(hours / 24); hours %= 24;
      const parts = [];
      if (months) parts.push(plural(months, "month"));
      if (days) parts.push(plural(days, "day"));
      if (hours || !parts.length) parts.push(plural(hours, "hour"));
      return parts.join(" ");
    };
    const hoursText = formatHours;
    const targetCurrency = prefs.currencyDisplay === "INR" ? "INR" : "USD";
    const usdToInrRate = Math.max(0.01, Number(prefs.usdToInrRate) || 94.8);
    const formatMoney = value => {
      if (!value) return "—";
      const symbol = targetCurrency === "INR" ? "₹" : "$";
      if (!humanReadable) return `${symbol}${new Intl.NumberFormat(targetCurrency === "INR" ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
      const amount = Math.abs(value);
      if (targetCurrency === "INR" && amount >= 100_000) return `${symbol}${(value / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
      if (amount >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
      if (amount >= 1_000) return `${symbol}${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
      return `${symbol}${value.toFixed(2)}`;
    };
    const finished = item => ["completed", "dropped"].includes(String(item.status).toLowerCase());
    const known = items.filter(item => lengthOf(item) > 0);
    const unknownOpen = items.filter(item => lengthOf(item) === 0 && !finished(item));
    const loggedHours = items.reduce((sum, item) => sum + loggedOf(item), 0);
    const knownHours = known.reduce((sum, item) => sum + lengthOf(item), 0);
    const knownPlayed = known.reduce((sum, item) => sum + Math.min(loggedOf(item), lengthOf(item)), 0);
    const remainingHours = known.filter(item => !finished(item)).reduce((sum, item) => sum + Math.max(0, lengthOf(item) - loggedOf(item)), 0);
    const priceCurrency = item => item.facts?.priceCurrency || (/₹|\bINR\b|\bRs\.?/i.test(item.facts?.price || "") ? "INR" : /€|\bEUR\b/.test(item.facts?.price || "") ? "EUR" : /£|\bGBP\b/.test(item.facts?.price || "") ? "GBP" : /\b[A-Z]{3}\b/.test(item.facts?.price || "") ? (item.facts.price.match(/\b[A-Z]{3}\b/) || [""])[0] : "USD");
    const displayPrice = item => {
      const value = Number(item.facts?.priceValue) || 0, source = priceCurrency(item);
      if (source === "USD" && targetCurrency === "INR") return value * usdToInrRate;
      if (source === "INR" && targetCurrency === "USD") return value / usdToInrRate;
      return value;
    };
    const libraryValue = items.reduce((sum, item) => sum + displayPrice(item), 0);
    const missingFacts = items.filter(item => item.metadataSource && item.providerId && !item.facts?.fetchedAt).length;
    const missingHours = items.filter(item => lengthOf(item) === 0 && (item.metadataSource || item.title)).length;
    const gameRow = (item, categoryLabel = "Game", loggedHours = 0) => `<button type="button" class="stats-game-row" data-open-details data-id="${esc(item.id)}">${gameArtwork(item)}<span class="stats-game-copy"><strong>${esc(item.title)}</strong><span class="stats-game-meta"><small class="stats-game-category">${esc(categoryLabel)}</small>${loggedHours > 0 ? `<small class="stats-game-logged"><i data-lucide="clock-3" aria-hidden="true"></i>${hoursText(loggedHours)} logged</small>` : ""}</span></span><i class="stats-game-chevron" data-lucide="chevron-right" aria-hidden="true"></i></button>`;
    const timeGameRows = [...known].sort((a, b) => lengthOf(b) - lengthOf(a)).map(item => {
      const length = lengthOf(item), logged = Math.min(loggedOf(item), length), percent = Math.min(100, Math.round(logged / length * 100));
      return `<button type="button" class="stats-playtime-row" data-open-details data-id="${esc(item.id)}">${gameArtwork(item)}<span class="stats-playtime-copy"><span class="stats-playtime-line"><strong>${esc(item.title)}</strong><b>${hoursText(length)}</b></span><span class="stats-playtime-track"><i style="width:${percent}%"></i></span><small>${esc(item.status || "In library")} · ${hoursText(logged)} logged</small></span></button>`;
    }).join("");
    const hoursValue = value => humanReadable ? formatHours(value) : `${value >= 100 ? Math.round(value) : Math.round(value * 10) / 10}`;
    const pace = remainingHours <= 0 ? "" : remainingHours <= 14 ? `About ${plural(Math.ceil(remainingHours), "day")} left at 1 hour a day.` : `About ${plural(Math.round(remainingHours / 7), "week")} left at 1 hour a day.`;
    const note = !items.length ? "Add games to see play time and totals here." : !known.length ? "No game has play-time data yet. Use the button below to look it up." : [remainingHours <= 0 && !unknownOpen.length ? "Nothing left to play. 🎉" : pace, unknownOpen.length ? `${plural(unknownOpen.length, "unfinished game")} ${unknownOpen.length === 1 ? "has" : "have"} no play-time data, so ${unknownOpen.length === 1 ? "it isn't" : "they aren't"} counted in “Left to play”.` : ""].filter(Boolean).join(" ");
    const timePanel = `<article class="stats-panel stats-time-panel">
      <header class="stats-panel-heading"><div><span class="stats-eyebrow">PLAY TIME</span><h3>Time to beat</h3></div><span class="stats-time-coverage"><strong>${known.length}/${items.length}</strong><span>games with data</span></span></header>
      <div class="stats-time-grid">
        <div class="stats-time-stat stats-time-stat-primary"><span class="stats-time-label">Logged time</span><strong>${hoursValue(loggedHours)}${humanReadable ? "" : "<small>h</small>"}</strong><span class="stats-time-caption">Across all games</span></div>
        <div class="stats-time-stat"><span class="stats-time-label">Estimated length</span><strong>${hoursValue(knownHours)}${humanReadable ? "" : "<small>h</small>"}</strong><span class="stats-time-caption">${plural(known.length, "game")}</span></div>
        <div class="stats-time-stat"><span class="stats-time-label">Time remaining</span><strong>${hoursValue(remainingHours)}${humanReadable ? "" : "<small>h</small>"}</strong><span class="stats-time-caption">Unfinished games</span></div>
        <div class="stats-time-stat"><span class="stats-time-label">Library value</span><strong>${formatMoney(libraryValue)}</strong><span class="stats-time-caption">Based on saved prices</span></div>
      </div>
      ${knownHours ? `<div class="stats-time-progress" role="img" aria-label="${Math.round(knownPlayed / knownHours * 100)}% of the known length played"><span style="width:${Math.min(100, knownPlayed / knownHours * 100)}%"></span></div><p class="stats-time-note">${hoursText(knownPlayed)} of ${hoursText(knownHours)} played in games with data.</p>` : ""}
      <p class="stats-time-note">${esc(note)}</p>
      <div class="stats-time-actions">${missingFacts ? `<button type="button" class="button secondary small" data-stats-fetch-facts>Fetch details for ${plural(missingFacts, "game")}</button>` : ""}${missingHours ? `<button type="button" class="button secondary small" data-stats-find-hours>Find play times for ${plural(missingHours, "game")}</button>` : ""}</div>
    </article>`;
    const perHour = loggedHours > 0 && libraryValue > 0 ? libraryValue / loggedHours : 0;
    const timeDetails = `<article class="stats-panel stats-playtime-games"><header class="stats-panel-heading"><div><span class="stats-eyebrow">GAME BY GAME</span><h3>Playtime breakdown</h3></div><span class="stats-total-chip">${known.length} tracked</span></header>${timeGameRows || `<p class="stats-empty-copy">Playtime breakdowns appear when a game has a known length. You can fetch playtime data below.</p>`}</article>${perHour ? `<article class="stats-panel stats-efficiency-panel"><span class="stats-eyebrow">VALUE EFFICIENCY</span><strong>${formatMoney(perHour)} per logged hour</strong><p>Based on ${formatMoney(libraryValue)} in saved game prices and ${hoursText(loggedHours)} logged.</p></article>` : ""}`;
    const month = statsRange === "month", rangeDays = month ? 30 : 7;
    const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const historyTime = entry => Number(entry.at) || Date.parse(entry.at) || 0;
    const activityDays = Array.from({ length: rangeDays }, (_, offset) => {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (rangeDays - 1 - offset));
      const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
      const count = history.filter(entry => { const at = historyTime(entry); return at >= date.getTime() && at < nextDay.getTime(); }).length;
      return { date, key: dayKey(date), count };
    });
    const maxActivity = Math.max(1, ...activityDays.map(day => day.count));
    const activityTotal = activityDays.reduce((sum, day) => sum + day.count, 0);
    const selectedActivityDay = activityDays.find(day => day.key === statsActivityDate) || [...activityDays].reverse().find(day => day.count) || activityDays.at(-1);
    const selectedDayEvents = selectedActivityDay ? history.filter(entry => {
      const at = historyTime(entry), start = selectedActivityDay.date.getTime(), end = start + 86400000;
      return at >= start && at < end;
    }).sort((a, b) => historyTime(b) - historyTime(a)) : [];
    const activityBars = activityDays.map((day, index) => {
      const label = month ? `${day.date.getDate()}` : day.date.toLocaleDateString(undefined, { weekday: "short" });
      const sub = month && (index === 0 || day.date.getDate() === 1) ? `<em>${esc(day.date.toLocaleDateString(undefined, { month: "short" }))}</em>` : "";
      const dayLabel = day.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
      return `<button type="button" class="stats-activity-day${day.count ? " has-data" : " is-empty"}${selectedActivityDay?.key === day.key ? " selected" : ""}" data-stats-activity-date="${day.key}" aria-pressed="${selectedActivityDay?.key === day.key}" aria-label="${esc(dayLabel)}: ${day.count} ${day.count === 1 ? "update" : "updates"}" title="${esc(dayLabel)}: ${day.count} ${day.count === 1 ? "update" : "updates"}"><b class="stats-activity-count">${day.count}</b><span class="stats-activity-track"><i style="height:${day.count ? Math.max(8, day.count / maxActivity * 100) : 0}%"></i></span><small>${esc(label)}${sub}</small></button>`;
    }).join("");
    const rangeSwitch = `<div class="ios-pills segmented stats-range" role="group" aria-label="Activity range"><button type="button" class="ios-pill${month ? "" : " active"}" data-stats-range="week" aria-pressed="${!month}">Week</button><button type="button" class="ios-pill${month ? " active" : ""}" data-stats-range="month" aria-pressed="${month}">Month</button></div>`;
    const statusOrder = [...new Set(config.categories.flatMap(category => category.statuses || []))];
    const statusGroups = [...new Set([...statusOrder, ...items.map(item => item.status || "Other")])].map(status => ({ status, games: items.filter(item => String(item.status || "Other").toLowerCase() === String(status).toLowerCase()) })).filter(group => group.games.length);
    const statusColors = { completed: "var(--status-color-completed)", playing: "var(--status-color-playing)", backlog: "var(--status-color-backlog)", "on hold": "var(--status-color-on-hold)", dropped: "var(--status-color-dropped)" };
    const statusSegments = statusGroups.map(group => `<span style="width:${total ? group.games.length / total * 100 : 0}%;background:${statusColors[group.status.toLowerCase()] || "var(--accent)"}" title="${esc(group.status)}: ${group.games.length}"></span>`).join("");
    const statusAccordion = statusGroups.map(group => {
      const pct = total ? Math.round(group.games.length / total * 100) : 0;
      const rows = group.games.map(item => {
        const categoryLabel = item.category ? (config.categories.find(category => category.key === item.category)?.label || item.category) : "Game";
        return gameRow(item, categoryLabel, Math.max(0, Number(item.progress) || 0));
      }).join("");
      return `<details class="stats-status-group"><summary><span class="stats-status-dot" style="--status-dot-color:${statusColors[group.status.toLowerCase()] || "var(--accent)"}"></span><span class="stats-status-name">${esc(group.status)}</span><span class="stats-status-percent">${pct}%</span><strong>${group.games.length}</strong><i data-lucide="chevron-down" aria-hidden="true"></i></summary><div class="stats-status-games">${rows}</div></details>`;
    }).join("");
    const statusPanel = `<article class="stats-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">COLLECTION MIX</span><h3>Game status</h3></div><span class="stats-total-chip"><strong>${total}</strong> games</span></header><div class="stats-status-bar stats-status-bar-dynamic" role="img" aria-label="Game library status breakdown">${statusSegments}</div>${statusGroups.length ? `<div class="stats-status-accordion">${statusAccordion}</div>` : `<p class="stats-empty-copy">Add games to see your collection breakdown.</p>`}</article><article class="stats-panel stats-coverage-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">LIBRARY HEALTH</span><h3>Data coverage</h3></div></header><div class="stats-coverage-rows"><span>Playtime known<strong>${known.length} / ${total}</strong></span><span>Games with artwork<strong>${items.filter(item => item.image).length} / ${total}</strong></span><span>Games rated<strong>${rated.length} / ${total}</strong></span></div></article>`;
    const genreCounts = new Map();
    items.forEach(item => {
      const fieldGenres = item.cachedDetails?.fields?.find(field => /^(genres?|genre)$/i.test(String(field.label || "").trim()))?.value;
      const raw = item.facts?.genres || fieldGenres || item.cachedDetails?.genres || [];
      const values = Array.isArray(raw) ? raw : String(raw || "").split(/[,;/|]/);
      [...new Set(values.map(value => String(value).trim()).filter(Boolean))].forEach(genre => genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1));
    });
    const genreRows = [...genreCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6).map(([genre, count]) => `<div class="stats-genre-row"><span><strong>${esc(genre)}</strong><small>${count} ${count === 1 ? "game" : "games"} · ${total ? Math.round(count / total * 100) : 0}%</small></span><i><b style="width:${total ? count / total * 100 : 0}%"></b></i></div>`).join("");
    const genresPanel = `<article class="stats-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">GENRE MIX</span><h3>Genres in your library</h3></div></header>${genreRows ? `<div class="stats-genre-list">${genreRows}</div>` : `<p class="stats-empty-copy">Genre data isn’t available yet. Fetch details for games in your library to build this view.</p>`}</article>`;
    const detailedLibraryPanel = `${statusPanel}${genresPanel}`;
    const activityEntryRows = selectedDayEvents.map(entry => {
      const item = items.find(row => String(row.id) === String(entry.itemId));
      const stamp = historyTime(entry) ? new Date(historyTime(entry)).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
      const content = `<span class="stats-activity-entry-icon"><i data-lucide="${String(entry.status || entry.action).toLowerCase() === "completed" ? "circle-check" : "activity"}" aria-hidden="true"></i></span><span class="stats-activity-entry-copy"><strong>${esc(entry.title || item?.title || "Library update")}</strong><small>${esc(entry.action || entry.status || "Updated")}${stamp ? ` · ${esc(stamp)}` : ""}</small></span><span class="stats-activity-entry-status">${esc(entry.status || "Updated")}</span>`;
      return item ? `<button type="button" class="stats-activity-entry" data-open-details data-id="${esc(item.id)}">${content}</button>` : `<div class="stats-activity-entry">${content}</div>`;
    }).join("");
    const selectedDayLabel = selectedActivityDay?.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) || "No date selected";
    const activityPanel = `<article class="stats-panel stats-activity-panel"><div class="stats-activity-chart stats-activity-chart-${month ? "month" : "week"}">${activityBars}</div><div class="stats-activity-summary"><span>${activityTotal} ${activityTotal === 1 ? "update" : "updates"} in this period</span><span>${history.length} total ${history.length === 1 ? "update" : "updates"}</span></div><p class="stats-activity-day-note"><strong>${esc(selectedDayLabel)}</strong><span>${selectedDayEvents.length} ${selectedDayEvents.length === 1 ? "change" : "changes"} · Tap a bar to inspect another day.</span></p></article><article class="stats-panel stats-activity-feed"><header class="stats-panel-heading"><div><span class="stats-eyebrow">SELECTED DAY</span><h3>Recent updates</h3></div><span class="stats-total-chip">${selectedDayEvents.length} events</span></header>${activityEntryRows || `<p class="stats-empty-copy">No library changes on this day. Select another bar to review its activity.</p>`}<button type="button" class="button secondary small" data-go="timeline">Open full timeline <span aria-hidden="true">→</span></button></article>`;
    const ratingHistogram = Array.from({ length: ratingMax }, (_, index) => ratingMax - index).map(score => {
      const count = rated.filter(item => Math.round(Number(item.rating)) === score).length;
      const percent = rated.length ? Math.round(count / rated.length * 100) : 0;
      return `<div class="stats-rating-hist-row"><span>${ratingMax === 5 ? `${score} ★` : score}</span><span class="stats-rating-hist-track"><i style="width:${percent}%"></i></span><strong>${count}</strong></div>`;
    }).join("");
    const averageStars = ratingMax === 5 ? "★".repeat(Math.min(5, Math.max(0, Math.round(Number(avgRating) || 0)))).padEnd(5, "☆") : `out of ${ratingMax}`;
    const ratingsPanel = `<article class="stats-panel stats-ratings-summary"><div class="stats-rating-overview"><div class="stats-rating-average"><strong>${avgRating}</strong><span>${averageStars}</span><small>${rated.length} of ${total} rated</small></div><div class="stats-rating-histogram">${ratingHistogram}</div></div></article>${rated.length ? `<article class="stats-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">YOUR SCORES</span><h3>Rated games</h3></div><span class="stats-total-chip">${rated.length}</span></header><div class="stats-rating-list">${allRatingRows}</div></article>` : `<article class="stats-panel stats-empty-ratings"><span class="stats-empty-icon"><i data-lucide="star" aria-hidden="true"></i></span><strong>No ratings yet</strong><p>Choose a score below to start building your ratings overview.</p></article>`}<article class="stats-panel stats-quick-rate-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">QUICK RATE</span><h3>Games without a score</h3></div><span class="stats-total-chip">${unrated.length}</span></header><p class="stats-empty-copy">Tap a star to save a rating. You can change it later from game details.</p>${quickRateRows || `<p class="stats-empty-copy">Every game in your library has a rating.</p>`}</article>`;
    const destinations = [
      ["playtime", "clock-3", "Play time", "Logged hours, game lengths, and what’s left to play.", `${hoursText(loggedHours)} logged${libraryValue ? ` · ${formatMoney(libraryValue)} value` : ""}`],
      ["library", "library", "Library breakdown", "See how your games are spread across statuses.", `${completed} completed · ${queued} backlog`],
      ["activity", "activity", "Activity", "Review recent changes and your tracking rhythm.", `${activityTotal} in the last ${month ? "30 days" : "7 days"}`],
      ["ratings", "star", "Ratings", "See your average score and highest rated games.", rated.length ? `${avgRating} avg · ${rated.length}/${total} rated` : "No ratings yet"]
    ];
    const coverage = (count, denominator = total) => denominator ? Math.min(100, Math.round(count / denominator * 100)) : 0;
    const overviewTile = ({ destination, label, icon, value, caption, percent, tone = "accent" }) => `<button type="button" class="stats-overview-tile" data-go="${destination}" data-tone="${tone}"><span class="stats-overview-tile-head"><span>${label}</span><i data-lucide="${icon}" aria-hidden="true"></i></span><strong>${value}</strong><span class="stats-overview-progress" aria-hidden="true"><i style="width:${percent}%"></i></span><small>${caption}</small></button>`;
    const overviewTiles = [
      overviewTile({ destination: "statistics/library", label: "Games tracked", icon: "gamepad-2", value: total, caption: "In your collection", percent: total ? 100 : 0 }),
      overviewTile({ destination: "statistics/library", label: "Completed", icon: "circle-check", value: completed, caption: `${completionRate}% of your collection`, percent: completionRate, tone: "success" }),
      overviewTile({ destination: "statistics/playtime", label: "Playtime logged", icon: "clock-3", value: hoursText(loggedHours), caption: `${known.length} of ${total} games have length data`, percent: coverage(known.length), tone: "info" }),
      overviewTile({ destination: "statistics/ratings", label: "Average rating", icon: "star", value: `${avgRating}${rated.length ? `<small> / ${ratingMax}</small>` : ""}`, caption: `${rated.length} of ${total} games rated`, percent: rated.length ? Math.min(100, Number(avgRating) / ratingMax * 100) : 0, tone: "warning" })
    ].join("");
    const overview = `<section class="stats-overview"><header class="detail-page-heading analytics-page-heading">${statisticsBack}<strong>Statistics</strong><span class="stats-subpage-badge">${total} GAMES</span></header><div class="stats-overview-hero"><span class="stats-eyebrow">YOUR COLLECTION</span><h1>Collection overview</h1><p>A clear view of your playtime, collection, activity, and ratings.</p></div><div class="stats-overview-grid">${overviewTiles}</div><section class="stats-section stats-explore-section"><div class="stats-section-heading"><div><span class="stats-eyebrow">DETAILS</span><h2>Explore your stats</h2><p>Open a section for a closer look.</p></div></div><div class="stats-destinations">${destinations.map(([key, icon, title, description, value]) => `<button type="button" class="stats-destination" data-go="statistics/${key}"><span class="stats-destination-icon"><i data-lucide="${icon}" aria-hidden="true"></i></span><span class="stats-destination-copy"><strong>${title}</strong><small>${description}</small></span><span class="stats-destination-value">${value}</span><i class="stats-destination-arrow" data-lucide="chevron-right" aria-hidden="true"></i></button>`).join("")}</div></section></section>`;
    const pages = {
      playtime: { title: "Play time", subtitle: "See time logged, estimated game lengths, and what remains.", badge: `${known.length}/${total} DATA`, body: `${timePanel}${timeDetails}` },
      library: { title: "Library breakdown", subtitle: "Understand the status of every game you’re tracking.", badge: `${total} GAMES`, body: detailedLibraryPanel },
      activity: { title: "Activity", subtitle: "See how your library has changed over the selected period.", badge: `${activityTotal} UPDATES`, body: `<div class="stats-activity-toolbar">${rangeSwitch}<span>${month ? "Last 30 days" : "Last 7 days"}</span></div>${activityPanel}` },
      ratings: { title: "Ratings", subtitle: "Review your scores and the games you’ve rated highest.", badge: rated.length ? `${avgRating} AVG` : "NO SCORES", body: ratingsPanel }
    };
    const selected = pages[statsSubpage];
    const subpage = selected ? `<section class="stats-subpage stats-subpage-${esc(statsSubpage)}"><header class="detail-page-heading analytics-page-heading"><button type="button" class="detail-back" data-go="statistics"><span aria-hidden="true">‹</span> All statistics</button><strong>${selected.title}</strong><span class="stats-subpage-badge">${selected.badge}</span></header><div class="stats-subpage-intro"><span class="stats-eyebrow">STATISTICS</span><h1>${selected.title}</h1><p>${selected.subtitle}</p></div>${selected.body}</section>` : "";
    const empty = total === 0 && !statsSubpage ? `<div class="stats-empty-state"><span aria-hidden="true">▥</span><strong>Your stats will appear here.</strong><p>Add games to your library to get started.</p><a href="#dashboard">Go to your library <span aria-hidden="true">→</span></a></div>` : "";
    return `<section class="stats-page">${statsSubpage ? subpage : overview}${empty}</section>`;
  };
})();
