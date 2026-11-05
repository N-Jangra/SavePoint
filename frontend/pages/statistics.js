// Collection health and activity summaries for the current SavePoint library.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const renderStatistics = context => {
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
    const limits = context.statsLimits || { rated: 10, quick: 8 };
    const moreButton = (kind, shown, count) => count > shown ? `<button type="button" class="stats-show-more" data-stats-more="${kind}"><span>Show ${Math.min(kind === "rated" ? 15 : 10, count - shown)} more</span><small>${count - shown} left</small><i data-lucide="chevron-down" aria-hidden="true"></i></button>` : "";
    const ratedRow = item => `<button type="button" class="stats-rated-entry" data-open-details data-id="${esc(item.id)}">${gameArtwork(item)}<span class="stats-rated-copy"><strong>${esc(item.title)}</strong><small>${esc(item.status || "In your library")}</small></span><span class="stats-rated-score" aria-label="${Number(item.rating)} out of ${ratingMax}">${ratingMax === 5 ? "★".repeat(Math.min(5, Math.max(0, Math.round(Number(item.rating))))).padEnd(5, "☆") : `${Number(item.rating)}/${ratingMax}`}<small>${Number(item.rating)}</small></span></button>`;
    // Rated games grouped by score (5 → 1) in expandable sections; only an opened section renders its rows.
    const groupOpen = limits.open || {};
    const scoreGroups = Array.from({ length: ratingMax }, (_, index) => ratingMax - index).map(score => ({ score, games: sortedRated.filter(item => Math.round(Number(item.rating)) === score) })).filter(group => group.games.length);
    const firstGroup = scoreGroups[0]?.score;
    const allRatingRows = scoreGroups.map(group => {
      const open = Boolean(groupOpen[group.score]);
      const stars = ratingMax === 5 ? "★".repeat(group.score).padEnd(5, "☆") : `${group.score}/${ratingMax}`;
      const shown = group.games.slice(0, limits.rated);
      return `<section class="stats-rating-group${open ? " open" : ""}"><button type="button" class="stats-rating-group-head" data-stats-group="${group.score}" aria-expanded="${open}"><span class="stats-rating-group-stars">${stars}</span><span class="stats-rating-group-count">${group.games.length} ${group.games.length === 1 ? "game" : "games"}</span><i data-lucide="chevron-down" aria-hidden="true"></i></button>${open ? `<div class="stats-rating-group-body">${shown.map(ratedRow).join("")}${moreButton("rated", limits.rated, group.games.length)}</div>` : ""}</section>`;
    }).join("");
    const unrated = items.filter(item => !(Number(item.rating) > 0));
    const quickRateRows = unrated.slice(0, limits.quick).map(item => `<div class="stats-unrated-entry">${gameArtwork(item)}<span class="stats-rated-copy"><strong>${esc(item.title)}</strong><small>${esc(item.status || "In your library")}</small></span><span class="stats-quick-rate" role="group" aria-label="Rate ${esc(item.title)}">${Array.from({ length: ratingMax }, (_, index) => index + 1).map(score => `<button type="button" data-stats-rating="${esc(item.id)}" data-score="${score}" aria-label="Rate ${score} out of ${ratingMax}">${ratingMax === 5 ? `<i data-lucide="star" aria-hidden="true"></i>` : score}</button>`).join("")}</span></div>`).join("");
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
    const currency = window.SplitAppCurrency;
    const targetCurrency = currency.target(prefs);
    const formatMoney = value => {
      if (!value) return "—";
      const symbol = currency.symbol(targetCurrency);
      if (!humanReadable) return currency.format(value, targetCurrency);
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
    const priceCurrency = item => item.facts?.priceCurrency || currency.detect(item.facts?.price) || "USD";
    const displayPrice = item => currency.convert(Number(item.facts?.priceValue) || 0, priceCurrency(item), targetCurrency, prefs);
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
    // Play time and money split by status so each number answers one question.
    const inStatus = name => items.filter(item => String(item.status).toLowerCase() === name.toLowerCase());
    const sumOf = (list, fn) => list.reduce((sum, item) => sum + fn(item), 0);
    const statusTimeSpec = [
      { status: "Completed", icon: "circle-check", tone: "completed", blurb: "Finished games", stats: list => [["Time spent", hoursText(sumOf(list, loggedOf))]] },
      { status: "Dropped", icon: "circle-minus", tone: "dropped", blurb: "Stopped early — the rest of the time is saved", stats: list => [["Time spent", hoursText(sumOf(list, loggedOf))], ["Time saved", hoursText(sumOf(list.filter(item => lengthOf(item) > 0), item => Math.max(0, lengthOf(item) - loggedOf(item))))]] },
      { status: "Playing", icon: "gamepad-2", tone: "playing", blurb: "In progress right now", stats: list => [["Time spent", hoursText(sumOf(list, loggedOf))], ["To finish", hoursText(sumOf(list.filter(item => lengthOf(item) > 0), item => Math.max(0, lengthOf(item) - loggedOf(item))))]] },
      { status: "On Hold", icon: "pause-circle", tone: "on-hold", blurb: "Paused for later", stats: list => [["Time spent", hoursText(sumOf(list, loggedOf))], ["Time needed", hoursText(sumOf(list.filter(item => lengthOf(item) > 0), item => Math.max(0, lengthOf(item) - loggedOf(item))))]] },
      { status: "Backlog", icon: "bookmark", tone: "backlog", blurb: "Not started — no time counted", stats: () => [] },
      { status: "Upcoming", icon: "calendar-clock", tone: "upcoming", blurb: "Not released or started — no time counted", stats: () => [] }
    ];
    const statusTimeCards = statusTimeSpec.map(spec => {
      const list = inStatus(spec.status);
      if (!list.length && !["Completed", "Dropped", "Playing", "On Hold"].includes(spec.status)) return "";
      const value = sumOf(list, displayPrice);
      const cells = [...spec.stats(list), ["Value", formatMoney(value)]].map(([label, text]) => `<div><small>${esc(label)}</small><strong>${esc(text)}</strong></div>`).join("");
      return `<section class="stats-status-card" data-tone="${spec.tone}"><header><span class="stats-status-card-icon"><i data-lucide="${spec.icon}" aria-hidden="true"></i></span><div><h4>${esc(spec.status)}</h4><small>${esc(spec.blurb)}</small></div><b>${plural(list.length, "game")}</b></header><div class="stats-status-card-grid">${cells}</div></section>`;
    }).join("");
    const timePanel = `<article class="stats-panel stats-time-panel">
      <header class="stats-panel-heading"><div><span class="stats-eyebrow">PLAY TIME</span><h3>Time to beat</h3></div><span class="stats-time-coverage"><strong>${known.length}/${items.length}</strong><span>games with data</span></span></header>
      <div class="stats-time-total"><span><small>Logged in total</small><strong>${hoursText(loggedHours)}</strong></span><span><small>Library value</small><strong>${formatMoney(libraryValue)}</strong></span></div>
      <div class="stats-status-time">${statusTimeCards}</div>
      <p class="stats-time-note">${esc(note)}</p>
      <div class="stats-time-actions">${missingFacts ? `<button type="button" class="button secondary small" data-stats-fetch-facts>Fetch details for ${plural(missingFacts, "game")}</button>` : ""}${missingHours ? `<button type="button" class="button secondary small" data-stats-find-hours>Find play times for ${plural(missingHours, "game")}</button>` : ""}</div>
    </article>`;
    const perHour = loggedHours > 0 && libraryValue > 0 ? libraryValue / loggedHours : 0;
    const timeDetails = `<article class="stats-panel stats-playtime-games"><header class="stats-panel-heading"><div><span class="stats-eyebrow">GAME BY GAME</span><h3>Playtime breakdown</h3></div><span class="stats-total-chip">${known.length} tracked</span></header>${timeGameRows || `<p class="stats-empty-copy">Playtime breakdowns appear when a game has a known length. You can fetch playtime data below.</p>`}</article>${perHour ? `<article class="stats-panel stats-efficiency-panel"><span class="stats-eyebrow">VALUE EFFICIENCY</span><strong>${formatMoney(perHour)} per logged hour</strong><p>Based on ${formatMoney(libraryValue)} in saved game prices and ${hoursText(loggedHours)} logged.</p></article>` : ""}`;
    const month = statsRange === "month", rangeDays = month ? 30 : 7;
    const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const historyTime = entry => Number(entry.at) || Date.parse(entry.at) || 0;
    // One pass over history: parse every timestamp once, then count per day with a lookup
    // (previously: one full scan of the history for each of the 7 or 30 days).
    const stamps = new Map(history.map(entry => [entry, historyTime(entry)]));
    const timeOf = entry => stamps.get(entry) ?? historyTime(entry);
    const dayStarts = Array.from({ length: rangeDays }, (_, offset) => {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (rangeDays - 1 - offset));
      return date;
    });
    const dayCounts = dayStarts.map(() => 0);
    const firstDay = dayStarts[0].getTime(), lastEnd = new Date(dayStarts[rangeDays - 1].getTime() + 36 * 3600000);
    lastEnd.setHours(0, 0, 0, 0);
    stamps.forEach(at => {
      if (at < firstDay || at >= lastEnd.getTime()) return;
      for (let index = rangeDays - 1; index >= 0; index -= 1) { if (at >= dayStarts[index].getTime()) { dayCounts[index] += 1; break; } }
    });
    const activityDays = dayStarts.map((date, index) => ({ date, key: dayKey(date), count: dayCounts[index] }));
    const maxActivity = Math.max(1, ...activityDays.map(day => day.count));
    const activityTotal = activityDays.reduce((sum, day) => sum + day.count, 0);
    const selectedActivityDay = activityDays.find(day => day.key === statsActivityDate) || [...activityDays].reverse().find(day => day.count) || activityDays.at(-1);
    const selectedDayEvents = selectedActivityDay ? history.filter(entry => {
      const at = timeOf(entry), start = selectedActivityDay.date.getTime(), end = start + 86400000;
      return at >= start && at < end;
    }).sort((a, b) => timeOf(b) - timeOf(a)) : [];
    const activityBars = activityDays.map((day, index) => {
      const label = month ? `${day.date.getDate()}` : day.date.toLocaleDateString(undefined, { weekday: "short" });
      const sub = month && (index === 0 || day.date.getDate() === 1) ? `<em>${esc(day.date.toLocaleDateString(undefined, { month: "short" }))}</em>` : "";
      const dayLabel = day.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
      return `<button type="button" class="stats-activity-day${day.count ? " has-data" : " is-empty"}${selectedActivityDay?.key === day.key ? " selected" : ""}" data-stats-activity-date="${day.key}" aria-pressed="${selectedActivityDay?.key === day.key}" aria-label="${esc(dayLabel)}: ${day.count} ${day.count === 1 ? "update" : "updates"}" title="${esc(dayLabel)}: ${day.count} ${day.count === 1 ? "update" : "updates"}"><b class="stats-activity-count">${day.count}</b><span class="stats-activity-track"><i style="height:${day.count ? Math.max(8, day.count / maxActivity * 100) : 0}%"></i></span><small>${esc(label)}${sub}</small></button>`;
    }).join("");
    const rangeSwitch = `<div class="ios-pills segmented stats-range" role="group" aria-label="Activity range"><button type="button" class="ios-pill${month ? "" : " active"}" data-stats-range="week" aria-pressed="${!month}">Week</button><button type="button" class="ios-pill${month ? " active" : ""}" data-stats-range="month" aria-pressed="${month}">Month</button></div>`;
    const statusOrder = [...new Set(config.categories.flatMap(category => category.statuses || []))];
    const statusGroups = [...new Set([...statusOrder, ...items.map(item => item.status || "Other")])].map(status => ({ status, games: items.filter(item => String(item.status || "Other").toLowerCase() === String(status).toLowerCase()) })).filter(group => group.games.length);
    const statusColors = { completed: "var(--status-color-completed)", playing: "var(--status-color-playing)", backlog: "var(--status-color-backlog)", "on hold": "var(--status-color-on-hold)", dropped: "var(--status-color-dropped)", upcoming: "var(--status-color-upcoming)" };
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
    const itemsById = new Map(items.map(row => [String(row.id), row]));
    const activityEntryRows = selectedDayEvents.map(entry => {
      const item = itemsById.get(String(entry.itemId));
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
    const ratingsPanel = `<article class="stats-panel stats-ratings-summary"><div class="stats-rating-overview"><div class="stats-rating-average"><strong>${avgRating}</strong><span>${averageStars}</span><small>${rated.length} of ${total} rated</small></div><div class="stats-rating-histogram">${ratingHistogram}</div></div></article>${rated.length ? `<article class="stats-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">YOUR SCORES</span><h3>Rated games</h3></div><span class="stats-heading-actions"><span class="stats-total-chip">${rated.length}</span><button type="button" class="stats-clear-ratings" data-clear-all-ratings><i data-lucide="eraser" aria-hidden="true"></i>Clear all</button></span></header><div class="stats-rating-list">${allRatingRows}</div></article>` : `<article class="stats-panel stats-empty-ratings"><span class="stats-empty-icon"><i data-lucide="star" aria-hidden="true"></i></span><strong>No ratings yet</strong><p>Choose a score below to start building your ratings overview.</p></article>`}<article class="stats-panel stats-quick-rate-panel"><header class="stats-panel-heading"><div><span class="stats-eyebrow">QUICK RATE</span><h3>Games without a score</h3></div><span class="stats-total-chip">${unrated.length}</span></header><p class="stats-empty-copy">Tap a star to rate. Change it later from game details.</p>${quickRateRows || `<p class="stats-empty-copy">Every game in your library has a rating.</p>`}${moreButton("quick", limits.quick, unrated.length)}</article>`;
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

  // The page is a pure function of the library, history, a few preferences and the selected
  // range/day, so identical inputs reuse the previous HTML instead of recomputing every panel.
  let cache = { key: "", html: "" };
  window.SplitAppPages.statistics = context => {
    if (context.dataRevision === undefined) return renderStatistics(context);
    const key = [context.dataRevision, context.items.length, context.history.length, context.statsRange, context.statsSubpage, context.statsActivityDate, JSON.stringify(context.statsLimits || null), new Date().toDateString(), JSON.stringify(context.prefs)].join("|");
    if (cache.key !== key) cache = { key, html: renderStatistics(context) };
    return cache.html;
  };
})();