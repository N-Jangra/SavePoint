// Profile page, Favorites and Edit profile (cover + photo). Same layout and behaviour as ScreenMark's profile, for games.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const stampOf = item => Number(item?.createdAt) || Number(item?.updatedAt) || 0;
  const isStatus = (item, status) => String(item?.status || "").toLowerCase() === status.toLowerCase();
  // Portrait art: the user's own cover, the on-device copy, then the online picture.
  // Artwork order: HowLongToBeat portrait, SteamDB portrait, HowLongToBeat screenshots, SteamDB screenshots, then any other saved picture.
  const artCandidates = item => {
    const local = item?.localImageData || {}, details = item?.cachedDetails || {}, meta = item?.sourceMeta || {};
    const steamId = String((item?.sourceIds || {}).steamdb || (item?.metadataSource === "steamdb" ? item?.providerId : "") || "").replace(/^app:/, "");
    const steamPortrait = /^\d+$/.test(steamId) ? [`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/library_600x900.jpg`, `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`] : [];
    const own = item?.metadataSource === "howlongtobeat" ? [details.portraitImage, item?.image] : [];
    const gallery = (details.sections || []).filter(section => section.kind === "gallery").flatMap(section => section.items || []);
    const shots = pick => gallery.filter(entry => pick(String(entry.title || ""))).map(entry => entry.image).filter(Boolean).slice(0, 3);
    const isHltb = title => /how\s*long|hltb/i.test(title);
    return [...new Set([
      item?.customCover,
      item?.localPortraitData, local["cachedDetails.portraitImage"],
      meta.howlongtobeat?.image, ...own,
      meta.steamdb?.image, ...steamPortrait,
      ...shots(isHltb), ...shots(title => !isHltb(title)),
      details.portraitImage, item?.localThumbnailData, local.image, item?.image, details.image,
      item?.localLandscapeData, local["cachedDetails.landscapeImage"], item?.backdrop, details.landscapeImage, details.backgroundImage
    ].filter(Boolean))];
  };
  const artOf = item => artCandidates(item)[0] || "";
  const artList = (item, landscape = false) => [...new Set((landscape ? [landscapeOf(item), ...artCandidates(item)] : artCandidates(item)).filter(Boolean))];
  const landscapeOf = item => item?.localLandscapeData || item?.localImageData?.["cachedDetails.landscapeImage"] || item?.localImageData?.["cachedDetails.backgroundImage"] || item?.localImageData?.backdrop || item?.backdrop || item?.cachedDetails?.landscapeImage || item?.cachedDetails?.backgroundImage || "";
  const localPending = (item, landscape) => Boolean(item && !item.customCover && (landscape ? !item.localLandscapeData : !item.localPortraitData && !item.localThumbnailData) && (item.thumbnailPath || item.localImageFiles?.length));
  const fallbackArt = `<span class="profile-art-placeholder"><i data-lucide="gamepad-2" aria-hidden="true"></i></span>`;
  // Same deferred-image contract the rest of the app uses (observeDeferredImages / activateDeferredImage).
  const imgMarkup = (item, esc, { landscape = false, override = "" } = {}) => {
    const candidates = [...new Set([override, ...artList(item, landscape)].filter(Boolean))], src = candidates[0] || "";
    const pending = !override && localPending(item, landscape);
    if (!src && !pending) return fallbackArt;
    const rest = candidates.slice(1).join("\n");
    return `<img data-deferred-image data-lazy-src="${esc(src)}"${rest ? ` data-fallback-srcs="${esc(rest)}"` : ""}${item?.id != null ? ` data-art-item="${esc(item.id)}" data-art-mode="${landscape ? "landscape" : "portrait"}"` : ""}${pending ? ` data-local-item-id="${esc(item.id)}" data-local-image-mode="${landscape ? "landscape" : "portrait"}"` : ""} alt="" loading="lazy" decoding="async" onload="this.style.display='';if(this.nextElementSibling)this.nextElementSibling.hidden=true" onerror="window.SplitAppPages.artError(this)">${fallbackArt.replace("<span", "<span hidden")}`;
  };
  const hoursOf = item => Math.max(0, Number(item?.progress) || 0);
  const duration = hours => {
    let total = Math.max(0, Math.floor(Number(hours) || 0));
    const months = Math.floor(total / 720); total %= 720;
    const days = Math.floor(total / 24); total %= 24;
    return { months, days, hours: total };
  };
  const durationMarkup = hours => {
    const value = duration(hours);
    return `<span class="profile-time-value"><strong>${value.months}</strong><small>MONTHS</small></span><span class="profile-time-value"><strong>${value.days}</strong><small>DAYS</small></span><span class="profile-time-value"><strong>${value.hours}</strong><small>HOURS</small></span>`;
  };
  const posterButton = (item, esc) => {
    const goal = Math.max(0, Number(item.goal) || 0, Number(item.completionTargetHours) || 0), progress = hoursOf(item);
    const done = isStatus(item, "Completed");
    const percent = done ? 100 : goal ? Math.min(100, Math.round(progress / goal * 100)) : 0;
    return `<div class="profile-poster-wrap"><button type="button" class="profile-poster" data-open-details data-action="details" data-id="${esc(item.id)}" aria-label="Open ${esc(item.title)}">${imgMarkup(item, esc)}<span class="profile-poster-title">${esc(item.title)}</span><span class="demo-poster-progress" data-status="${esc(String(item.status || "").toLowerCase().replace(/\s+/g, "-"))}"><i class="${percent >= 100 ? "is-done" : ""}" style="width:${percent}%;--w:${percent}%"></i></span></button></div>`;
  };
  const sectionHeader = (title, target, count) => `<header class="profile-section-heading"><h2>${title}${Number.isFinite(count) ? ` <small>${count}</small>` : ""}</h2><button type="button" data-go="${target}" aria-label="See all ${title}"><i data-lucide="chevron-right" aria-hidden="true"></i></button></header>`;
  let favoritesQuery = "", favoritesShown = 60, sortedItemsRef = null, sortedItemsRevision = null, sortedItemsCache = [];
  let newestItemsRef = null, newestItemsRevision = null, newestItemsCache = [];

  // ---- Edit profile: photo + background (same pickers as ScreenMark) ----
  const DEFAULTS = { Source: "all", Mode: "random", Interval: "visit" };
  const INTERVALS = { visit: 0, hourly: 36e5, daily: 864e5, weekly: 6048e5, manual: Infinity };
  const SESSION = String(Date.now());
  const AVATAR_KEY = "savepoint_profile_avatar";
  const KINDS = {
    cover: { prefix: "profileCover", store: "savepoint_profile_cover", landscape: true, title: "Background cover", off: ["none", "No cover (remove)"] },
    avatar: { prefix: "profileAvatar", store: "savepoint_profile_avatar_pick", landscape: false, title: "Profile photo", off: ["none", "Default icon (remove)"], custom: ["custom", "My own photo"] }
  };
  const readJson = key => { try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (_) { return {}; } };
  const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const readAvatar = () => { try { return localStorage.getItem(AVATAR_KEY) || ""; } catch (_) { return ""; } };
  const pref = (prefs, kind, name) => prefs[KINDS[kind].prefix + name] || (name === "Source" && kind === "avatar" ? "custom" : DEFAULTS[name]);
  const imageOf = (item, kind) => (KINDS[kind].landscape ? landscapeOf(item) : artOf(item)) || flatCandidates(item, kind)[0]?.src || "";
  const poolOf = (items, kind, source) => ["none", "custom", "pinned"].includes(source) ? [] : items.filter(item => imageOf(item, kind) && ({
    all: true, favorites: item.favorite, playing: isStatus(item, "Playing"), completed: isStatus(item, "Completed")
  }[source] ?? true));

  // A pinned profile image is one specific picture of one game (cover, thumbnail, background or screenshot).
  function candidatesOf(item, kind) {
    const landscape = KINDS[kind].landscape, local = item.localImageData || {}, details = item.cachedDetails || {}, groups = [], seen = new Set();
    const group = title => { const row = { title, images: [] }; groups.push(row); return row; };
    const add = (row, label, remote, localSrc) => {
      if (!remote || !/^(https?:|data:image\/)/i.test(remote) || seen.has(remote)) return; seen.add(remote);
      row.images.push({ label, value: remote, src: localSrc || remote });
    };
    const covers = group("Covers & thumbnails"), backgrounds = group("Backgrounds");
    add(covers, "Cover", item.customCover || details.portraitImage || details.image || item.image, item.localPortraitData || item.localThumbnailData || local["cachedDetails.portraitImage"] || local["cachedDetails.image"]);
    add(backgrounds, "Background", item.backdrop || details.landscapeImage || details.backgroundImage, item.localLandscapeData || local["cachedDetails.landscapeImage"] || local["cachedDetails.backgroundImage"]);
    (details.sections || []).forEach((section, sectionIndex) => {
      if (section?.kind !== "gallery") return;
      const title = String(section.title || "Images").replace(/\s*\(\d+\)\s*$/, ""), isCover = /poster|cover|thumb|box/i.test(title);
      const target = isCover ? covers : /background|backdrop|banner|fanart/i.test(title) ? backgrounds : (groups.find(row => row.title === title) || group(title));
      (section.items || []).slice(0, 60).forEach((row, index) => add(target, row.title || title, row.image || row.url, local[`cachedDetails.sections.${sectionIndex}.items.${index}.image`]));
    });
    const order = landscape ? [backgrounds, ...groups.filter(row => row !== backgrounds && row !== covers), covers] : [covers, ...groups.filter(row => row !== backgrounds && row !== covers), backgrounds];
    return [...new Set(order)].filter(row => row.images.length);
  }
  const flatCandidates = (item, kind) => candidatesOf(item, kind).flatMap(row => row.images);
  function pinnedSrc(item, kind, prefs) {
    const wanted = String(prefs[KINDS[kind].prefix + "PinnedImage"] || "");
    if (!item || !wanted) return "";
    const match = flatCandidates(item, kind).find(row => row.value === wanted);
    return match?.src || "";
  }
  const browse = { cover: "", avatar: "" };
  const pickedSrc = (item, kind, prefs) => pref(prefs, kind, "Source") === "pinned" ? pinnedSrc(item, kind, prefs) : "";
  function pickFor(kind, items, prefs, force = false) {
    const source = pref(prefs, kind, "Source"), mode = pref(prefs, kind, "Mode"), interval = INTERVALS[pref(prefs, kind, "Interval")] ?? 0;
    if (source === "pinned") { const id = String(prefs[KINDS[kind].prefix + "Pinned"] || ""); return items.find(item => String(item.id) === id && imageOf(item, kind)) || null; }
    const pool = poolOf(items, kind, source);
    if (!pool.length) return null;
    const store = KINDS[kind].store, saved = readJson(store), key = `${source}|${mode}`;
    const current = pool.find(item => String(item.id) === String(saved.id));
    const same = current && saved.key === key && !force;
    // "visit" re-picks once per app launch, not on every re-render.
    if (same && (interval === 0 ? saved.session === SESSION : Date.now() - (saved.at || 0) < interval)) return current;
    const choice = mode === "newest" ? [...pool].sort((a, b) => stampOf(b) - stampOf(a))[0] : pool[Math.floor(Math.random() * pool.length)];
    writeJson(store, { id: String(choice.id), at: Date.now(), key, session: SESSION });
    return choice;
  }
  const avatarMarkup = (esc, items = [], prefs = {}) => {
    const source = pref(prefs, "avatar", "Source");
    if (source === "custom") { const src = readAvatar(); if (src.startsWith("data:image/")) return `<span class="avatar-img" role="img" aria-label="Profile photo" style="background-image:url('${esc(src)}')"></span>`; }
    else if (source !== "none") { const item = pickFor("avatar", items, prefs); if (item) return `<span class="avatar-img" role="img" aria-label="${esc(item.title)}">${imgMarkup(item, esc, { override: pickedSrc(item, "avatar", prefs) })}</span>`; }
    return `<i data-lucide="user-round" aria-hidden="true"></i>`;
  };
  const optionLists = kind => {
    const k = KINDS[kind];
    return {
      Source: ["Images from", [k.off, ...(k.custom ? [k.custom] : []), ["pinned", "Picked below"], ["all", "All games"], ["favorites", "Favorites only"], ["playing", "Playing now"], ["completed", "Completed games"]]],
      Mode: ["Pick", [["random", "Random"], ["newest", "Most recently added"]]],
      Interval: ["Change", [["visit", "Every app launch"], ["hourly", "Every hour"], ["daily", "Every day"], ["weekly", "Every week"], ["manual", "Only when I shuffle"]]]
    };
  };
  let coverTab = "avatar";
  const pickerLimit = { cover: 18, avatar: 24 };
  function profileCoverPage(context) {
    const { items = [], prefs = {}, esc } = context;
    const library = kind => {
      const k = KINDS[kind], landscape = k.landscape, noun = landscape ? "background" : "photo";
      if (pref(prefs, kind, "Source") !== "pinned") return `<section class="profile-cover-library"><p class="profile-cover-hint">Want one specific picture? Choose <strong>Picked below</strong> above, then pick a game and the cover, screenshot or background to use.</p></section>`;
      const chosenId = String(prefs[k.prefix + "Pinned"] || ""), chosenImage = String(prefs[k.prefix + "PinnedImage"] || "");
      const browsing = browse[kind] ? items.find(item => String(item.id) === String(browse[kind])) : null;
      if (browsing) {
        let index = 0;
        const groups = candidatesOf(browsing, kind);
        const body = groups.length ? groups.map(row => `<h4>${esc(row.title)} <small>${row.images.length}</small></h4><div class="profile-pick-grid ${/background|screenshot|image|still|banner/i.test(row.title) || (landscape && row.title !== "Covers & thumbnails") ? "cover" : kind}">${row.images.map(image => { const at = index++, selected = chosenId === String(browsing.id) && chosenImage === image.value; return `<button type="button" class="profile-pick-tile${selected ? " selected" : ""}" data-cover-image="${kind}" data-id="${esc(browsing.id)}" data-index="${at}" aria-label="Use ${esc(image.label)}" aria-pressed="${selected}"><img src="${esc(image.src)}" alt="" loading="lazy" decoding="async" onerror="this.closest('button').hidden=true"></button>`; }).join("")}</div>`).join("") : `<p class="profile-cover-hint">${esc(browsing.title)} has no saved pictures yet. Open it online once to download them.</p>`;
        return `<section class="profile-cover-library"><div class="profile-pick-head"><button type="button" class="profile-cover-remove" data-cover-back="${kind}"><i data-lucide="chevron-left" aria-hidden="true"></i><span>Games</span></button><strong>${esc(browsing.title)}</strong></div><p class="profile-cover-hint">Tap a ${noun} to use it.</p>${body}</section>`;
      }
      const hasMatchingArt = item => kind === "cover"
        ? Boolean(landscapeOf(item) || candidatesOf(item, kind).some(group => /background|backdrop|banner|fanart|screenshot/i.test(group.title)))
        : Boolean(artOf(item) || candidatesOf(item, kind).some(group => /cover|poster|thumbnail/i.test(group.title)));
      const all = items.filter(hasMatchingArt).sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), undefined, { sensitivity: "base" }));
      if (!all.length) return `<section class="profile-cover-library"><p class="profile-cover-hint">${items.length ? `None of your games have a ${landscape ? "background" : "photo"} saved yet. Open one online to download its pictures, then come back.` : "Add a game first, then come back to pick its pictures."}</p></section>`;
      const shown = all.slice(0, pickerLimit[kind]);
      return `<section class="profile-cover-library"><h3>1. Pick a game</h3><label class="profile-pick-search"><i data-lucide="search" aria-hidden="true"></i><input type="search" data-cover-search placeholder="Search your games" autocomplete="off" aria-label="Search your games"></label><div class="profile-title-grid">${shown.map(item => `<button type="button" class="profile-title-tile${chosenId === String(item.id) ? " selected" : ""}" data-cover-title="${kind}" data-id="${esc(item.id)}" data-title="${esc(String(item.title || "").toLocaleLowerCase())}" aria-label="Choose pictures from ${esc(item.title)}"><span class="profile-title-art">${imgMarkup(item, esc, { landscape, override: imageOf(item, kind) })}</span><span class="profile-title-name">${esc(item.title)}</span><small>${esc(item.platform || "Game")}</small></button>`).join("")}</div>${shown.length < all.length ? `<button type="button" class="profile-cover-remove profile-pick-more" data-cover-more="${kind}">Load more (${all.length - shown.length} left)</button>` : ""}</section>`;
    };
    const section = kind => {
      const k = KINDS[kind], source = pref(prefs, kind, "Source"), lists = optionLists(kind), count = poolOf(items, kind, source).length;
      const group = name => `<section class="profile-cover-setting"><h3>${lists[name][0]}</h3>${lists[name][1].map(([value, label]) => `<label class="profile-cover-option"><input type="radio" name="${k.prefix}${name}" data-pref="${k.prefix}${name}" value="${value}" ${pref(prefs, kind, name) === value ? "checked" : ""}><span>${label}</span></label>`).join("")}</section>`;
      let preview;
      if (kind === "cover") { const cover = pickFor("cover", items, prefs); preview = `<div class="profile-cover-preview">${cover ? imgMarkup(cover, esc, { landscape: true, override: pickedSrc(cover, "cover", prefs) }) : `<span class="profile-cover-empty"></span>`}<span class="profile-cover-shade"></span><small>${cover ? esc(cover.title) : "No cover"}</small></div>`; }
      else preview = `<div class="profile-avatar-editor"><span class="profile-avatar">${avatarMarkup(esc, items, prefs)}</span>${source === "custom" ? `<label class="profile-cover-shuffle"><i data-lucide="image-plus" aria-hidden="true"></i><span>Choose photo</span><input type="file" accept="image/*" data-profile-avatar-file hidden></label>${readAvatar() ? `<button type="button" class="profile-cover-remove" data-profile-avatar-remove>Remove photo</button>` : ""}` : ""}</div>`;
      const usesPool = !["none", "custom", "pinned"].includes(source);
      return `<section class="profile-cover-block"><h2>${k.title}</h2>${preview}${usesPool ? `<button type="button" class="profile-cover-shuffle" data-profile-cover-shuffle="${kind}"><i data-lucide="shuffle" aria-hidden="true"></i><span>Shuffle now</span></button><p class="profile-cover-hint">${count} ${count === 1 ? "game has" : "games have"} pictures for this choice.</p>` : ""}${group("Source")}${usesPool ? group("Mode") + group("Interval") : ""}${library(kind)}</section>`;
    };
    return `<section class="profile-page profile-cover-page"><header class="profile-list-header"><button type="button" data-go="profile" aria-label="Back to profile"><i data-lucide="chevron-left" aria-hidden="true"></i></button><h2>Edit profile</h2><span></span></header><div class="watchlist-tabs" role="tablist"><button type="button" class="${coverTab === "avatar" ? "active" : ""}" data-cover-tab="avatar" role="tab" aria-selected="${coverTab === "avatar"}">Profile</button><button type="button" class="${coverTab === "cover" ? "active" : ""}" data-cover-tab="cover" role="tab" aria-selected="${coverTab === "cover"}">Background</button></div>${section(coverTab)}</section>`;
  }

  // ---- Profile ----
  function profilePage(context) {
    const { items = [], esc, prefs = {}, config = {}, statusOptions = { custom: {}, hidden: {} }, dataRevision } = context;
    if (newestItemsRef !== items || newestItemsRevision !== dataRevision) {
      newestItemsRef = items;
      newestItemsRevision = dataRevision;
      newestItemsCache = [...items].sort((a, b) => stampOf(b) - stampOf(a));
    }
    const games = newestItemsCache;
    const favorites = games.filter(item => item.favorite);
    const onHold = games.filter(item => isStatus(item, "On Hold"));
    const dropped = games.filter(item => isStatus(item, "Dropped"));
    const backlogGames = games.filter(item => isStatus(item, "Backlog"));
    const playingGames = games.filter(item => isStatus(item, "Playing"));
    const completedGames = games.filter(item => isStatus(item, "Completed"));
    const cover = pickFor("cover", items, prefs);
    const playedHours = items.reduce((sum, item) => sum + (isStatus(item, "Completed") ? Math.max(hoursOf(item), Number(item.goal) || 0) : hoursOf(item)), 0);
    const completed = items.filter(item => isStatus(item, "Completed")).length;
    const achievementRows = window.SplitAppAchievements?.entries(items) || [];
    const achievementProgress = window.SplitAppAchievements?.progression(achievementRows);
    const recentBadges = (window.SplitAppAchievements?.recent(achievementRows, 3) || []).map(row => ({ name: row.title, title: row.familyTitle, asset: row.asset }));
    const playing = items.filter(item => isStatus(item, "Playing")).length;
    const backlog = items.filter(item => isStatus(item, "Backlog")).length;
    const timeCard = (label, hours, icon) => `<a class="profile-stat-card" href="#statistics"><span class="profile-stat-heading"><i data-lucide="${icon}" aria-hidden="true"></i><strong>${label}</strong></span><span class="profile-time-values">${durationMarkup(hours)}</span></a>`;
    const countCard = (label, count, icon) => `<a class="profile-stat-card profile-stat-count-card" href="#statistics"><span class="profile-stat-heading"><i data-lucide="${icon}" aria-hidden="true"></i><strong>${label}</strong></span><span class="profile-count-value">${Math.round(Number(count) || 0)}</span></a>`;
    const empty = context.libraryLoading
      ? `<div class="profile-empty" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><strong>Loading your profile…</strong><span>Your saved collection is being restored.</span></div>`
      : `<div class="profile-empty"><i data-lucide="library" aria-hidden="true"></i><strong>Your profile is ready</strong><span>Add the games you play to build your page.</span><button type="button" data-go="discover">Explore games</button></div>`;
    const statusShelf = (title, route, rows, actionLabel) => `<section class="profile-shelf">${sectionHeader(title, route, rows.length)}${rows.length ? `<div class="profile-poster-rail">${rows.slice(0, 6).map(item => posterButton(item, esc)).join("")}</div>` : `<button type="button" class="profile-favorite-empty" data-go="${route}" aria-label="Add games to ${esc(title)}"><span class="profile-favorite-plus" aria-hidden="true">+</span><span>${esc(actionLabel)}</span></button>`}</section>`;
    const profileSections = [];
    if (!context.libraryLoading) profileSections.push(["stats", "Stats", `<section class="profile-stats" data-profile-section="stats"><header class="profile-section-heading"><h2>Stats</h2><a href="#statistics" aria-label="Open full statistics"><i data-lucide="chevron-right" aria-hidden="true"></i></a></header><div class="profile-stat-rail">${timeCard("Play time", playedHours, "gamepad-2")} ${countCard("Playing", playing, "play")} ${countCard("Completed", completed, "circle-check")} ${countCard("Backlog", backlog, "bookmark")}</div></section>`]);
    if (!context.libraryLoading && achievementProgress) profileSections.push(["achievements", "Achievements", `<section class="profile-shelf profile-achievement-summary" data-profile-section="achievements"><header class="profile-section-heading"><h2>Achievements</h2><a href="#achievements" aria-label="Open achievements"><i data-lucide="chevron-right" aria-hidden="true"></i></a></header><a class="profile-level-summary" href="#achievements" aria-label="Level ${achievementProgress.level}, ${esc(achievementProgress.name)}. Open achievements"><span class="pls-orb"><svg viewBox="10 10 76 76" aria-hidden="true">${window.SplitAppAchievements.insignia(window.SplitAppAchievements.insigniaSpec(achievementProgress.level), "#2a1a00")}</svg></span><span class="pls-copy"><strong>${esc(achievementProgress.name)}</strong><small>LVL ${achievementProgress.level} · ${achievementProgress.xp.toLocaleString()} XP · ${achievementProgress.earned} of ${achievementProgress.total} unlocked</small><span class="pls-bar"><i style="width:${achievementProgress.percent}%"></i></span></span></a><div class="profile-recent-badges">${recentBadges.length ? recentBadges.map(badge => `<a href="#achievements" aria-label="${esc(badge.title)}: ${esc(badge.name)}"><img src="${esc(badge.asset)}" alt="" width="64" height="64"><span>${esc(badge.name)}</span></a>`).join("") : `<span class="profile-no-badges">Your first badge is waiting.</span>`}</div></section>`]);
    if (games.length) {
      profileSections.push(["all-games", "All games", `<section class="profile-shelf" data-profile-section="all-games">${sectionHeader("All games", "library", games.length)}<div class="profile-poster-rail">${games.slice(0, 6).map(item => posterButton(item, esc)).join("")}</div></section>`]);
      profileSections.push(["playing", "Playing", statusShelf("Playing", "library?status=Playing", playingGames, "Add playing games").replace('<section class="profile-shelf">', '<section class="profile-shelf" data-profile-section="playing">')]);
      profileSections.push(["completed", "Completed games", statusShelf("Completed games", "library?status=Completed", completedGames, "Add completed games").replace('<section class="profile-shelf">', '<section class="profile-shelf" data-profile-section="completed">')]);
      profileSections.push(["favorites", "Favorites", `<section class="profile-shelf" data-profile-section="favorites">${sectionHeader("Favorites", "favorites", favorites.length)}${favorites.length ? `<div class="profile-poster-rail">${favorites.slice(0, 6).map(item => posterButton(item, esc)).join("")}</div>` : `<button type="button" class="profile-favorite-empty" data-go="favorites"><span class="profile-favorite-plus" aria-hidden="true">+</span><span>Add favorites</span></button>`}</section>`]);
      profileSections.push(["backlog", "Backlog", statusShelf("Backlog", "library?status=Backlog", backlogGames, "Add backlog games").replace('<section class="profile-shelf">', '<section class="profile-shelf" data-profile-section="backlog">')]);
      profileSections.push(["on-hold", "On Hold", statusShelf("On Hold", "library?status=On%20Hold", onHold, "Add on-hold games").replace('<section class="profile-shelf">', '<section class="profile-shelf" data-profile-section="on-hold">')]);
      profileSections.push(["dropped", "Dropped", statusShelf("Dropped", "library?status=Dropped", dropped, "Add dropped games").replace('<section class="profile-shelf">', '<section class="profile-shelf" data-profile-section="dropped">')]);
    }
    const hiddenStatuses = new Set((statusOptions.hidden || {}).game || []);
    (statusOptions.custom?.game || []).forEach(name => { const rows = games.filter(item => item.status === name); profileSections.push([`status-${name}`, name, statusShelf(name, `library?status=${encodeURIComponent(name)}`, rows, `Add ${name.toLocaleLowerCase()} games`).replace('<section class="profile-shelf">', `<section class="profile-shelf" data-profile-section="status-${esc(name)}">`)]); });
    ["playing", "on-hold", "dropped"].forEach(key => { const names = { playing: "Playing", "on-hold": "On Hold", dropped: "Dropped" }; if (hiddenStatuses.has(names[key])) { const at = profileSections.findIndex(row => row[0] === key); if (at >= 0) profileSections.splice(at, 1); } });
    let profileOrder = []; try { profileOrder = JSON.parse(localStorage.getItem("savepoint_profile_section_order") || "[]"); } catch (_) {}
    profileSections.sort((a, b) => { const ai = profileOrder.indexOf(a[0]), bi = profileOrder.indexOf(b[0]); return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi); });
    let hiddenKeys = []; try { hiddenKeys = JSON.parse(localStorage.getItem("savepoint_profile_hidden_sections") || "[]"); } catch (_) {}
    const profileSectionMarkup = profileSections.filter(([key]) => !hiddenKeys.includes(key)).map(([, , html]) => html).join("");
    const reorderSheet = `<dialog class="profile-reorder-dialog" id="profile-reorder-dialog" aria-label="Reorder profile sections"><header><strong>Reorder profile</strong><button type="button" data-profile-reorder-close aria-label="Done reordering">Done</button></header><p>Use the arrows to change the order on your profile.</p><nav>${profileSections.map(([key, label], index) => `<div class="profile-reorder-row" data-order-key="${key}"><span class="profile-reorder-count">${index + 1}</span><strong>${label}</strong><span class="profile-reorder-arrows"><button type="button" class="profile-eye-toggle" data-section-eye aria-pressed="${hiddenKeys.includes(key)}" aria-label="${hiddenKeys.includes(key) ? "Show" : "Hide"} ${label} on profile"><i data-lucide="${hiddenKeys.includes(key) ? "eye-off" : "eye"}" aria-hidden="true"></i></button><button type="button" data-order-move="up" aria-label="Move ${label} up"${index === 0 ? " disabled" : ""}><i data-lucide="chevron-up" aria-hidden="true"></i></button><button type="button" data-order-move="down" aria-label="Move ${label} down"${index === profileSections.length - 1 ? " disabled" : ""}><i data-lucide="chevron-down" aria-hidden="true"></i></button></span></div>`).join("")}</nav></dialog>`;
    return `<section class="profile-page"><section class="profile-hero"><div class="profile-cover">${cover ? imgMarkup(cover, esc, { landscape: true, override: pickedSrc(cover, "cover", prefs) }) : `<span class="profile-cover-empty"></span>`}<span class="profile-cover-shade"></span></div><button type="button" class="profile-overflow-trigger" aria-label="More profile options" data-open-profile-menu><i data-lucide="ellipsis" aria-hidden="true"></i></button><div class="profile-identity"><span class="profile-avatar-wrap"><span class="profile-avatar">${avatarMarkup(esc, items, prefs)}</span><a class="profile-avatar-edit" href="#profile-cover" aria-label="Edit profile photo and cover"><i data-lucide="pencil" aria-hidden="true"></i></a></span><button type="button" class="profile-add-manual" data-profile-add><i data-lucide="plus" aria-hidden="true"></i><span>Add manually</span></button></div></section><dialog class="profile-options-dialog" id="profile-options-dialog" aria-label="Profile options"><header><strong>Profile options</strong><button type="button" data-profile-menu-close aria-label="Close options">×</button></header><nav><button type="button" data-profile-reorder-open><i data-lucide="list-ordered" aria-hidden="true"></i><span>Reorder profile sections</span></button><a href="#achievements"><i data-lucide="award" aria-hidden="true"></i><span>Achievements</span></a><a href="#timeline"><i data-lucide="history" aria-hidden="true"></i><span>Timeline</span></a><a href="#settings/metadata-sources"><i data-lucide="database" aria-hidden="true"></i><span>Sources</span></a><a href="#setup"><i data-lucide="wand-sparkles" aria-hidden="true"></i><span>Quick setup</span></a><a href="#settings"><i data-lucide="settings" aria-hidden="true"></i><span>Settings</span></a><a href="#settings/app-info"><i data-lucide="circle-help" aria-hidden="true"></i><span>About</span></a></nav></dialog>${reorderSheet}<div class="profile-reorder-sections" data-profile-sections>${profileSectionMarkup}</div>${games.length ? "" : empty}</section>`;
  }

  // ---- Favorites: a poster grid; with none yet, every game is shown with a heart to pick favorites ----
  function favoritesPage(context) {
    const { items = [], esc, dataRevision } = context;
    if (sortedItemsRef !== items || sortedItemsRevision !== dataRevision) {
      sortedItemsRef = items;
      sortedItemsRevision = dataRevision;
      sortedItemsCache = [...items].sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), undefined, { sensitivity: "base" }));
    }
    const favorites = sortedItemsCache.filter(item => item.favorite);
    const pickMode = !favorites.length;
    const query = favoritesQuery.trim().toLocaleLowerCase();
    const rows = (pickMode ? sortedItemsCache : favorites).filter(item => !query || String(item.title || "").toLocaleLowerCase().includes(query));
    const shown = rows.slice(0, favoritesShown);
    const tile = item => `<div class="favorite-grid-tile">${posterButton(item, esc)}<button type="button" class="favorite-heart${item.favorite ? " is-favorite" : ""}" data-action="toggle-favorite" data-id="${esc(item.id)}" aria-label="${item.favorite ? "Remove" : "Add"} ${esc(item.title)} ${item.favorite ? "from" : "to"} favorites" aria-pressed="${Boolean(item.favorite)}"><i data-lucide="heart" aria-hidden="true"></i></button></div>`;
    const intro = pickMode ? `<div class="favorite-picker-intro"><i data-lucide="heart" aria-hidden="true"></i><div><strong>Pick your favorite games</strong><span>Tap the heart on the games you love most.</span></div></div>` : "";
    const restoring = Boolean(context.libraryLoading);
    const empty = restoring
      ? `<div class="profile-empty" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><strong>Loading your games…</strong><span>Your saved collection is being restored.</span></div>`
      : `<div class="profile-empty"><i data-lucide="library" aria-hidden="true"></i><strong>No games yet</strong><span>Add games to your library first.</span><button type="button" data-go="discover">Explore games</button></div>`;
    const search = items.length ? `<label class="profile-collection-search favorite-search"><i data-lucide="search" aria-hidden="true"></i><input type="search" data-favorites-search value="${esc(favoritesQuery)}" placeholder="${pickMode ? "Find a game to favorite" : "Search favorites"}" autocomplete="off" aria-label="${pickMode ? "Find a game to favorite" : "Search favorites"}"></label>` : "";
    const noMatches = `<div class="profile-empty"><i data-lucide="search-x" aria-hidden="true"></i><strong>No games found</strong><span>Try a different title.</span></div>`;
    return `<section class="profile-page profile-collection-page"><header class="profile-list-header"><button type="button" data-go="profile" aria-label="Back to profile"><i data-lucide="chevron-left" aria-hidden="true"></i></button><h2>Favorites <small>${pickMode ? "" : rows.length}</small></h2><span></span></header>${restoring ? empty : `${intro}${search}${rows.length ? `<div class="profile-collection-grid favorite-grid">${shown.map(tile).join("")}</div>${rows.length > shown.length ? `<button type="button" class="watchlist-browse" data-favorites-more>Show more · ${rows.length - shown.length} remaining</button>` : ""}` : items.length ? noMatches : empty}`}</section>`;
  }

  window.SplitAppPages.profile = profilePage;
  window.SplitAppPages.favorites = favoritesPage;
  window.SplitAppPages.setFavoritesQuery = query => { favoritesQuery = String(query || ""); favoritesShown = 60; };
  window.SplitAppPages.showMoreFavorites = () => { favoritesShown += 60; };
  window.SplitAppPages["profile-cover"] = profileCoverPage;
  window.SplitAppPages.coverCandidates = (item, kind) => flatCandidates(item, kind);
  window.SplitAppPages.browseCover = (kind, id) => { browse[kind] = id || ""; };
  window.SplitAppPages.moreCovers = kind => { pickerLimit[kind] = (pickerLimit[kind] || 18) + 24; };
  window.SplitAppPages.setCoverTab = tab => { browse.cover = browse.avatar = ""; coverTab = tab === "cover" ? "cover" : "avatar"; };
  window.SplitAppPages.shuffleProfileCover = (items, prefs, kind = "cover") => { pickFor(kind === "avatar" ? "avatar" : "cover", items, prefs, true); };
  // Image failure handler: try the next candidate while online; offline (or when every web address failed) use the saved IndexedDB copy.
  window.SplitAppPages.artError = img => {
    const next = (img.dataset.fallbackSrcs || "").split("\n").filter(Boolean), offline = typeof navigator !== "undefined" && navigator.onLine === false;
    const advance = () => { if (!next.length) return false; img.dataset.fallbackSrcs = next.slice(1).join("\n"); img.src = next[0]; return true; };
    const giveUp = () => { img.style.display = "none"; if (img.nextElementSibling) img.nextElementSibling.hidden = false; };
    if (!offline && advance()) return;
    if (img.dataset.artItem && !img.dataset.artRecovered && typeof window.SplitAppPages.recoverArt === "function") {
      img.dataset.artRecovered = "1";
      Promise.resolve(window.SplitAppPages.recoverArt(img)).then(ok => { if (!ok && !advance()) giveUp(); }).catch(() => { if (!advance()) giveUp(); });
      return;
    }
    if (!advance()) giveUp();
  };
  window.SplitAppPages.profileArt = { artOf, artList, imgMarkup, posterButton };
})();
