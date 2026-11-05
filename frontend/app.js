(() => {
  "use strict";

  const config = window.APP_CONFIG;
  const nativeAndroid = Boolean(window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.() === "android");
  const dashboardPageSize = nativeAndroid ? 8 : 12;
  const titles = { dashboard: "Collection", discover: "Discover", explore: "Explore", mix: "Mix fetch", details: "Details", add: "Add Game", "import-preview": "Import List", export: "Export", sync: "Metadata Sync", timeline: "Timeline", statistics: "Statistics", settings: "Settings" };
  const navItems = [
    { key: "dashboard", label: "Home", icon: "⌂", locked: true },
    { key: "discover", label: "Discover", icon: "✧" },
    { key: "explore", label: "Explore", icon: "compass" },
    { key: "timeline", label: "Timeline", icon: "◷" },
    { key: "statistics", label: "Stats", icon: "▥" },
    { key: "settings", label: "Settings", icon: "⚙", locked: true }
  ];
  const navKeys = navItems.map(item => item.key);
  const prefsDefaults = {
    theme: "light", textSize: "normal", dateFormat: "auto", iconStyle: "inline", imageStorage: "all", favoritesOnly: false, reduceMotion: false, animationSpeed: "normal", animationCustom: 100, animationEasing: "smooth", pageTransition: "rise", cardEntrance: "none", animationStagger: false, sheetAnimation: "slide", pressEffect: "shrink", hoverLift: false, navBounce: true, progressAnimation: true, skeletonShimmer: true, font: "system", mainColor: "#6355f8", categoryColors: {},
    showSidebar: true, showScrollbars: false, bottomBarStyle: "icon-color", bottomBarCorners: "sharp", bottomBarLabels: "icons-only", bottomBarBackground: "solid", bottomBarTransparency: 100, bottomBarLayout: "spread", navIcons: { dashboard: "home", search: "search", discover: "bookmark", explore: "compass", timeline: "calendar-days", statistics: "pie-chart", settings: "settings" },
    navBar: { order: ["dashboard", "discover", "explore", "settings", "timeline", "statistics"], visible: { dashboard: true, discover: true, explore: true, timeline: false, statistics: false, settings: true } },
    metadataSourceOrder: ["freetogame", "steamdb", "howlongtobeat", "rawg", "igdb"], customSources: [],
    dashboardView: "list", dashboardDefaultCategory: "remember", dashboardDefaultPlatform: "all", dashboardPlatformFilter: "all", cardCorners: "rounded", dashboardDensity: "comfortable", dashboardGroupBy: "status", dashboardSort: "alphabetical-asc", dashboardStatusFilter: "all", dashboardRowActions: "menu", oneHandedMode: "off", tabletTwoColumn: true, showThumbnails: true, showRatings: true, showProgress: true, ratingFormat: "5-stars",
    automaticCompletion: "automatic", defaultStatus: "", progressIncrement: 1, humanReadableStats: false, currencyDisplay: "USD", usdToInrRate: 94.8,
    backupSchedule: "daily", backupRetention: 10, backupBeforeDestructive: true, pauseSyncInBackground: true, backupIncludeRatings: true, folderSyncDelay: 30, restorePreview: true,
    metadataMode: "online", metadataSources: { freetogame: true, steamdb: true, howlongtobeat: true, rawg: false, igdb: false }, metadataRefreshInterval: "weekly", metadataRetryLimit: 3, offlineFallback: "cached", metadataSyncFrequency: "immediate", metadataWorkers: 5, thumbnailCleanup: "weekly", metadataThumbnails: true, thumbnailSize: "medium", thumbnailQuality: "balanced",
    imageCacheMaxEntries: 250, storageWarningLimitMb: 500, backupStorageLimitMb: 1000, backgroundBackups: false,
    apiKeys: {}, sourceOptions: {}
  };
  const themePalettes = {
    light: { mode:"light", background:"#f8fafc", shell:"#f8fafc", surface:"#ffffff", surface2:"#f1f5f9", line:"rgba(15,23,42,.10)", text:"#0f172a", muted:"#64748b" },
    dark: { mode:"dark", background:"#030712", shell:"#0b0f19", surface:"#161c2d", surface2:"#111827", line:"rgba(255,255,255,.09)", text:"#f8fafc", muted:"#94a3b8" },
    grey: { mode:"dark", background:"#0b0f19", shell:"#111827", surface:"#1f2937", surface2:"#283548", line:"rgba(255,255,255,.10)", text:"#f9fafb", muted:"#9ca3af" },
    amoled: { mode:"dark", background:"#000000", shell:"#000000", surface:"#101010", surface2:"#1a1a1a", line:"rgba(255,255,255,.12)", text:"#f8fafc", muted:"#a1a1aa" },
    flashbang: { mode:"light", background:"#f8fafc", shell:"#f8fafc", surface:"#ffffff", surface2:"#f1f5f9", line:"rgba(15,23,42,.14)", text:"#0f172a", muted:"#475569" },
    "material-you": { mode:"dark", background:"#080a12", shell:"#10131d", surface:"#1a1e2b", surface2:"#252a3a", line:"rgba(255,255,255,.10)", text:"#f8fafc", muted:"#a3a8bb" },
    ocean: { mode:"dark", background:"#04111c", shell:"#081b2b", surface:"#10283a", surface2:"#18364b", line:"rgba(186,230,253,.12)", text:"#e0f2fe", muted:"#93b4c8" },
    forest: { mode:"dark", background:"#091710", shell:"#10221b", surface:"#173126", surface2:"#203e31", line:"rgba(187,247,208,.12)", text:"#ecfdf5", muted:"#9eb8a9" },
    sunset: { mode:"dark", background:"#180d0b", shell:"#261714", surface:"#38221d", surface2:"#482d25", line:"rgba(255,237,213,.13)", text:"#fff7ed", muted:"#c9a99a" },
    rose: { mode:"dark", background:"#170d15", shell:"#251722", surface:"#382333", surface2:"#482b40", line:"rgba(255,228,230,.12)", text:"#fff1f2", muted:"#c9a3b6" },
    lavender: { mode:"dark", background:"#120f20", shell:"#211d35", surface:"#302949", surface2:"#3d355b", line:"rgba(237,233,254,.13)", text:"#f5f3ff", muted:"#b4a8d4" },
    nord: { mode:"dark", background:"#151b25", shell:"#242d3b", surface:"#303b4b", surface2:"#3b485a", line:"rgba(236,239,244,.12)", text:"#eceff4", muted:"#aab6c5" },
    sand: { mode:"light", background:"#f7f0e3", shell:"#faf4e8", surface:"#fffaf0", surface2:"#f0e7d7", line:"rgba(68,54,38,.14)", text:"#29231d", muted:"#756858" },
    mint: { mode:"light", background:"#e8f6ef", shell:"#effaf5", surface:"#fafffc", surface2:"#e2f2eb", line:"rgba(18,53,45,.13)", text:"#12352d", muted:"#5d7d70" }
  };
  const fontFamilies = {
    system:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", inter:"Inter,sans-serif", outfit:"Outfit,sans-serif",
    serif:"Georgia,'Times New Roman',serif", monospace:"ui-monospace,SFMono-Regular,Menlo,monospace", mono:"ui-monospace,SFMono-Regular,Menlo,monospace", rounded:"ui-rounded,'Arial Rounded MT Bold',sans-serif",
    poppins:"Poppins,sans-serif", roboto:"Roboto,sans-serif", nunito:"Nunito,sans-serif", lato:"Lato,sans-serif", merriweather:"Merriweather,serif",
    "jetbrains-mono":"'JetBrains Mono',monospace", "open-sans":"'Open Sans',sans-serif", montserrat:"Montserrat,sans-serif", oswald:"Oswald,sans-serif",
    raleway:"Raleway,sans-serif", ubuntu:"Ubuntu,sans-serif", "playfair-display":"'Playfair Display',serif", "fira-sans":"'Fira Sans',sans-serif",
    rubik:"Rubik,sans-serif", quicksand:"Quicksand,sans-serif", caveat:"Caveat,cursive"
  };
  function safeLucideName(value, fallback = "circle") {
    const name = String(value || "");
    if (name === "↺" || name === "↻") return "rotate-ccw";
    const exportName = name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase()).replace(/^./, char => char.toUpperCase());
    return window.lucide?.icons?.[exportName] ? name : fallback;
  }
  const storageKey = window.SplitAppBackend?.storageKey || `splitapp_${config.key}_v1`;
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (_) { stored = {}; }
  const prefs = { ...prefsDefaults, ...(stored.preferences || {}) };
  delete prefs.appLook;
  delete prefs.recentlyAddedLimit;
  delete prefs.appDisplayName;
  prefs.categoryColors = { ...prefsDefaults.categoryColors, ...(stored.preferences?.categoryColors || {}) };
  prefs.apiKeys = { ...prefsDefaults.apiKeys, ...(stored.preferences?.apiKeys || {}) };
  prefs.sourceOptions = { ...(stored.preferences?.sourceOptions || {}) };
  prefs.metadataSources = { ...prefsDefaults.metadataSources, ...(stored.preferences?.metadataSources || {}) };
  function refreshSourceRegistry() {
    prefs.customSources = Array.isArray(prefs.customSources) ? prefs.customSources.filter(config => config && config.id && /^https?:\/\//i.test(config.searchUrl || "")) : [];
    window.SplitAppMetadata.setCustom(prefs.customSources);
    window.SplitAppMetadata.normalize(prefs);
    const keys = window.SplitAppSources.list().map(source => source.key), saved = Array.isArray(prefs.metadataSourceOrder) ? prefs.metadataSourceOrder : [];
    prefs.metadataSourceOrder = [...saved.filter((key, index) => keys.includes(key) && saved.indexOf(key) === index), ...keys.filter(key => !saved.includes(key))];
  }
  refreshSourceRegistry();
  normalizeNavigationPrefs();
  function normalizeNavigationPrefs() {
    if (["icon", "icons-only"].includes(prefs.bottomBarStyle) && !Object.prototype.hasOwnProperty.call(stored.preferences || {}, "bottomBarLabels")) prefs.bottomBarLabels = "icons-only";
    if (prefs.bottomBarStyle === "soft") prefs.bottomBarStyle = "box";
    if (["icon", "icons-only", "pill"].includes(prefs.bottomBarStyle)) prefs.bottomBarStyle = "box";
    if (!["box", "icon-color", "underline"].includes(prefs.bottomBarStyle)) prefs.bottomBarStyle = prefsDefaults.bottomBarStyle;
    if (!["round", "sharp"].includes(prefs.bottomBarCorners)) prefs.bottomBarCorners = prefsDefaults.bottomBarCorners;
    if (!["icons-labels", "icons-only"].includes(prefs.bottomBarLabels)) prefs.bottomBarLabels = prefsDefaults.bottomBarLabels;
    prefs.showSidebar = prefs.showSidebar !== false;
    prefs.showScrollbars = prefs.showScrollbars === true;
    if (prefs.bottomBarBackground === "solid") prefs.bottomBarTransparency = 100;
    prefs.navIcons = { ...prefsDefaults.navIcons, ...(prefs.navIcons || {}) };
    const legacyIcons = { "⌂": "controller", "⌕": "search", "✧": "sparkles", "◷": "calendar-days", "▥": "pie-chart", "⚙": "settings" };
    navKeys.forEach(key => {
      const icon = prefs.navIcons[key];
      if (legacyIcons[icon]) prefs.navIcons[key] = legacyIcons[icon];
      else if (icon !== "controller") prefs.navIcons[key] = safeLucideName(icon, prefsDefaults.navIcons[key]);
    });
    const savedNav = prefs.navBar || {};
    const savedOrder = Array.isArray(savedNav.order) ? savedNav.order.filter((key, index, keys) => navKeys.includes(key) && keys.indexOf(key) === index) : [];
    prefs.navBar = { order: [...savedOrder, ...navKeys.filter(key => !savedOrder.includes(key))], visible: { ...prefsDefaults.navBar.visible, ...(savedNav.visible || {}), dashboard: true, settings: true } };
    const savedSourceOrder = Array.isArray(prefs.metadataSourceOrder) ? prefs.metadataSourceOrder : [];
    const sourceKeys = window.SplitAppSources.list().map(source => source.key);
    prefs.metadataSourceOrder = [...savedSourceOrder.filter((key, index) => sourceKeys.includes(key) && savedSourceOrder.indexOf(key) === index), ...sourceKeys.filter(key => !savedSourceOrder.includes(key))];
  }
  let items = Array.isArray(stored.items) ? stored.items : [];
  let history = Array.isArray(stored.history) ? stored.history : [];
  const [initialHashPath, initialHashQuery = ""] = location.hash.slice(1).split("?");
  const initialRoute = initialHashPath.split("/");
  let discoverSource = new URLSearchParams(initialHashQuery).get("source") || "";
  let page = initialRoute[0] === "search" ? "dashboard" : initialRoute[0] in titles ? initialRoute[0] : "dashboard";
  const statsSections = ["playtime", "library", "breakdown", "activity", "ratings"];
  const normalizeStatsSection = section => section === "breakdown" ? "library" : section;
  let statsSubpage = page === "statistics" && statsSections.includes(initialRoute[1]) ? normalizeStatsSection(initialRoute[1]) : "";
  let settingsGroup = page === "settings" ? (initialRoute[1] === "manage-backups" ? "backups" : initialRoute[1] || null) : null;
  let settingsParam = initialRoute[0] === "settings" ? new URLSearchParams(initialHashQuery).get("id") || "" : "", settingsFrom = "", settingsOrigin = "", lastOutsidePage = "", renderedSettingsGroup;
  let statsLimits = { rated: 10, quick: 8 };
  let renderedRoute = null, inAppNav = false, mixCache = null, mixRequest = 0, statsRange = "week", statsActivityDate = "";
  let metadataSourceFilter = "all";
  let entryDraftId = null, addReturnPage = "dashboard";
  let importState = null;
  let libraryQuery = new URLSearchParams(location.search).get("q") || "";
  let discoverQuery = "";
  let addMetadataQuery = "";
  let timelineFilter = "all", timelineSearch = "", timelineMonth = "", timelineYear = "";
  let dashboardStatusFilter = prefs.dashboardDefaultCategory === "remember"
    ? prefs.dashboardLastStatus || "all"
    : prefs.dashboardDefaultCategory && prefs.dashboardDefaultCategory !== "all"
      ? prefs.dashboardDefaultCategory
      : prefs.dashboardStatusFilter || "all";
  let dashboardPlatformFilter = prefs.dashboardDefaultPlatform && prefs.dashboardDefaultPlatform !== "all" ? prefs.dashboardDefaultPlatform : prefs.dashboardPlatformFilter || "all";
  const platformFilters = ["all", "pc", "mac", "mobile", "xbox", "playstation", "nintendo"];
  if (!platformFilters.includes(dashboardPlatformFilter)) dashboardPlatformFilter = prefs.dashboardPlatformFilter = "all";
  function itemPlatformText(item) {
    const savedField = item.cachedDetails?.fields?.find(field => /^platforms?$/i.test(String(field.label || "")))?.value;
    const raw = item.facts?.platforms || item.cachedDetails?.facts?.platforms || savedField || item.platforms || "";
    const flatten = value => Array.isArray(value) ? value.map(flatten).join(" ") : value && typeof value === "object" ? Object.values(value).map(flatten).join(" ") : String(value || "");
    return flatten(raw).toLowerCase();
  }
  // Platform buckets are computed once per item (cached by the identity of the data they derive from),
  // so filtering/counting 1500+ games does not re-run regexes on every render.
  const platformMaskCache = new WeakMap();
  const PLATFORM_BITS = { pc: 1, mac: 2, mobile: 4, xbox: 8, playstation: 16, nintendo: 32 };
  function itemPlatformMask(item) {
    const cached = platformMaskCache.get(item);
    if (cached && cached.facts === item.facts && cached.details === item.cachedDetails) return cached.mask;
    const value = itemPlatformText(item);
    let mask = 0;
    if (value) {
      if (/\bpc\b|windows|linux|steam deck/.test(value)) mask |= PLATFORM_BITS.pc;
      if (/macos?|macintosh|os x/.test(value)) mask |= PLATFORM_BITS.mac;
      if (/android|ios|iphone|ipad|mobile|\bphone\b|tablet/.test(value)) mask |= PLATFORM_BITS.mobile;
      if (/xbox/.test(value)) mask |= PLATFORM_BITS.xbox;
      if (/playstation|\bps[1-5]\b/.test(value)) mask |= PLATFORM_BITS.playstation;
      if (/nintendo|switch|\bwii\b|\bds\b/.test(value)) mask |= PLATFORM_BITS.nintendo;
    } else if (/steam/i.test(`${item.metadataSource || ""} ${item.facts?.source || ""} ${(item.mixSourceKeys || []).join(" ")} ${item.url || ""}`) || item.steamAppId || item.appId) {
      // Steam-library games often carry no platform field; they are PC games.
      mask = PLATFORM_BITS.pc;
    }
    platformMaskCache.set(item, { facts: item.facts, details: item.cachedDetails, mask });
    return mask;
  }
  function matchesPlatform(item, filter = dashboardPlatformFilter) {
    if (!filter || filter === "all") return true;
    const bit = PLATFORM_BITS[filter];
    return bit ? Boolean(itemPlatformMask(item) & bit) : true;
  }
  function normalizeDashboardView() {
    const legacyDashboardViews = { cards: "detailed-grid", grid: "detailed-grid", "compact-list": "list", timeline: "list" };
    if (legacyDashboardViews[prefs.dashboardView]) prefs.dashboardView = legacyDashboardViews[prefs.dashboardView];
    if (!["list", "detailed-grid", "compact-grid", "large-grid"].includes(prefs.dashboardView)) prefs.dashboardView = "list";
  }
  normalizeDashboardView();
  if (prefs.dashboardSort === "title") prefs.dashboardSort = "alphabetical-asc";
  else if (prefs.dashboardSort === "recent") prefs.dashboardSort = "created-desc";
  else if (prefs.dashboardSort === "rating") prefs.dashboardSort = "rating-desc";
  if (!["all", ...config.categories[0].statuses].includes(dashboardStatusFilter)) dashboardStatusFilter = prefs.dashboardStatusFilter = "all";
  delete prefs.defaultCategory;
  let activeCategory = "all";
  let toastTimer;
  const detailIdFromQuery = query => { const raw = String(query || ""); return raw.startsWith("=") ? decodeURIComponent(raw.slice(1)) : new URLSearchParams(raw).get("id") || ""; };
  let detailTab = "";
  let detailItemId = initialRoute[0] === "details" ? detailIdFromQuery(initialHashQuery) || null : null, detailPreview = null, detailData = null, detailError = "", detailLoading = false, detailEditMode = false, detailReturnPage = "dashboard", detailRequest = 0;
  let detailRestorePending = Boolean(detailItemId);
  let detailImagePosition = 0, detailImageOpener = null;
  let dashboardLazyObserver = null;
  let dashboardLoadPending = false;
  let dashboardSortedItemsCache = null;
  let deferredImageObserver = null, deferredImageFlushTimer = 0, deferredImageDrain = null;
  const deferredLocalImageQueue = [], deferredLocalImageRequests = new Map();
  let searchRenderTimer = null;
  let discoverRequestId = 0;
  let addMetadataRequestId = 0;
  let localMutationRevision = 0;
  const mixEnrichmentByItem = new Map();
  const detailRefreshByItem = new Map();
  let discoverCache = null, discoverSubmitted = "", discoverSubmittedAt = 0, discoverInFlight = "";
  let timelineThumbnailLookup = null;
  const timelineLocalThumbnailChecked = new Set();
  const timelineOnlineThumbnailRequested = new Set();
  const timelineImageCacheRequests = new Map();

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const category = key => config.categories.find(item => item.key === key) || config.categories[0];
  const labelCategory = key => category(key)?.label || key;
  const defaultStatus = key => category(key)?.statuses?.[0] || "Backlog";
  // Each open sheet/dialog gets a history entry so the back button (or Android back) closes it first.
  let dialogEntries = 0, skipNextPop = false, closingFromPop = false;
  function pushDialogEntry() { try { window.history.pushState({ dialog: true }, "", location.href); dialogEntries += 1; } catch (_) {} }
  function popDialogEntry() { if (dialogEntries > 0 && window.history.state?.dialog) { dialogEntries -= 1; skipNextPop = true; window.history.back(); } }
  // In-app confirmation sheet (replaces the browser's window.confirm). Resolves true or false.
  function appConfirm(message, { title = "Are you sure?", confirmLabel = "Confirm", danger = false } = {}) {
    return new Promise(resolve => {
      let dialog = document.getElementById("app-confirm");
      if (!dialog) { dialog = document.createElement("dialog"); dialog.id = "app-confirm"; dialog.className = "app-confirm"; dialog.setAttribute("aria-labelledby", "app-confirm-title"); document.body.appendChild(dialog); }
      dialog.innerHTML = `<div class="app-confirm-card"><h2 id="app-confirm-title">${esc(title)}</h2><p>${esc(message)}</p><div class="app-confirm-actions"><button type="button" class="button secondary" data-confirm="no">Cancel</button><button type="button" class="button ${danger ? "danger" : "primary"}" data-confirm="yes">${esc(confirmLabel)}</button></div></div>`;
      let settled = false;
      const finish = value => { if (settled) return; settled = true; try { dialog.close(); } catch (_) {} dialog.removeAttribute("open"); resolve(value); };
      dialog.onclose = () => finish(false); dialog.oncancel = () => finish(false);
      dialog.onclick = event => { const choice = event.target.closest("[data-confirm]"); if (choice) finish(choice.dataset.confirm === "yes"); else if (event.target === dialog) finish(false); };
      try { dialog.showModal(); } catch (_) { dialog.setAttribute("open", ""); }
      dialog.querySelector('[data-confirm="yes"]')?.focus();
    });
  }
  function showPopup(dialog, { silent = false } = {}) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      try { dialog.showModal(); if (!silent) pushDialogEntry(); return; } catch (_) {}
    }
    dialog.setAttribute("open", "");
    dialog.setAttribute("aria-modal", "true");
    dialog.dataset.popupFallback = "true";
    document.body.dataset.popupFallback = "true";
  }
  function closePopup(dialog, { preserveHistory = false } = {}) {
    if (!dialog) return;
    if (typeof dialog.close === "function") {
      try {
        const wasOpen = dialog.open;
        dialog.close();
        if (wasOpen && !closingFromPop) {
          if (preserveHistory) dialogEntries = Math.max(0, dialogEntries - 1);
          else popDialogEntry();
        }
        return;
      } catch (_) {}
    }
    dialog.removeAttribute("open");
    dialog.removeAttribute("aria-modal");
    delete dialog.dataset.popupFallback;
    if (!document.querySelector("dialog[data-popup-fallback][open]")) delete document.body.dataset.popupFallback;
  }

  // O(1) game lookup. The index stores each id's position and re-checks it on every hit,
  // so it can never return a replaced or moved entry; a miss rebuilds it once.
  let itemIndex = new Map();
  function itemById(id) {
    const key = String(id);
    let at = itemIndex.get(key);
    if (at !== undefined && String(items[at]?.id) === key) return items[at];
    itemIndex = new Map(items.map((row, index) => [String(row.id), index]));
    at = itemIndex.get(key);
    return at === undefined ? undefined : items[at];
  }
  // Saving is scoped so a change only touches what changed:
  //   persist()                    whole library (imports, resets, anything unspecified)
  //   persist({ ids: [id, ...] })  only those games (add / edit / status / progress / rating / sync)
  //   persist({ removed: [id] })   delete those games
  //   persist({ meta: true })      preferences and history only
  // Bursts are coalesced into one write ~250ms after the last change.
  let persistTimer = 0, persistWaiters = [], persistFull = false;
  let selectMode = false, lastAutoBackup = 0; const selectedIds = new Set();
  const persistIds = new Set(), persistRemoved = new Set();
  function persist(scope) {
    localMutationRevision += 1;
    if (scope && typeof scope === "object") {
      (scope.ids || []).forEach(id => persistIds.add(String(id)));
      (scope.removed || []).forEach(id => persistRemoved.add(String(id)));
    } else persistFull = true;
    const promise = new Promise(resolve => persistWaiters.push(resolve));
    clearTimeout(persistTimer);
    persistTimer = setTimeout(flushPersist, 250);
    return promise;
  }
  function flushPersist() {
    clearTimeout(persistTimer); persistTimer = 0;
    const waiters = persistWaiters; persistWaiters = [];
    if (!waiters.length) return;
    const scope = persistFull ? { full: true } : { ids: [...persistIds], removed: [...persistRemoved] };
    persistFull = false; persistIds.clear(); persistRemoved.clear();
    const write = window.SplitAppBackend?.save({ items, history, preferences: prefs }, scope);
    const finish = () => waiters.forEach(resolve => resolve());
    if (write?.catch) write.catch(error => { recordLog("error", `App data save failed: ${error.message || error}`); }).then(finish);
    else finish();
  }
  function recordLog(level, message) {
    try {
      const key = `${storageKey}_log`;
      const entries = JSON.parse(localStorage.getItem(key) || "[]");
      entries.unshift({ level, message: String(message), at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(entries.slice(0, 200)));
    } catch (_) {}
  }
  async function runWithConcurrency(values, requestedWorkers, task) {
    const queue = [...values];
    const workers = Math.max(1, Math.min(10, Number(requestedWorkers) || 4, queue.length || 1));
    await Promise.all(Array.from({ length: workers }, async () => {
      while (queue.length) await task(queue.shift());
    }));
  }
  function toast(message) {
    // Background notices (backup, sync finished) must not hide an Undo that is still on screen.
    if (/^(Backup saved|Exporting|Metadata sync finished|Sync finished|Syncing |Saved details)/.test(message) && document.querySelector("#toast.has-action.show")) return;
    const node = $("#toast"); node.classList.remove("has-action"); node.textContent = message; node.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2300);
  }
  function applyPreferences() {
    document.body.dataset.page = page;
    const selectedTheme = prefs.theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : prefs.theme;
    const palette = themePalettes[selectedTheme] || themePalettes.dark;
    document.body.dataset.theme = palette.mode;
    document.body.dataset.palette = themePalettes[selectedTheme] ? selectedTheme : "dark";
    const root = document.documentElement;
    root.style.setProperty("--page-background", palette.background);
    document.body.style.color = palette.text;
    // Text-safe versions of the accent and status colors for this theme's surfaces (nudged lighter on dark themes, darker on light ones until they read clearly).
    const toRgb = hex => { const m = String(hex).replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i) || String(hex).replace("#", "").match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i)?.slice(1).map(x => x + x).reduce((acc, x, i) => (acc[i + 1] = x, acc), []); return m ? [1, 2, 3].map(i => parseInt(m[i], 16)) : [99, 102, 241]; };
    const relLum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const contrast = (a, b) => { const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };
    const readable = hex => {
      let color = toRgb(hex); const surfaces = [palette.surface, palette.surface2, palette.shell].map(toRgb), target = palette.mode === "dark" ? [255, 255, 255] : [0, 0, 0];
      for (let step = 0; step <= 20 && Math.min(...surfaces.map(surface => contrast(color, surface))) < 4.5; step++) color = color.map((v, i) => Math.round(v + (target[i] - v) * .12));
      return `rgb(${color.join(",")})`;
    };
    const accentRgb = toRgb(prefs.mainColor || "#6355f8");
    const accentForeground = contrast([255, 255, 255], accentRgb) >= contrast([17, 24, 39], accentRgb) ? "#fff" : "#111827";
    document.body.style.setProperty("--accent-foreground", accentForeground);
    document.body.style.setProperty("--accent-text", readable(prefs.mainColor || "#6355f8"));
    document.body.style.setProperty("--warn-text", readable("#d97706"));
    document.body.style.setProperty("--danger-text", readable("#dc3545"));
    document.body.style.setProperty("--ok-text", readable("#16a34a"));
    document.body.style.setProperty("--info-text", readable("#0ea5e9"));
    document.body.style.setProperty("--legacy-bg", palette.shell);
    document.body.style.setProperty("--legacy-card", palette.surface);
    document.body.style.setProperty("--legacy-text", palette.text);
    document.body.style.setProperty("--legacy-secondary", palette.muted);
    document.body.style.setProperty("--surface", palette.surface);
    document.body.style.setProperty("--surface-2", palette.surface2);
    document.body.style.setProperty("--line", palette.line);
    document.body.style.setProperty("--muted", palette.muted);
    document.body.style.setProperty("--accent-soft", `color-mix(in srgb, ${prefs.mainColor || "#6355f8"} ${palette.mode === "light" ? "12%" : "20%"}, ${palette.surface})`);
    document.body.dataset.reducedMotion = String(Boolean(prefs.reduceMotion));
    // Three tiers: "low" (data saver, <=2 GB or <=2 cores), "mid" (any Android WebView), "high"
    // (Android with >=6 GB and >=6 cores, or desktop). Low and mid trim blur/shadows/stagger.
    const cores = Number(navigator.hardwareConcurrency) || 4, memory = Number(navigator.deviceMemory) || 4;
    const weak = Boolean(navigator.connection?.saveData) || memory <= 2 || cores <= 2;
    const strongAndroid = nativeAndroid && memory >= 6 && cores >= 6;
    // Every Android WebView gets the lighter effects: on fast 90/120 Hz phones the entrance animations and
    // layered blur were what made scrolling feel worse than on older devices.
    const lowEnd = weak || nativeAndroid;
    root.dataset.perf = weak ? "low" : lowEnd ? "mid" : "high";
    root.dataset.lowend = String(lowEnd);
    root.dataset.nativeAndroid = String(nativeAndroid);
    document.body.dataset.corners = prefs.cardCorners;
    document.body.dataset.density = prefs.dashboardDensity;
    document.body.dataset.dashboardView = prefs.dashboardView;
    document.body.dataset.oneHanded = prefs.oneHandedMode || "off";
    document.body.dataset.tabletColumns = String(prefs.tabletTwoColumn !== false);
    document.body.dataset.barStyle = prefs.bottomBarStyle;
    document.body.dataset.barCorners = prefs.bottomBarCorners;
    document.body.dataset.barLabels = prefs.bottomBarLabels;
    document.body.dataset.sidebar = prefs.showSidebar ? "shown" : "hidden";
    document.documentElement.dataset.showScrollbars = prefs.showScrollbars === true ? "true" : "false";
    window.Capacitor?.Plugins?.ScrollbarControl?.setEnabled?.({ enabled: prefs.showScrollbars === true }).catch(() => {});
    document.body.dataset.barLayout = prefs.bottomBarLayout;
    document.body.dataset.iconStyle = prefs.iconStyle === "inline" ? "inline" : "tiles";
    window.SplitAppDates?.setFormat(prefs.dateFormat); window.SplitAppBackend?.setImageStorage?.(prefs.imageStorage);
    $("#bottom-bar").dataset.bg = prefs.bottomBarBackground;
    document.body.dataset.barBackground = prefs.bottomBarBackground;
    document.body.style.setProperty("--accent", prefs.mainColor || "#6355f8");
    document.documentElement.style.setProperty("--bar-alpha", String(Math.max(0, Math.min(100, Number(prefs.bottomBarTransparency))) / 100));
    document.documentElement.style.setProperty("--text-size", prefs.textSize === "large" ? "18px" : prefs.textSize === "small" ? "14px" : "16px");
    document.documentElement.style.setProperty("--item-art-width", prefs.thumbnailSize === "small" ? "48px" : prefs.thumbnailSize === "large" ? "72px" : "58px");
    document.documentElement.style.setProperty("--item-art-height", prefs.thumbnailSize === "small" ? "58px" : prefs.thumbnailSize === "large" ? "88px" : "72px");
    document.documentElement.style.setProperty("--discover-art-height", prefs.thumbnailSize === "small" ? "110px" : prefs.thumbnailSize === "large" ? "190px" : "150px");
    const speedMs = prefs.reduceMotion || prefs.animationSpeed === "off" ? 0 : prefs.animationSpeed === "fast" ? 100 : prefs.animationSpeed === "slow" ? 320 : prefs.animationSpeed === "custom" ? Math.round(180 * Math.max(25, Math.min(300, Number(prefs.animationCustom) || 100)) / 100) : 180;
    document.documentElement.style.setProperty("--speed", `${speedMs}ms`);
    const easing = { smooth: ["cubic-bezier(.2,.7,.2,1)", "cubic-bezier(.32,.72,0,1)"], spring: ["cubic-bezier(.32,.72,0,1)", "cubic-bezier(.32,.72,0,1)"], bouncy: ["cubic-bezier(.34,1.56,.64,1)", "cubic-bezier(.34,1.56,.64,1)"], linear: ["linear", "linear"] }[prefs.animationEasing] || ["cubic-bezier(.2,.7,.2,1)", "cubic-bezier(.32,.72,0,1)"];
    document.documentElement.style.setProperty("--ease-out", easing[0]); document.documentElement.style.setProperty("--ease-spring", easing[1]);
    Object.entries({ pageAnim: prefs.pageTransition || "slide", cardAnim: prefs.cardEntrance || "rise", stagger: prefs.animationStagger !== false, sheetAnim: prefs.sheetAnimation || "slide", press: prefs.pressEffect || "shrink", hoverLift: prefs.hoverLift === true, navBounce: prefs.navBounce !== false, progressAnim: prefs.progressAnimation !== false, shimmer: prefs.skeletonShimmer !== false }).forEach(([key, value]) => { document.body.dataset[key] = String(value); });
    const fontFamily = fontFamilies[prefs.font] || fontFamilies.inter;
    root.style.setProperty("--font-family", fontFamily);
    root.style.setProperty("--font-heading", fontFamily);
    $("#app-kicker").textContent = config.name.toUpperCase();
    document.title = `${config.name} · ${page === "settings" && settingsGroup ? settingsGroup : titles[page]}`;
    renderSidebar();
    renderBottomBar();
    $$(".nav-button").forEach(button => {
      button.classList.toggle("active", button.dataset.page === page);
      const icon = $(".nav-icon", button);
      if (icon) {
        const selectedIcon = prefs.navIcons[button.dataset.page] || "circle";
        icon.innerHTML = button.dataset.page === "dashboard" && selectedIcon === "controller"
          ? '<img src="icons/controller.svg" alt="">'
          : `<i data-lucide="${safeLucideName(selectedIcon)}"></i>`;
      }
    });
    window.lucide?.createIcons({ root: $("#bottom-bar"), attrs: { "aria-hidden": "true" } });
  }
  function renderBottomBar() {
    const bar = $("#bottom-bar");
    if (!bar) return;
    const byKey = new Map(navItems.map(item => [item.key, item]));
    bar.innerHTML = prefs.navBar.order.filter(key => prefs.navBar.visible[key] !== false).map(key => {
      const item = byKey.get(key); if (!item) return "";
      const icon = prefs.navIcons[key] || item.icon;
      const iconMarkup = key === "dashboard" && icon === "controller" ? '<img src="icons/controller.svg" alt="">' : `<i data-lucide="${safeLucideName(icon)}"></i>`;
      return `<button data-page="${item.key}" class="nav-button${page === item.key ? " active" : ""}" aria-label="${esc(item.label)}"><span class="nav-icon" aria-hidden="true">${iconMarkup}</span><span>${esc(item.label)}</span></button>`;
    }).join("");
  }
  function renderSidebar() {
    const sidebar = $("#sidebar-nav");
    if (!sidebar) return;
    sidebar.innerHTML = navItems.map(item => {
      const icon = prefs.navIcons[item.key] || item.icon;
      const iconMarkup = item.key === "dashboard" && icon === "controller" ? '<img src="icons/controller.svg" alt="">' : `<i data-lucide="${safeLucideName(icon)}"></i>`;
      return `<button type="button" class="sidebar-nav-button${page === item.key ? " active" : ""}" data-sidebar-page="${item.key}" aria-current="${page === item.key ? "page" : "false"}"><span class="sidebar-nav-icon" aria-hidden="true">${iconMarkup}</span><span>${esc(item.label)}</span></button>`;
    }).join("");
    window.lucide?.createIcons({ root: sidebar, attrs: { "aria-hidden": "true" } });
  }
  function syncPageNavigation() {
    document.body.dataset.page = page;
    document.title = `${config.name} · ${page === "settings" && settingsGroup ? settingsGroup : titles[page]}`;
    $$("#bottom-bar .nav-button").forEach(button => button.classList.toggle("active", button.dataset.page === (page === "mix" ? "explore" : page)));
    $$("#sidebar-nav .sidebar-nav-button").forEach(button => {
      const active = button.dataset.sidebarPage === (page === "mix" ? "explore" : page);
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", String(active ? "page" : "false"));
    });
  }
  // Scroll position per page, so Back returns to the spot you left (e.g. the Metadata row in the middle of Settings).
  const scrollMemory = new Map();
  const scrollKey = () => page === "settings" ? `settings/${settingsGroup || ""}` : page === "details" ? `details/${detailItemId || ""}` : page;
  const rememberScroll = () => scrollMemory.set(scrollKey(), window.scrollY);
  const restoreScroll = () => {
    const top = scrollMemory.get(scrollKey()) || 0;
    window.scrollTo({ top, behavior: "auto" });
    if (top) requestAnimationFrame(() => window.scrollTo({ top, behavior: "auto" }));
  };
  function goto(next, updateHistory = true, back = false) {
    if (!back) rememberScroll();
    if (next === "search") next = "dashboard";
    const [nextPage, nextSection] = String(next).split("/");
    if (page === "details" && nextPage !== "details") { detailRequest++; detailLoading = false; }
    page = nextPage in titles ? nextPage : "dashboard";
    statsSubpage = page === "statistics" && statsSections.includes(nextSection) ? normalizeStatsSection(nextSection) : "";
    if (page !== "discover" && !(page === "details" && detailReturnPage === "discover")) { discoverSource = ""; discoverQuery = ""; discoverSubmitted = ""; discoverRequestId++; discoverCache = null; }
    if (page !== "add") { addMetadataQuery = ""; addMetadataRequestId++; entryDraftId = null; }
    if (page !== "settings") settingsGroup = null;
    if (updateHistory) historyPush();
    document.body.dataset.navDir = back ? "back" : "forward";
    render(); syncPageNavigation();
    if (back) restoreScroll(); else window.scrollTo({ top: 0, behavior: "auto" });
  }
  function historyPush() {
    const route = currentHistoryRoute();
    const url = new URL(location.href);
    url.search = "";
    if (page === "dashboard" && libraryQuery) url.searchParams.set("q", libraryQuery);
    url.hash = route;
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    if (`${location.pathname}${location.search}${location.hash}` !== nextUrl) {
      try { window.history.pushState({ page, settingsGroup }, "", nextUrl); } catch (_) {}
    }
  }
  function currentHistoryRoute() {
    return page === "details" && detailItemId && !detailPreview ? `details?id=${encodeURIComponent(detailItemId)}`
      : page === "settings" && settingsGroup ? `settings/${settingsGroup}${settingsParam ? `?id=${encodeURIComponent(settingsParam)}` : ""}`
      : page === "discover" && discoverSource ? `discover?source=${encodeURIComponent(discoverSource)}`
      : page === "statistics" && statsSubpage ? `statistics/${statsSubpage}` : page;
  }
  function historyReplace() {
    const url = new URL(location.href);
    url.search = "";
    if (page === "dashboard" && libraryQuery) url.searchParams.set("q", libraryQuery);
    url.hash = currentHistoryRoute();
    try { window.history.replaceState({ page, settingsGroup }, "", `${url.pathname}${url.search}${url.hash}`); } catch (_) {}
  }
  function navigateBackTo(route) {
    const [path, query = ""] = String(route || "dashboard").replace(/^#/, "").split("?");
    rememberScroll(); // before the target page/group replaces the current one
    if (path.split("/")[0] === "settings") {
      const section = path.split("/")[1] || "";
      settingsGroup = section === "manage-backups" ? "backups" : section || null;
      settingsParam = new URLSearchParams(query).get("id") || "";
    }
    goto(path || "dashboard", false, true);
    historyReplace();
  }
  function currentPageBackRoute() {
    const control = $("#page-content [data-back], #page-content .detail-back[data-go]");
    if (!control || getComputedStyle(control).display === "none") return "";
    if (control.dataset.go) return control.dataset.go;
    return new URL(control.getAttribute("href") || "#dashboard", location.href).hash;
  }

  // Cheap size estimate (sampled) instead of serialising the whole library on every Settings render.
  let libraryBytesCache = { key: "", value: 0 };
  function estimateLibraryBytes() {
    const key = `${localMutationRevision}|${items.length}`;
    if (libraryBytesCache.key === key) return libraryBytesCache.value;
    const step = Math.max(1, Math.floor(items.length / 40));
    let sampled = 0, bytes = 0;
    for (let index = 0; index < items.length; index += step) { bytes += JSON.stringify(items[index]).length; sampled++; }
    const value = Math.round((sampled ? bytes / sampled * items.length : 0) + JSON.stringify(history).length + JSON.stringify(prefs).length);
    libraryBytesCache = { key, value };
    return value;
  }
  function pageContext() {
    let logEntries = [];
    try { const savedLogs = JSON.parse(localStorage.getItem(`${storageKey}_log`) || "[]"); if (Array.isArray(savedLogs)) logEntries = savedLogs; } catch (_) {}
    return { settingsOrigin, exportOptions, itemCount: items.length, statsLimits, libraryBytes: page === "settings" ? estimateLibraryBytes() : 0, dataRevision: localMutationRevision, dashboardRendered: dashboardRenderedCounts(), syncJob, syncCounts, config, prefs, items, history, logEntries, activeCategory, libraryQuery, discoverQuery, addMetadataQuery, mixQuery: mixCache?.query || "", importState, nativeAndroid, dashboardPageSize, statsRange, statsSubpage, statsActivityDate, settingsGroup, settingsParam, settingsFrom, discoverSource, dashboardStatusFilter, dashboardPlatformFilter, matchesPlatform, timelineFilter, timelineSearch, timelineMonth, timelineYear, detailItemId, detailPreview, detailTab, detailEditMode, editingItem: itemById(entryDraftId) || null, addReturnPage, navItems, metadataSourceFilter,
      detailData, detailError, detailLoading, detailReturnPage, detailRestorePending, category, labelCategory, defaultStatus, esc, safeLucideName };
  }
  function dashboardSortedItems(context = pageContext()) {
    const cacheKey = [localMutationRevision, libraryQuery, activeCategory, dashboardPlatformFilter, prefs.dashboardSort, prefs.favoritesOnly].join("|");
    if (dashboardSortedItemsCache?.key !== cacheKey) {
      const library = window.SplitAppLibrary.create(context);
      dashboardSortedItemsCache = { key: cacheKey, items: library.dashboardItems(null, libraryQuery).filter(item => matchesPlatform(item)) };
    }
    return dashboardSortedItemsCache.items;
  }
  // Update one rendered card in place. A full render() would reset every lazy-loaded
  // group to its first batch and jump the scroll position while metadata syncs.
  function patchDashboardCard(itemId) {
    const node = document.querySelector(`#page-content [data-item="${CSS.escape(String(itemId))}"]`);
    const item = itemById(String(itemId));
    if (!node || !item) return;
    const template = document.createElement("template");
    template.innerHTML = window.SplitAppLibrary.create(pageContext()).card(item).trim();
    const fresh = template.content.firstElementChild;
    if (!fresh) return;
    node.replaceWith(fresh);
    observeDeferredImages(fresh);
    window.lucide?.createIcons({ root: fresh, attrs: { "aria-hidden": "true" } });
  }
  // Remember how many cards each group has loaded so any full render() restores
  // them instead of collapsing back to the first batch.
  let dashboardRenderedState = { sig: "", counts: {} };
  const dashboardSignature = () => [prefs.favoritesOnly, libraryQuery, activeCategory, dashboardPlatformFilter, dashboardStatusFilter, prefs.dashboardSort, prefs.dashboardGroupBy, prefs.dashboardView].join("|");
  function dashboardRenderedCounts() {
    if (dashboardRenderedState.sig !== dashboardSignature()) dashboardRenderedState = { sig: dashboardSignature(), counts: {} };
    return dashboardRenderedState.counts;
  }
  // Long lists: cards far above/below the viewport are emptied (keeping their exact height
  // so nothing shifts) and rebuilt just before they scroll back into view. DOM size and
  // memory therefore stay flat however many games have been scrolled through.
  const TRIM_MIN_CARDS = 160, TRIM_DISTANCE = 3.5;
  let trimQueued = false, trimObserver = null;
  function hydrateTrimmedCard(node) {
    if (!node.isConnected || !node.dataset.trimmed) return;
    const item = itemById(String(node.dataset.item));
    if (!item) return;
    const template = document.createElement("template");
    template.innerHTML = window.SplitAppLibrary.create(pageContext()).card(item).trim();
    const fresh = template.content.firstElementChild;
    if (!fresh) return;
    trimObserver?.unobserve(node);
    node.replaceWith(fresh);
    observeDeferredImages(fresh);
    window.lucide?.createIcons({ root: fresh, attrs: { "aria-hidden": "true" } });
  }
  function trimFarCards() {
    trimQueued = false;
    if (page !== "dashboard") return;
    const limit = window.innerHeight * TRIM_DISTANCE;
    $$("[data-dashboard-items]").forEach(list => {
      if (list.children.length < TRIM_MIN_CARDS) return;
      for (const card of list.children) {
        if (card.dataset.trimmed || !card.classList.contains("dashboard-card")) continue;
        const rect = card.getBoundingClientRect();
        if (rect.bottom > -limit && rect.top < window.innerHeight + limit) continue;
        card.style.height = `${rect.height}px`;
        card.dataset.trimmed = "1";
        card.replaceChildren();
        if (!trimObserver && window.IntersectionObserver) {
          trimObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) hydrateTrimmedCard(entry.target); }), { rootMargin: `${Math.round(window.innerHeight * 2)}px 0px` });
        }
        trimObserver?.observe(card);
      }
    });
  }
  window.addEventListener("scroll", () => {
    if (trimQueued || page !== "dashboard") return;
    trimQueued = true;
    setTimeout(() => requestAnimationFrame(trimFarCards), 400);
  }, { passive: true });
  function dashboardGroupItems(groupKey) {
    const groupBy = prefs.dashboardGroupBy || "status";
    const sortedItems = dashboardSortedItems();
    if (groupBy === "status") return sortedItems.filter(item => item.status === groupKey);
    let games = sortedItems;
    if (dashboardStatusFilter !== "all") games = games.filter(item => item.status === dashboardStatusFilter);
    if (groupBy === "category") return games.filter(item => String(item.category || "other") === groupKey);
    if (groupBy === "release") return games.filter(item => String(item.year || "Unknown release date") === groupKey);
    return games;
  }
  function loadDashboardMore(button) {
    const status = button.dataset.dashboardLoadMore;
    const offset = Number(button.dataset.offset) || 0;
    const games = button._dashboardItems || [];
    const batch = games.slice(offset, offset + dashboardPageSize);
    const target = $(`[data-dashboard-items="${CSS.escape(status)}"]`, button.closest("[data-dashboard-status-group]"));
    if (!target || !batch.length) { button.remove(); return; }
    const library = window.SplitAppLibrary.create(pageContext());
    target.insertAdjacentHTML("beforeend", batch.map(library.card).join(""));
    const addedCards = [...target.children].slice(-batch.length);
    addedCards.forEach((card, index) => {
      if (prefs.reduceMotion || nativeAndroid) return;
      card.classList.add("dashboard-card-enter");
      card.style.setProperty("--dashboard-enter-order", String(Math.min(index, 7)));
      const clearEntrance = () => {
        card.classList.remove("dashboard-card-enter");
        card.style.removeProperty("--dashboard-enter-order");
      };
      card.addEventListener("animationend", clearEntrance, { once: true });
      setTimeout(clearEntrance, 900);
    });
    addedCards.forEach(card => observeDeferredImages(card));
    const nextOffset = offset + batch.length;
    target.dataset.renderedCount = String(nextOffset);
    dashboardRenderedCounts()[status] = nextOffset;
    button.dataset.offset = String(nextOffset);
    const remaining = Math.max(0, games.length - nextOffset);
    if (!remaining) {
      dashboardLazyObserver?.unobserve(button);
      button.remove();
      return;
    }
    button.textContent = `Load more · ${remaining} remaining`;
    button.setAttribute("aria-label", `Load more ${status} games; ${remaining} remaining`);
  }
  function observeDashboardLoaders() {
    dashboardLazyObserver?.disconnect();
    dashboardLazyObserver = null;
    if (page !== "dashboard") return;
    const loaders = $$("[data-dashboard-load-more]");
    if (!loaders.length) return;
    loaders.forEach(button => { button._dashboardItems = dashboardGroupItems(button.dataset.dashboardLoadMore); });
    if (!window.IntersectionObserver) return;
    dashboardLazyObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const button = entry.target;
      if (dashboardLoadPending) return;
      dashboardLazyObserver.unobserve(button);
      dashboardLoadPending = true;
      requestAnimationFrame(() => {
        loadDashboardMore(button);
        dashboardLoadPending = false;
        if (button.isConnected && button.dataset.offset < button._dashboardItems.length) dashboardLazyObserver.observe(button);
      });
    }), { rootMargin: "0px" });
    loaders.forEach(button => dashboardLazyObserver.observe(button));
  }
  function deferredImageSource(image) {
    return image?.dataset.lazySrc || image?.dataset.onlineFallback || "";
  }
  function setDeferredImageSource(image, source) {
    if (!image?.isConnected) return;
    if (nativeAndroid && image.closest(".dashboard-card") && source) image.dataset.dashboardCacheSrc = source;
    delete image.dataset.localItemId;
    delete image.dataset.lazySrc;
    if (source) image.src = source;
    else if (image.matches("[data-timeline-art]")) showTimelineArtworkPlaceholder(image);
    else { image.hidden = true; if (image.nextElementSibling) image.nextElementSibling.hidden = false; }
  }
  // Device artwork cache (IndexedDB blobs). Order for every cover: cache -> online (instant, HTTP-cached)
  // -> saved-folder files. The slow Android folder (SAF) is only used to fill the cache in the
  // background, never in front of what the user is looking at.
  const thumbUrlCache = new Map(); // key -> blob: URL
  const thumbKeyOf = (item, landscape) => `${item.id}:${landscape ? "l" : "p"}`;
  const thumbSigOf = item => String(item.localImageFingerprint || item.thumbnailPath || "");
  async function cachedThumbUrls(entries) {
    const found = new Map();
    const need = [];
    entries.forEach(([key, sig]) => { const url = thumbUrlCache.get(`${key}|${sig}`); if (url) found.set(key, url); else need.push([key, sig]); });
    if (need.length && window.SplitAppIDB?.getThumbs) {
      try {
        const sigByKey = new Map(need);
        (await window.SplitAppIDB.getThumbs(need)).forEach(([key, blob]) => {
          const url = URL.createObjectURL(blob);
          thumbUrlCache.set(`${key}|${sigByKey.get(key)}`, url);
          found.set(key, url);
        });
      } catch (_) {}
    }
    return found;
  }
  // fetch() decodes data: URLs natively (off the JS thread); the old atob loop blocked the UI for every cover.
  async function dataUrlToBlob(dataUrl) {
    if (!/^data:[^;,]+;base64,/i.test(dataUrl || "")) return null;
    try { return await (await fetch(dataUrl)).blob(); } catch (_) { return null; }
  }
  async function cacheThumbFromItem(item, source) {
    const blob = await dataUrlToBlob(source);
    if (blob && window.SplitAppIDB?.putThumbs) { try { await window.SplitAppIDB.putThumbs([[thumbKeyOf(item, false), thumbSigOf(item), blob]]); } catch (_) {} }
  }
  // Background: copy covers from the saved folder into the cache a few at a time (portrait only).
  let thumbFillRunning = false;
  async function fillThumbCache() {
    if (thumbFillRunning || !nativeAndroid || !window.SplitAppIDB?.listThumbKeys) return;
    const hydrate = window.SplitAppBackend?.hydrateThumbnails;
    if (typeof hydrate !== "function") return;
    thumbFillRunning = true;
    try {
      const have = new Map(await window.SplitAppIDB.listThumbKeys());
      const missing = items.filter(item => item.thumbnailPath && have.get(thumbKeyOf(item, false)) !== thumbSigOf(item));
      for (let offset = 0; offset < missing.length; offset += 12) {
        // Background work: wait while the app is hidden and for idle moments, so taps and scrolling always win.
        while (document.hidden) await new Promise(resolve => setTimeout(resolve, 3000));
        await yieldToUser();
        const clones = missing.slice(offset, offset + 12).map(item => ({ ...item, localPortraitData: "", localThumbnailData: "", localLandscapeData: "", backdrop: "", cachedDetails: undefined, localImageFiles: undefined }));
        try { await hydrate(clones); } catch (_) {}
        const entries = [];
        for (let index = 0; index < clones.length; index++) {
          const blob = await dataUrlToBlob(clones[index].localPortraitData || clones[index].localThumbnailData);
          const original = missing[offset + index];
          if (blob) entries.push([thumbKeyOf(original, false), thumbSigOf(original), blob]);
        }
        if (entries.length) { try { await window.SplitAppIDB.putThumbs(entries); } catch (_) {} }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    } finally { thumbFillRunning = false; }
  }
  async function drainDeferredLocalImages() {
    if (deferredImageDrain) return deferredImageDrain;
    deferredImageDrain = (async () => {
      const hydrate = window.SplitAppBackend?.hydrateThumbnails;
      while (deferredLocalImageQueue.length) {
        const batch = deferredLocalImageQueue.splice(0, 24);
        const modeOf = record => record.images.values().next().value?.dataset.localImageMode === "landscape";
        const cached = await cachedThumbUrls(batch.filter(record => !modeOf(record)).map(record => [thumbKeyOf(record.item, false), thumbSigOf(record.item)]));
        const slow = [];
        for (const record of batch) {
          const landscape = modeOf(record);
          const hit = !landscape && cached.get(thumbKeyOf(record.item, false));
          if (hit) { record.images.forEach(image => setDeferredImageSource(image, hit)); }
          else if (/^https?:/i.test(record.fallback || "")) {
            // Not cached yet (always the case for the wide artwork of the grid views): show the online image
            // straight away instead of waiting on the slow folder.
            record.images.forEach(image => setDeferredImageSource(image, record.fallback));
          } else { slow.push(record); continue; }
          timelineLocalThumbnailChecked.add(record.id);
          deferredLocalImageRequests.delete(record.id);
        }
        if (!slow.length) continue;
        try { if (typeof hydrate === "function") await hydrate(slow.map(record => record.item)); }
        catch (error) { recordLog("warning", `Could not load saved artwork: ${error?.message || error}`); }
        for (const record of slow) {
          timelineLocalThumbnailChecked.add(record.id);
          record.images.forEach(image => {
            const source = image.dataset.localImageMode === "landscape"
              ? record.item.localLandscapeData || record.item.backdrop || record.item.cachedDetails?.landscapeImage || record.item.cachedDetails?.backgroundImage || record.item.localPortraitData || record.item.localThumbnailData || record.fallback
              : record.item.localPortraitData || record.item.localThumbnailData || record.fallback;
            setDeferredImageSource(image, source);
          });
          const portrait = record.item.localPortraitData || record.item.localThumbnailData;
          if (portrait) cacheThumbFromItem(record.item, portrait);
          deferredLocalImageRequests.delete(record.id);
        }
      }
    })().finally(() => { deferredImageDrain = null; });
    return deferredImageDrain;
  }
  function activateDeferredImage(image) {
    if (!image?.isConnected || image.hasAttribute("src")) return;
    const id = String(image.dataset.localItemId || "");
    const item = id && itemById(id);
    if (!item) { setDeferredImageSource(image, deferredImageSource(image)); return; }
    const existing = deferredLocalImageRequests.get(id);
    if (existing) { existing.images.add(image); return; }
    const landscape = image.dataset.localImageMode === "landscape";
    const hasLocalFile = Boolean(item.thumbnailPath || item.localImageFiles?.length);
    const localImage = landscape ? item.localLandscapeData : item.localPortraitData || item.localThumbnailData;
    if (!hasLocalFile || localImage || timelineLocalThumbnailChecked.has(id)) {
      timelineLocalThumbnailChecked.add(id);
      setDeferredImageSource(image, localImage || deferredImageSource(image));
      return;
    }
    if (!landscape) {
      const warm = thumbUrlCache.get(`${thumbKeyOf(item, false)}|${thumbSigOf(item)}`);
      if (warm) { setDeferredImageSource(image, warm); return; }
    }
    const record = { id, item, fallback: deferredImageSource(image), images: new Set([image]) };
    deferredLocalImageRequests.set(id, record);
    deferredLocalImageQueue.push(record);
    if (!deferredImageFlushTimer) deferredImageFlushTimer = setTimeout(() => {
      deferredImageFlushTimer = 0;
      drainDeferredLocalImages();
    }, 0);
  }
  function observeDeferredImages(root = document) {
    if (!root?.querySelectorAll) return;
    const images = [...root.querySelectorAll("img[data-deferred-image]")].filter(image => !image.hasAttribute("src"));
    if (!images.length) return;
    if (!window.IntersectionObserver) { images.forEach(activateDeferredImage); return; }
    if (!deferredImageObserver) {
      deferredImageObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        const image = entry.target;
        if (!entry.isIntersecting) {
          if (nativeAndroid && image.closest(".dashboard-card") && image.hasAttribute("src") && image.dataset.dashboardCacheSrc) {
            image.dataset.lazySrc = image.dataset.dashboardCacheSrc;
            image.removeAttribute("src");
          }
          return;
        }
        if (!nativeAndroid) deferredImageObserver.unobserve(image);
        activateDeferredImage(image);
      }), { rootMargin: nativeAndroid ? "900px 0px" : "700px 0px" });
    }
    images.forEach(image => deferredImageObserver.observe(image));
  }
  async function showCachedTimelineImage(image, sourceUrl) {
    if (!image?.isConnected || !sourceUrl || !window.caches || !/^https?:\/\//i.test(sourceUrl)) return false;
    try {
      const cache = await window.caches.open("splitapp_" + config.key + "_images");
      const response = await cache.match(sourceUrl);
      if (!response) return false;
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) return false;
      const objectUrl = URL.createObjectURL(blob);
      if (!image.isConnected) { URL.revokeObjectURL(objectUrl); return false; }
      image.dataset.timelineCacheObjectUrl = objectUrl;
      image.src = objectUrl;
      return true;
    } catch (_) { return false; }
  }
  function showTimelineArtworkPlaceholder(image) {
    const thumb = image?.closest(".timeline-item-thumb");
    const statusMark = thumb?.querySelector(".timeline-status-dot")?.textContent || "•";
    image?.remove();
    thumb?.classList.remove("has-art");
    thumb?.querySelector(".timeline-status-dot")?.remove();
    if (thumb) thumb.textContent = statusMark;
  }
  async function requestTimelineImage(sourceUrl) {
    try {
      const response = await fetch(sourceUrl, { mode: "cors", credentials: "omit" });
      if (response.ok) return response;
      return null;
    } catch (_) {}
    const capacitor = window.Capacitor;
    const nativeHttp = window.CapacitorHttp || capacitor?.Plugins?.CapacitorHttp || capacitor?.Plugins?.Http;
    if (!nativeHttp?.request || !capacitor?.isNativePlatform?.()) return null;
    try {
      const response = await nativeHttp.request({ url: sourceUrl, method: "GET", headers: { Accept: "image/*" }, responseType: "blob", connectTimeout: 15000, readTimeout: 20000 });
      if (Number(response?.status || 0) >= 400 || typeof response?.data !== "string") return null;
      const headers = response.headers || {};
      const contentType = Object.entries(headers).find(([key]) => key.toLowerCase() === "content-type")?.[1] || "image/jpeg";
      if (!String(contentType).toLowerCase().startsWith("image/")) return null;
      const encoded = response.data.replace(/^data:[^,]*;base64,/i, "");
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      return new Response(new Blob([bytes], { type: contentType }), { status: 200, headers: { "Content-Type": contentType } });
    } catch (_) { return null; }
  }
  function cacheTimelineImage(sourceUrl) {
    if (!prefs.metadataThumbnails || prefs.metadataMode === "offline" || !window.caches || !navigator.onLine || !sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return Promise.resolve(false);
    if (timelineImageCacheRequests.has(sourceUrl)) return timelineImageCacheRequests.get(sourceUrl);
    const task = (async () => {
      try {
        const cache = await window.caches.open("splitapp_" + config.key + "_images");
        const maximum = Number(prefs.imageCacheMaxEntries) || 0;
        const trim = async () => {
          if (maximum <= 0) return;
          const keys = await cache.keys();
          for (const request of keys.slice(0, Math.max(0, keys.length - maximum))) await cache.delete(request);
        };
        if (await cache.match(sourceUrl)) { await trim(); return true; }
        const response = await requestTimelineImage(sourceUrl);
        if (!response) return false;
        if (!response.ok || !String(response.headers.get("content-type") || "").toLowerCase().startsWith("image/")) return false;
        await cache.put(sourceUrl, response.clone());
        await trim();
        return true;
      } catch (_) { return false; }
    })().finally(() => timelineImageCacheRequests.delete(sourceUrl));
    timelineImageCacheRequests.set(sourceUrl, task);
    return task;
  }
  function fetchTimelineOnlineThumbnails(itemIds = [], historyIndexes = []) {
    if (page !== "timeline" || prefs.metadataMode === "offline" || !prefs.metadataThumbnails || !navigator.onLine || !window.SplitAppDiscovery?.search || timelineThumbnailLookup) return;
    const normalizeTitle = value => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const findByEntry = entry => itemById(String(entry.itemId)) || items.find(item => String(item.title || "").toLowerCase() === String(entry.title || "").toLowerCase());
    const entryKey = entry => `${String(entry.itemId || "")}|${Number(entry.at) || Date.parse(entry.at) || 0}|${String(entry.status || entry.action || "")}|${String(entry.title || "")}`;
    const itemDescriptor = item => ({ key: `item:${item.id}`, item, entry: null, title: item.title, category: item.category });
    const entryDescriptor = entry => {
      const item = findByEntry(entry);
      return item ? itemDescriptor(item) : { key: `history:${entryKey(entry)}`, item: null, entry, title: entry.title, category: entry.category };
    };
    const visibleThumbs = $$(".timeline-item-thumb[data-timeline-history-index]", $("#page-content"));
    const visibleIds = [...new Set($$(".timeline-item-thumb[data-timeline-item-id]", $("#page-content")).map(node => String(node.dataset.timelineItemId)))];
    const visibleIndexes = [...new Set(visibleThumbs.map(node => Number(node.dataset.timelineHistoryIndex)).filter(index => Number.isInteger(index) && index >= 0))];
    const forcedItems = new Set(itemIds.map(String));
    const forcedEntries = new Set(historyIndexes.map(Number));
    let recent;
    if (itemIds.length || historyIndexes.length) {
      recent = [
        ...itemIds.map(id => itemById(String(id))).filter(Boolean).map(itemDescriptor),
        ...historyIndexes.map(index => history[index]).filter(Boolean).map(entryDescriptor)
      ];
    } else if (visibleIds.length || visibleIndexes.length) {
      recent = [
        ...visibleIds.map(id => itemById(id)).filter(Boolean).map(itemDescriptor),
        ...visibleIndexes.map(index => history[index]).filter(Boolean).map(entryDescriptor)
      ];
    } else {
      recent = [...history].sort((a, b) => (Number(b.at) || Date.parse(b.at) || 0) - (Number(a.at) || Date.parse(a.at) || 0)).map(entryDescriptor);
    }
    recent = [...new Map(recent.map(descriptor => [descriptor.key, descriptor])).values()];
    const needsArtwork = descriptor => {
      const target = descriptor.item || descriptor.entry;
      const localArt = target.localThumbnailData || target.localImageData?.image || target.localImageData?.["cachedDetails.portraitImage"] || target.localImageData?.["cachedDetails.image"];
      const localPending = descriptor.item && (descriptor.item.thumbnailPath || descriptor.item.localImageFiles?.length) && !timelineLocalThumbnailChecked.has(String(descriptor.item.id));
      const savedArt = target.cachedDetails?.portraitImage || target.cachedDetails?.image || target.image;
      const forced = descriptor.item ? forcedItems.has(String(descriptor.item.id)) : forcedEntries.has(history.indexOf(descriptor.entry));
      return (!localArt || forced) && (!localPending || forced) && (!savedArt || forced) && !timelineOnlineThumbnailRequested.has(descriptor.key);
    };
    const queue = recent.filter(needsArtwork).slice(0, 6);
    if (!queue.length) return;
    queue.forEach(descriptor => timelineOnlineThumbnailRequested.add(descriptor.key));
    timelineThumbnailLookup = (async () => {
      let changed = false;
      const worker = async () => {
        while (queue.length) {
          const descriptor = queue.shift();
          try {
            const results = await discoverSearch(descriptor.title, descriptor.category || config.categories[0].key);
            const wanted = normalizeTitle(descriptor.title);
            const match = results.find(result => result?.image && normalizeTitle(result.title) === wanted);
            if (match?.image) {
              const target = descriptor.item || descriptor.entry;
              target.image = match.image;
              target.timelineThumbnailSource = match.source || "metadata";
              changed = true;
            }
          } catch (_) {}
        }
      };
      await Promise.all([worker(), worker()]);
      if (changed) { persist(); if (page === "timeline") render(); }
    })().finally(() => { timelineThumbnailLookup = null; });
  }
  function render() {
    document.body.dataset.page = page;
    { const fab = document.getElementById("sync-fab"); if (fab) fab.hidden = !syncJob || syncJob.fabHidden || page === "sync" || page === "add"; }
    $("#page-title").textContent = titles[page];
    const topbarActions = $("#topbar-actions");
    if (topbarActions) topbarActions.hidden = page !== "dashboard";
    if (page === "dashboard") {
      const filterButton = topbarActions?.querySelector("[data-open-collection-filter]");
      const filterBadge = $("#collection-filter-badge");
      const hasActiveFilter = dashboardStatusFilter !== "all" || dashboardPlatformFilter !== "all" || Boolean(libraryQuery)
        || prefs.dashboardSort !== "alphabetical-asc"
        || prefs.dashboardView !== "list"
        || (prefs.dashboardGroupBy || "status") !== "status";
      filterButton?.classList.toggle("has-active-filter", hasActiveFilter);
      filterButton?.setAttribute("aria-label", hasActiveFilter ? "Filter and sort games; custom filters are active" : "Filter and sort games");
      if (filterBadge) filterBadge.hidden = !hasActiveFilter;
    }
    const content = $("#page-content");
    deferredImageObserver?.disconnect();
    if (page !== "settings") lastOutsidePage = page;
    if (page === "settings" && renderedSettingsGroup === undefined) settingsOrigin = lastOutsidePage || "";
    if (page === "settings") { if (settingsGroup !== renderedSettingsGroup) { settingsFrom = renderedSettingsGroup || ""; renderedSettingsGroup = settingsGroup; } } else renderedSettingsGroup = undefined;
    const route = page === "settings" ? `settings/${settingsGroup || "index"}` : page === "statistics" && statsSubpage ? `statistics/${statsSubpage}` : page;
    const preservePageState = route === renderedRoute;
    const previousControls = preservePageState ? [...content.querySelectorAll("input, textarea, select")].map(element => ({
      id: element.id,
      name: element.name,
      type: element.type,
      value: element.value,
      checked: "checked" in element ? element.checked : undefined,
      start: typeof element.selectionStart === "number" ? element.selectionStart : null,
      end: typeof element.selectionEnd === "number" ? element.selectionEnd : null
    })) : [];
    const activeControlIndex = preservePageState ? [...content.querySelectorAll("input, textarea, select")].indexOf(document.activeElement) : -1;
    const openPageDialogs = preservePageState ? [...content.querySelectorAll("dialog[open]")].map(dialog => dialog.id).filter(Boolean) : [];
    if (route !== renderedRoute) {
      content.classList.remove("page-route-enter");
      if (!prefs.reduceMotion && prefs.animationSpeed !== "off") {
        void content.offsetWidth;
        content.classList.add("page-route-enter");
      }
      if (renderedRoute !== null) inAppNav = true;
      renderedRoute = route;
    }
    content.querySelectorAll("[data-timeline-cache-object-url]").forEach(image => URL.revokeObjectURL(image.dataset.timelineCacheObjectUrl));
    const context = pageContext();
    if (page === "dashboard") context.dashboardSortedItems = dashboardSortedItems(context);
    const keepScrollY = preservePageState && page === "dashboard" ? window.scrollY : null;
    content.innerHTML = window.SplitAppPages[page](context);
    if (selectMode) { if (page !== "dashboard") exitSelectMode(); else applySelectionUI(); }
    if (keepScrollY) window.scrollTo({ top: keepScrollY, behavior: "auto" });
    if (topbarActions) window.lucide?.createIcons({ root: topbarActions, attrs: { "aria-hidden": "true" } });
    if (page === "discover" && discoverCache && discoverCache.source === discoverSource && discoverCache.query === discoverQuery) paintDiscoverResults(discoverCache.results, discoverSource);
    else if (page === "discover" && discoverQuery.trim() && discoverQuery === discoverSubmitted) { if (!discoverInFlight || discoverInFlight !== `${discoverSource}|${discoverQuery}`) discover(); }
    else if (page === "discover") loadDiscoverSuggestions();
    if (page === "mix") paintMixResults();
    if (page === "statistics") { const chart = $(".stats-activity-chart-month"); if (chart) chart.scrollLeft = chart.scrollWidth; }
    if (preservePageState) {
      const controls = [...content.querySelectorAll("input, textarea, select")];
      previousControls.forEach((saved, index) => {
        const target = saved.id ? document.getElementById(saved.id) : saved.name ? controls.find(element => element.name === saved.name && element.type === saved.type && (saved.type !== "radio" || element.value === saved.value)) : controls[index];
        if (!target || target.type === "file") return;
        const stateBound = target.matches("[data-pref], #global-search, #library-search");
        if (target.type !== "radio" && target.type !== "checkbox" && (!stateBound || target.value === saved.value)) target.value = saved.value;
        if (saved.checked !== undefined && !target.matches("[data-pref], [data-detail-status], #dashboard-filter-form *")) target.checked = saved.checked;
        if (saved.start !== null && typeof target.setSelectionRange === "function") {
          try { target.setSelectionRange(saved.start, saved.end); } catch (_) {}
        }
      });
      openPageDialogs.forEach(id => {
        const dialog = document.getElementById(id);
        if (dialog && !dialog.open) showPopup(dialog, { silent: true });
      });
      if (activeControlIndex >= 0) {
        const activeControl = controls[activeControlIndex];
        if (activeControl?.matches("[data-settings-index-search], [data-settings-search], #explore-source-search")) activeControl.dispatchEvent(new Event("input", { bubbles: true }));
        activeControl?.focus({ preventScroll: true });
      }
    }
    window.lucide?.createIcons({ root: content, attrs: { "aria-hidden": "true" } });
    observeDeferredImages(content);
    setupScrollRows(content);
    content.querySelectorAll("[data-timeline-art]").forEach(image => {
      image.addEventListener("load", () => {
        const candidate = image.dataset.onlineFallback || image.currentSrc || image.src;
        if (!image.dataset.timelineCacheObjectUrl && /^https?:\/\//i.test(candidate)) cacheTimelineImage(candidate);
      });
      image.addEventListener("error", async () => {
        const candidate = image.currentSrc || image.src;
        const onlineSource = image.dataset.onlineFallback || (/^https?:\/\//i.test(candidate) ? candidate : "");
        if (!image.dataset.timelineCacheTried && onlineSource) {
          image.dataset.timelineCacheTried = "true";
          if (await showCachedTimelineImage(image, onlineSource)) return;
        }
        const fallback = image.dataset.onlineFallback;
        if (fallback && image.getAttribute("src") !== fallback && prefs.metadataMode !== "offline" && prefs.metadataThumbnails && navigator.onLine) { image.removeAttribute("data-online-fallback"); image.src = fallback; return; }
        showTimelineArtworkPlaceholder(image);
        const timelineItemId = String(image.dataset.timelineItemId || "");
        const timelineHistoryIndex = Number(image.dataset.timelineHistoryIndex);
        if (timelineItemId && items.some(item => String(item.id) === timelineItemId)) fetchTimelineOnlineThumbnails([timelineItemId]);
        else if (Number.isInteger(timelineHistoryIndex) && timelineHistoryIndex >= 0) fetchTimelineOnlineThumbnails([], [timelineHistoryIndex]);
      });
    });
    observeDashboardLoaders();
    content.querySelector("[data-clear-collection-search]")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      libraryQuery = "";
      clearTimeout(searchRenderTimer);
      const search = $("#global-search");
      if (search) search.value = "";
      event.currentTarget.hidden = true;
      refreshSearchResults("dashboard", "#collection-results");
      search?.focus();
    });
    content.querySelector("[data-clear-library-search]")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      libraryQuery = "";
      clearTimeout(searchRenderTimer);
      const search = $("#library-search");
      if (search) search.value = "";
      event.currentTarget.hidden = true;
      refreshSearchResults("search", "#search-results");
      search?.focus();
    });
    content.querySelector("#item-form")?.addEventListener("keydown", event => {
      if (event.key !== "Enter" || event.defaultPrevented || event.target.matches("textarea, #add-metadata-query")) return;
      event.preventDefault();
      saveAddForm(event.currentTarget);
    });
    content.querySelectorAll("[data-cancel-add]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); entryDraftId = null; goto(addReturnPage); }));
    content.querySelectorAll("[data-save-item]").forEach(saveButton => saveButton.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); saveAddForm($("#item-form")); }));
    content.querySelector("[data-discover-submit]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); submitDiscover(); });
    content.querySelector("#discover-query")?.addEventListener("keydown", event => {
      // Android soft keyboards can report Enter as keyCode 13 with an "Unidentified" key.
      if (event.key !== "Enter" && event.keyCode !== 13) return;
      event.preventDefault(); event.stopPropagation();
      submitDiscover();
    });
    content.querySelector("#discover-query")?.addEventListener("search", event => { event.stopPropagation(); submitDiscover(); });
    content.querySelector("#discover-query")?.addEventListener("input", event => {
      discoverQuery = event.target.value;
      const clearButton = content.querySelector("[data-clear-discover]");
      if (clearButton) clearButton.hidden = !discoverQuery;
    });
    content.querySelector("[data-clear-discover]")?.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      discoverQuery = ""; discoverSubmitted = ""; discoverRequestId++; discoverCache = null;
      const input = content.querySelector("#discover-query");
      if (input) { input.value = ""; input.focus(); }
      const clearButton = content.querySelector("[data-clear-discover]");
      if (clearButton) clearButton.hidden = true;
      discover();
    });
    content.querySelector("[data-open-discover-consent]")?.addEventListener("click", event => { event.preventDefault(); showPopup($("#discover-consent-dialog")); });
    content.querySelectorAll("[data-close-discover-consent]").forEach(button => button.addEventListener("click", () => closePopup($("#discover-consent-dialog"))));
    content.querySelector("[data-review-hltb-consent]")?.addEventListener("click", async event => {
      event.preventDefault();
      closePopup($("#discover-consent-dialog"));
      const consent = window.Capacitor?.Plugins?.ProviderConsent;
      try {
        if (consent?.reviewHowLongToBeat) await consent.reviewHowLongToBeat();
        else window.open("https://howlongtobeat.com/", "_blank", "noopener,noreferrer");
        window.SplitAppDiscovery?.clearSourceCooldown?.("howlongtobeat");
        if (page === "discover" && discoverSource === "howlongtobeat") { toast("Session saved. Searching again…"); submitDiscover(); }
      } catch (error) { toast(error?.message || "Could not open HowLongToBeat."); }
    });
    content.querySelector("#detail-edit-form")?.addEventListener("submit", saveDetailEdit);
    content.querySelectorAll(".detail-page [data-action]").forEach(button => button.addEventListener("click", async event => {
      const action = button.dataset.action;
      if (!["edit", "progress", "refresh-details", "delete-detail", "cancel-detail-edit", "save-detail-item", "open-saved-entry"].includes(action)) return;
      event.preventDefault(); event.stopPropagation();
      if (action === "edit") { detailEditMode = true; render(); }
      else if (action === "progress") updateProgress(button.dataset.id);
      else if (action === "refresh-details") loadDetails({ force: true });
      else if (action === "delete-detail") requestDeleteDetails(button.dataset.id);
      else if (action === "open-saved-entry") openDetails(button.dataset.id);
      else if (action === "cancel-detail-edit") { detailEditMode = false; render(); }
      else if (action === "save-detail-item") {
        const preview = detailPreview;
        detailRequest++; // Discard any in-flight provider preview load before switching to the saved entry.
        const saved = await addDiscoverResult(preview, "Details");
        if (saved) {
          detailPreview = null; detailItemId = saved.id; detailData = saved.cachedDetails || null; detailError = ""; detailLoading = true;
          goto("details");
          const pending = mixEnrichmentByItem.get(String(saved.id));
          if (pending) pending.then(loaded => {
            if (page === "details" && String(detailItemId) === String(saved.id)) { detailData = loaded || saved.cachedDetails || null; detailLoading = false; render(); }
          });
          else loadDetails();
        }
      }
    }));
    content.querySelector("[data-detail-save]")?.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      const form = content.querySelector("#detail-edit-form");
      if (form?.reportValidity()) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    content.querySelector("[data-detail-delete-confirm]")?.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      const id = event.currentTarget.dataset.detailDeleteId || $("#detail-delete-dialog")?.dataset.itemId || detailItemId;
      closePopup($("#detail-delete-dialog")); deleteFromDetails(id);
    });
    content.querySelector("[data-detail-delete-cancel]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closePopup($("#detail-delete-dialog")); });
    content.querySelectorAll("[data-add-image-picker]").forEach(button => button.addEventListener("click", () => {
      const picker = button.dataset.addImagePicker === "camera" ? $("#add-camera-picker") : $("#add-gallery-picker");
      picker?.click();
    }));
    [$("#add-gallery-picker"), $("#add-camera-picker")].filter(Boolean).forEach(picker => picker.addEventListener("change", () => readAddImage(picker.files?.[0])));
    content.querySelector("[data-add-metadata-search]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); searchAddMetadata(); });
    content.querySelector("#add-metadata-query")?.addEventListener("input", event => { addMetadataQuery = event.target.value; });
    content.querySelector("#add-metadata-query")?.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); searchAddMetadata(); } });
    content.querySelector("#add-metadata-results")?.addEventListener("click", event => {
      const button = event.target.closest("[data-add-metadata-index]");
      if (button) selectAddMetadata(button.dataset.addMetadataIndex);
    });
    if (page === "settings" && settingsGroup === "backups") refreshBackupFolderStatus();
    if (page === "settings" && settingsGroup === "storage-details") refreshStorageDetails();
    content.querySelectorAll("[data-open-details]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openDetails(button.dataset.id);
      });
    });
    content.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); if (button.classList.contains("detail-back")) navigateBackTo(button.dataset.go); else goto(button.dataset.go); }));
    content.querySelectorAll("[data-entry-status]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      const form = button.closest("form");
      if (form?.elements.status) form.elements.status.value = button.dataset.entryStatus;
      button.parentElement?.querySelectorAll("[data-entry-status]").forEach(option => {
        const selected = option === button; option.classList.toggle("active", selected); option.setAttribute("aria-pressed", String(selected));
      });
    }));
    content.querySelectorAll("[data-timeline-filter]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation(); timelineFilter = button.dataset.timelineFilter; render();
    }));
    content.querySelectorAll("[data-nav-icon-pick]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      const key = button.dataset.navIconPick, icon = button.dataset.icon;
      prefs.navIcons[key] = icon === "controller" && key === "dashboard" ? "controller" : safeLucideName(icon, prefs.navIcons[key]);
      persist({ meta: true }); applyPreferences(); render();
    }));
    content.querySelectorAll("[data-nav-icon-select]").forEach(select => select.addEventListener("change", event => {
      event.stopPropagation();
      const key = select.dataset.navIconSelect;
      prefs.navIcons[key] = key === "dashboard" && select.value === "controller" ? "controller" : safeLucideName(select.value, prefs.navIcons[key]);
      persist({ meta: true }); applyPreferences(); render();
    }));
    content.querySelector("[data-close-dashboard-filter]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closePopup($("#dashboard-filter-dialog")); });
    const dashboardFilterDialog = content.querySelector("#dashboard-filter-dialog");
    dashboardFilterDialog?.addEventListener("click", event => {
      // Native dialog backdrops dispatch clicks to the dialog element itself.
      if (event.target === dashboardFilterDialog) closePopup(dashboardFilterDialog);
    });
    content.querySelector("[data-reset-dashboard-filter]")?.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      clearDashboardFilters();
    });
    const dashboardFilterForm = content.querySelector("#dashboard-filter-form");
    const applyDashboardFilter = () => {
      if (!dashboardFilterForm) return;
      dashboardStatusFilter = dashboardFilterForm?.elements.status.value || "all";
      prefs.dashboardStatusFilter = dashboardStatusFilter;
      prefs.dashboardLastStatus = dashboardStatusFilter;
      dashboardPlatformFilter = dashboardFilterForm?.elements.platform.value || "all";
      prefs.dashboardPlatformFilter = dashboardPlatformFilter;
      prefs.dashboardView = dashboardFilterForm?.elements.view?.value || prefs.dashboardView;
      prefs.dashboardSort = dashboardFilterForm.elements.sort?.value || prefs.dashboardSort;
      prefs.theme = dashboardFilterForm.elements.theme?.value || prefs.theme;
      prefs.dashboardGroupBy = dashboardFilterForm.elements.groupBy?.value || prefs.dashboardGroupBy;
      persist({ meta: true }); applyPreferences(); closePopup($("#dashboard-filter-dialog")); render();
    };
    dashboardFilterForm?.addEventListener("submit", event => { event.preventDefault(); event.stopPropagation(); applyDashboardFilter(); });
    dashboardFilterForm?.querySelector('[type="submit"]')?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); applyDashboardFilter(); });
    content.querySelectorAll("[data-dashboard-view]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation(); setPreference("dashboardView", button.dataset.dashboardView);
    }));
    content.querySelectorAll("[data-dashboard-sort]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation(); setPreference("dashboardSort", button.dataset.dashboardSort);
    }));
    content.querySelector("[data-open-timeline-filters]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); showPopup($("#timeline-filter-dialog")); });
    content.querySelector("[data-clear-timeline-filters]")?.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      timelineSearch = ""; timelineMonth = ""; timelineYear = ""; timelineFilter = "all";
      closePopup($("#timeline-filter-dialog")); render();
    });
    content.querySelector("#timeline-filter-dialog form")?.addEventListener("submit", event => {
      event.preventDefault(); event.stopPropagation();
      timelineSearch = event.currentTarget.elements["timeline-search"].value.trim();
      timelineMonth = event.currentTarget.elements["timeline-month"].value;
      timelineYear = event.currentTarget.elements["timeline-year"].value;
      closePopup($("#timeline-filter-dialog")); render();
    });
    content.querySelectorAll("[data-source-filter]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      metadataSourceFilter = button.dataset.sourceFilter;
      content.querySelectorAll("[data-source-filter]").forEach(filter => {
        const selected = filter === button;
        filter.classList.toggle("active", selected);
        filter.setAttribute("aria-pressed", String(selected));
      });
      content.querySelectorAll("[data-source-row]").forEach(row => {
        const enabled = row.dataset.sourceEnabledState === "true";
        row.hidden = metadataSourceFilter === "enabled" ? !enabled : metadataSourceFilter === "disabled" ? enabled : false;
      });
    }));
    content.querySelectorAll("[data-backup-folder-action]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      if (button.dataset.backupFolderAction === "choose") chooseBackupDatabaseFolder();
      else refreshBackupFolderStatus();
    }));
    content.querySelectorAll("[data-storage-action]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      runStorageAction(button.dataset.storageAction).catch(error => toast(error.message || "Storage action failed."));
    }));
    content.querySelectorAll("[data-log-action]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      if (button.dataset.logAction === "clear") { localStorage.removeItem(`${storageKey}_log`); render(); toast("Logs cleared."); }
    }));
    content.querySelectorAll("[data-setting-action]").forEach(button => button.addEventListener("click", event => {
      if (button.type === "file") return; // let the file picker open
      event.preventDefault(); event.stopPropagation();
      const key = button.dataset.settingAction;
      if (key === "resetDashboard") resetDashboard();
      else if (key === "resetAnimations") resetAnimations();
      else if (key === "previewAnimations") previewAnimations();
      else if (key === "resetAppearance") resetAppearance();
      else if (key === "export") goto("export");
      else if (key.startsWith("clear-")) {
        clearAppCaches(key === "clear-images" ? "images" : key === "clear-metadata" ? "metadata" : "temporary")
          .then(() => toast("Temporary cache cleared."))
          .catch(error => toast(error.message || "Could not clear the cache."));
      }
    }));
    content.querySelectorAll("[data-setting-picker]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openSettingPicker(button); }));
    content.querySelector("[data-category-colors-picker]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openCategoryColorsPicker(); });
    content.querySelectorAll("[data-detail-image-src]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation(); showDetailImage($$('[data-detail-image-src]', content).indexOf(button));
    }));
    const imageDialog = content.querySelector("#detail-image-modal");
    imageDialog?.addEventListener("cancel", event => { event.preventDefault(); closeDetailImage(); });
    imageDialog?.addEventListener("keydown", event => {
      if (event.key === "ArrowRight") { event.preventDefault(); showDetailImage(detailImagePosition + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); showDetailImage(detailImagePosition - 1); }
    });
    imageDialog?.addEventListener("click", event => {
      if (event.target === imageDialog) closeDetailImage();
    });
    let imageTouchStart = null;
    imageDialog?.addEventListener("touchstart", event => {
      if (event.touches.length !== 1 || event.target.closest("button")) { imageTouchStart = null; return; }
      imageTouchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    imageDialog?.addEventListener("touchend", event => {
      if (!imageTouchStart || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - imageTouchStart.x;
      const dy = event.changedTouches[0].clientY - imageTouchStart.y;
      imageTouchStart = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      showDetailImage(detailImagePosition + (dx < 0 ? 1 : -1));
    }, { passive: true });
    imageDialog?.addEventListener("touchcancel", () => { imageTouchStart = null; }, { passive: true });
    content.querySelector("[data-detail-image-close]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closeDetailImage(); });
    content.querySelector("[data-detail-image-download]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); downloadDetailImage(); });
    content.querySelector("[data-detail-image-copy]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); copyDetailImage(); });
    content.querySelector("[data-detail-image-share]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); shareDetailImage(); });
    content.querySelector("[data-detail-image-prev]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); showDetailImage(detailImagePosition - 1); });
    content.querySelector("[data-detail-image-next]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); showDetailImage(detailImagePosition + 1); });
  }
  // Share images mirror the Home list: cover, title, developer · genres, rating and status.
  function shareEntry(item) {
    const fieldValue = pattern => item.cachedDetails?.fields?.find(field => pattern.test(String(field.label || "")))?.value || "";
    const show = value => Array.isArray(value) ? value.map(show).filter(Boolean).slice(0, 2).join(", ") : value && typeof value === "object" ? show(value.name || value.title || value.label || value.value) : String(value || "").trim();
    const dev = show(item.facts?.developers || item.cachedDetails?.developers || item.cachedDetails?.developer || fieldValue(/^(developer|developers|studio|studios)$/i));
    const genre = show(item.facts?.genres || item.cachedDetails?.genres || item.cachedDetails?.genre || fieldValue(/^(genre|genres)$/i));
    const progress = Math.max(0, Number(item.progress) || 0), goal = Math.max(0, Number(item.goal) || 0, Number(item.completionTargetHours) || 0);
    const unit = /^hours?$/i.test(String(category(item.category)?.unit || "")) ? " h" : "";
    const tagList = [...new Set([...(String(genre).split(/,\s*/)), ...((item.cachedDetails?.tags || item.facts?.tags || []).map(t => typeof t === "string" ? t : t?.name))].map(v => String(v || "").trim()).filter(Boolean))].slice(0, 5);
    return { id: item.id, tagsText: tagList.join(" · "), title: item.title, subtitle: [dev, genre].filter(Boolean).join(" · "), status: item.status, rating: Number(item.rating) ? `★ ${item.rating}/${prefs.ratingFormat === "10-point" ? 10 : 5}` : "", progressText: progress || goal ? `${progress}${goal ? ` / ${goal}` : ""}${unit}` : "", percent: goal ? Math.min(100, Math.round(progress / goal * 100)) : null };
  }
  const shareCacheGet = async (key, sig) => { const hit = await window.SplitAppIDB?.getThumbs?.([[key, sig]]); return hit?.[0]?.[1] || null; };
  const shareCachePut = (key, sig, blob) => window.SplitAppIDB?.putThumbs?.([[key, sig, blob]]).catch(() => {});
  // Same-origin sources only (local data, device cache, or a fetched blob) so the canvas can be exported.
  async function shareImageFor(entry) {
    const item = itemById(String(entry.id)); if (!item) return null;
    const load = url => new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = url; });
    const tryLocal = async source => { if (!source) return null; return load(source); };
    // Same order the Home card uses, so the share image shows the cover you see in the list.
    let img = item.customCover ? null : await tryLocal(item.localPortraitData || item.localThumbnailData || item.localImageData?.image || item.localImageData?.["cachedDetails.portraitImage"]);
    if (img) return img;
    if (!item.customCover) { try { const hit = (await cachedThumbUrls([[thumbKeyOf(item, false), thumbSigOf(item)]])).get(thumbKeyOf(item, false)); if (hit) { img = await load(hit); if (img) return img; } } catch (_) {} }
    const remotes = [...new Set([item.customCover, item.cachedDetails?.portraitImage, item.image, item.cachedDetails?.image].filter(url => /^https?:/i.test(url || "")))];
    for (const remote of remotes) {
      // A plain <img> can't be exported from a canvas without CORS, so read the bytes first.
      let blob = null;
      try { const r = await fetch(remote, { mode: "cors", credentials: "omit" }); if (r.ok) blob = await r.blob(); } catch (_) {}
      if (!blob) { const response = await requestTimelineImage(remote); if (response) blob = await response.blob(); }
      if (!blob) continue;
      const url = URL.createObjectURL(blob); img = await load(url); setTimeout(() => URL.revokeObjectURL(url), 30000);
      if (img) {
        try { const c = document.createElement("canvas"), k = Math.min(1, 240 / img.width); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); cacheThumbFromItem(item, c.toDataURL("image/jpeg", .8)); } catch (_) {}
        return img;
      }
    }
    // Covers saved in the device folder only exist as files until hydrated.
    if ((item.thumbnailPath || item.localImageFiles?.length) && window.SplitAppBackend?.hydrateThumbnails) {
      try { const clone = { ...item, localPortraitData: "", localThumbnailData: "" }; await window.SplitAppBackend.hydrateThumbnails([clone]); img = await tryLocal(clone.localPortraitData || clone.localThumbnailData); if (img) return img; } catch (_) {}
    }
    return null;
  }
  // Loads any image so a canvas can use it (fetch first: a plain <img> from another origin would taint the canvas).
  async function shareLoadUrl(url, maxWidth = 0) {
    const load = src => new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src; });
    if (!/^https?:/i.test(url || "")) return load(url);
    let blob = null;
    try { const r = await fetch(url, { mode: "cors", credentials: "omit" }); if (r.ok) blob = await r.blob(); } catch (_) {}
    if (!blob) { const response = await requestTimelineImage(url); if (response) blob = await response.blob(); }
    if (!blob) return null;
    if (maxWidth && window.createImageBitmap) { try { return await createImageBitmap(blob, { resizeWidth: maxWidth, resizeQuality: "medium" }); } catch (_) {} }
    const objectUrl = URL.createObjectURL(blob); const img = await load(objectUrl); setTimeout(() => URL.revokeObjectURL(objectUrl), 30000); return img;
  }
  async function openShareGame(id) {
    const item = itemById(String(id)); if (!item) return;
    const entry = shareEntry(item);
    const show = value => Array.isArray(value) ? value.map(show).filter(Boolean).slice(0, 3).join(", ") : value && typeof value === "object" ? show(value.name || value.title || value.label || value.value) : String(value || "").trim();
    const f = item.facts || {}, cd = item.cachedDetails || {};
    const fields = (cd.fields || []).filter(x => x && x.label && String(x.value ?? "").trim());
    const shotUrls = $$("#page-content [data-detail-image-src]").filter(node => /^screenshot/i.test(node.dataset.detailImageLabel || "")).map(node => node.dataset.detailImageSrc).filter(url => /^(https?:|data:)/i.test(url));
    const languages = (cd.languages || []).map(l => typeof l === "string" ? l : l?.name).filter(Boolean);
    const tags = (cd.tags || f.tags || []).map(t => typeof t === "string" ? t : t?.name).filter(Boolean);
    const game = { title: item.title, subtitle: [entry.status, show(f.released || f.releaseDate || cd.releaseDate || item.year)].filter(Boolean).join(" · "), status: entry.status, rating: entry.rating, progressText: entry.progressText, percent: entry.percent, fields, requirements: cd.requirements || null, languages, tags, description: String(cd.description || item.description || item.summary || "").trim(), shotUrls, cover: null };
    game.coverPromise = shareImageFor(entry).catch(() => null);
    window.SplitAppShareGame.open(game, { showPopup, closePopup, toast, esc, loadImage: url => shareLoadUrl(url, 720) });
  }
  // Sideways chip rows: fade the edge that still has content and bring the selected chip into view.
  function setupScrollRows(root) {
    root.querySelectorAll(".entry-status-options, .detail-status-pills, .collection-status-pills").forEach(row => {
      const update = () => {
        row.classList.toggle("can-scroll-right", row.scrollLeft + row.clientWidth < row.scrollWidth - 4);
        row.classList.toggle("can-scroll-left", row.scrollLeft > 4);
      };
      row.addEventListener("scroll", update, { passive: true });
      const active = row.querySelector(".active, [aria-pressed=true]");
      if (active) row.scrollLeft = Math.max(0, active.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft - (row.clientWidth - active.offsetWidth) / 2);
      update();
    });
  }
  function refreshSearchResults(pageKey, targetSelector) {
    const current = $(targetSelector);
    const renderer = window.SplitAppPages[pageKey];
    if (!current || !renderer) return;
    const template = document.createElement("template");
    template.innerHTML = renderer(pageContext());
    const fresh = template.content.querySelector(targetSelector);
    if (!fresh) return;
    current.replaceChildren(...fresh.childNodes);
    if (pageKey === "dashboard") observeDashboardLoaders();
    window.lucide?.createIcons({ root: current, attrs: { "aria-hidden": "true" } });
    observeDeferredImages(current);
  }
  async function refreshStorageDetails() {
    const target = $("#storage-cache-breakdown");
    if (!target) return;
    const prefix = `splitapp_${config.key}`;
    const snapshotKey = `${prefix}_storage_snapshot_v1`;
    try { const snap = JSON.parse(localStorage.getItem(snapshotKey) || "null"); if (snap?.html) { target.innerHTML = snap.html; const node = $("#storage-total"); if (node && snap.total) node.textContent = snap.total; } } catch (_) {}
    try {
      const names = (await window.caches?.keys?.() || []).filter(name => name.startsWith(prefix));
      const totals = { metadata: 0, images: 0, other: 0 };
      // Per-cache sizes are remembered with a cheap signature (entry count + first/last URL), so an unchanged
      // cache costs one keys() call. Changed caches are measured in small slices that yield to the UI and stop
      // as soon as the page is left, so this never competes with scrolling or navigation.
      const sizesKey = `${prefix}_cache_sizes_v1`;
      let known = {}; try { known = JSON.parse(localStorage.getItem(sizesKey) || "{}") || {}; } catch (_) {}
      const next = {};
      const alive = () => Boolean($("#storage-cache-breakdown")?.isConnected) && page === "settings";
      for (const name of names) {
        if (!alive()) return;
        const bucket = name.includes("image") ? "images" : name.includes("metadata") ? "metadata" : "other";
        const cache = await window.caches.open(name);
        const requests = await cache.keys();
        const sig = `${requests.length}|${requests[0]?.url || ""}|${requests[requests.length - 1]?.url || ""}`;
        if (known[name]?.sig === sig) { next[name] = known[name]; totals[bucket] += known[name].bytes; continue; }
        let bytes = 0;
        for (let offset = 0; offset < requests.length; offset += 16) {
          if (!alive()) return;
          const sizes = await Promise.all(requests.slice(offset, offset + 16).map(async request => {
            const response = await cache.match(request);
            return Number(response?.headers.get("content-length")) || (response ? (await response.blob()).size : 0);
          }));
          bytes += sizes.reduce((sum, size) => sum + size, 0);
          await yieldToUser();
        }
        next[name] = { sig, bytes }; totals[bucket] += bytes;
      }
      try { localStorage.setItem(sizesKey, JSON.stringify(next)); } catch (_) {}
      if (!$("#storage-cache-breakdown")) return;
      const format = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
      const libraryBytes = estimateLibraryBytes();
      const total = libraryBytes + totals.metadata + totals.images + totals.other;
      const totalNode = $("#storage-total"); if (totalNode) totalNode.textContent = format(total);
      target.innerHTML = `<div class="storage-breakdown-row"><span>Metadata responses</span><strong>${format(totals.metadata)}</strong></div><div class="storage-breakdown-row"><span>Images and artwork</span><strong>${format(totals.images)}</strong></div>${totals.other ? `<div class="storage-breakdown-row"><span>Other app cache</span><strong>${format(totals.other)}</strong></div>` : ""}`;
      try { localStorage.setItem(snapshotKey, JSON.stringify({ html: target.innerHTML, total: format(total) })); } catch (_) {}
    } catch (_) {
      if (target.isConnected) target.innerHTML = '<div class="storage-breakdown-row"><span>Cache usage</span><strong>Not available in this browser</strong></div>';
    }
  }
  async function refreshBackupFolderStatus() {
    const status = $("#backup-folder-status");
    if (!status || !window.SplitAppBackend?.inspectFolder) return;
    const checkButton = $("[data-backup-folder-action=check]");
    const chooseButton = $("[data-backup-folder-action=choose]");
    const folderAvailable = Boolean(window.SplitAppBackend.isNativeFolderStorageAvailable?.());
    if (checkButton) checkButton.disabled = true;
    if (chooseButton) chooseButton.disabled = true;
    status.dataset.state = "checking";
    const show = (message, state) => {
      if (!status.isConnected) return;
      status.dataset.state = state;
      const label = status.querySelector(".backup-folder-location") || status;
      label.textContent = message;
    };
    // Show the last known result straight away; the (slow, queued) storage check only refreshes it.
    const statusCacheKey = `${config.key}_folder_status_v1`;
    let cachedStatus = null;
    try { cachedStatus = JSON.parse(localStorage.getItem(statusCacheKey) || "null"); } catch (_) {}
    if (cachedStatus?.message) { show(cachedStatus.message, cachedStatus.state); if (checkButton) checkButton.disabled = !folderAvailable; if (chooseButton) chooseButton.disabled = !folderAvailable; }
    else show("Checking folder access and database…", "checking");
    try {
      const result = await window.SplitAppBackend.inspectFolder();
      if (!status.isConnected) return;
      if (result.unsupported) show("Folder storage is available in the Android app.", "unsupported");
      else if (!result.configured) show("No database folder selected. Choose a folder to enable shared storage.", "empty");
      else if (!result.valid) show("Folder access is unavailable. Choose the folder again.", "invalid");
      else if (result.databaseExists) show("Database found. This folder is ready and synced.", "ready");
      else show("Folder is available. SavePoint will create its database here.", "empty");
      try { if (result.configured && result.valid) localStorage.setItem(statusCacheKey, JSON.stringify({ message: status.querySelector(".backup-folder-location")?.textContent || status.textContent, state: status.dataset.state })); else localStorage.removeItem(statusCacheKey); } catch (_) {}
    } catch (error) {
      show(`Could not check folder: ${error.message || error}`, "error");
    } finally {
      if (checkButton?.isConnected) checkButton.disabled = !folderAvailable;
      if (chooseButton?.isConnected) chooseButton.disabled = !folderAvailable;
    }
  }
  function applySelectedFolderData(selected) {
    items = Array.isArray(selected.items) ? selected.items.filter(item => config.categories.some(category => category.key === item.category)) : [];
    history = Array.isArray(selected.history) ? selected.history : [];
    if (selected.loadedFromFolder) {
      Object.keys(prefs).forEach(key => delete prefs[key]);
      Object.assign(prefs, JSON.parse(JSON.stringify(prefsDefaults)));
    }
    if (selected.preferences && typeof selected.preferences === "object") Object.assign(prefs, selected.preferences);
    normalizeDashboardView();
    refreshSourceRegistry();
    normalizeNavigationPrefs();
  }
  async function chooseBackupDatabaseFolder() {
    const button = $("[data-backup-folder-action=choose]");
    const checkButton = $("[data-backup-folder-action=check]");
    const folderAvailable = Boolean(window.SplitAppBackend?.isNativeFolderStorageAvailable?.());
    const status = $("#backup-folder-status");
    if (button) button.disabled = true;
    if (checkButton) checkButton.disabled = true;
    const buttonLabel = button?.querySelector("span");
    if (buttonLabel) buttonLabel.textContent = "Opening picker…";
    if (status) {
      status.dataset.state = "checking";
      const label = status.querySelector(".backup-folder-location") || status;
      label.textContent = "Choose a folder in the Android picker…";
    }
    try {
      const selected = await window.SplitAppBackend.chooseFolder({ items, history, preferences: prefs });
      applySelectedFolderData(selected);
      await window.SplitAppBackend.save({ items, history, preferences: prefs });
      localMutationRevision += 1;
      applyPreferences(); render();
      toast(selected.loadedFromFolder ? "Database loaded from the selected folder." : "Database folder selected and current data saved.");
    } catch (error) {
      if (status?.isConnected) {
        status.dataset.state = "error";
        const label = status.querySelector(".backup-folder-location") || status;
        label.textContent = error.message || "Could not select a database folder.";
      }
      toast(error.message || "Could not select a database folder.");
    } finally {
      if (button?.isConnected) {
        button.disabled = !folderAvailable;
        if (buttonLabel?.isConnected) buttonLabel.textContent = "Choose folder";
      }
      if (checkButton?.isConnected) checkButton.disabled = !folderAvailable;
    }
  }
  async function clearAppCaches(kind) {
    if (!window.caches) return;
    const prefix = `splitapp_${config.key}`;
    const names = (await caches.keys()).filter(name => name.startsWith(prefix) && (kind === "temporary" || name.includes(kind === "images" ? "image" : "metadata")));
    await Promise.all(names.map(name => caches.delete(name)));
  }
  async function runStorageAction(action) {
    if (action === "metadata" || action === "images" || action === "temporary") {
      await clearAppCaches(action); render(); toast("Temporary cache cleared."); return;
    }
    if (action === "clear-data") {
      if (!(await appConfirm("Clear all tracked games and activity history from this device?", { title: "Clear tracked data", confirmLabel: "Clear", danger: true }))) return;
      items = []; history = []; persist(); render(); toast("Tracked data cleared."); return;
    }
    if (action === "factory-reset") {
      if (!(await appConfirm("Factory reset SavePoint? This removes your library, settings, and app cache from this device.", { title: "Factory reset", confirmLabel: "Reset", danger: true }))) return;
      await clearAppCaches("temporary");
      localStorage.removeItem(`${storageKey}_log`);
      try { await window.Capacitor?.Plugins?.EncryptedStore?.clearState?.(); } catch (_) {}
      items = []; history = [];
      Object.keys(prefs).forEach(key => delete prefs[key]);
      Object.assign(prefs, JSON.parse(JSON.stringify(prefsDefaults)));
      prefs.navIcons = { ...prefsDefaults.navIcons };
      prefs.navBar = { order: [...prefsDefaults.navBar.order], visible: { ...prefsDefaults.navBar.visible } };
      prefs.categoryColors = {}; prefs.apiKeys = {}; prefs.sourceOptions = {};
      refreshSourceRegistry();
      persist(); applyPreferences(); render(); toast("SavePoint has been reset.");
    }
  }
  function moveInOrder(order, key, direction, targetKey = null) {
    const from = order.indexOf(key);
    if (from < 0) return order;
    if (targetKey) {
      const to = order.indexOf(targetKey);
      if (to < 0 || to === from) return order;
      order.splice(from, 1); order.splice(to, 0, key); return order;
    }
    const to = from + (direction === "up" ? -1 : 1);
    if (to >= 0 && to < order.length) { order.splice(from, 1); order.splice(to, 0, key); }
    return order;
  }

  function openItem(item = null) {
    if (page !== "add") addReturnPage = page;
    entryDraftId = item?.id || null;
    addMetadataQuery = item?.title || "";
    addMetadataRequestId++;
    goto("add");
    updateProgressLabel(item?.category || config.categories[0]?.key);
    setTimeout(() => $("#item-form")?.elements.title.focus(), 50);
  }
  function readAddImage(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result || "");
      const field = $("#item-form")?.elements.image;
      const preview = $("[data-add-image-preview]");
      if (field) field.value = image;
      if (preview) { preview.src = image; preview.hidden = false; }
      const placeholder = $("[data-add-image-placeholder]"); if (placeholder) placeholder.hidden = true;
    };
    reader.readAsDataURL(file);
  }
  async function searchAddMetadata() {
    addMetadataQuery = $("#add-metadata-query")?.value ?? addMetadataQuery;
    const query = addMetadataQuery.trim();
    const requestId = ++addMetadataRequestId;
    const message = $("#add-metadata-message"), box = $("#add-metadata-results");
    if (!query) { message.textContent = "Enter a game title to search."; return; }
    if (prefs.metadataMode === "offline" || !navigator.onLine) { message.textContent = prefs.metadataMode === "offline" ? "Online metadata is disabled in Settings." : "Reconnect to search metadata sources."; return; }
    message.textContent = "Searching enabled sources…"; box.innerHTML = ""; box.hidden = false;
    try {
      const results = await discoverSearch(query, config.categories[0].key);
      if (requestId !== addMetadataRequestId || page !== "add") return;
      const currentBox = $("#add-metadata-results"), currentMessage = $("#add-metadata-message");
      if (!currentBox || !currentMessage) return;
      currentBox._results = results;
      currentBox.innerHTML = results.slice(0, 16).map((result, index) => `<article class="add-metadata-result"><span class="add-metadata-art">${result.image ? `<img data-deferred-image data-lazy-src="${esc(result.image)}" alt="" loading="lazy" decoding="async" fetchpriority="low" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<i data-lucide="gamepad-2" aria-hidden="true"${result.image ? " hidden" : ""}></i></span><div><strong>${esc(result.title)}</strong><small>${esc(result.source)}${result.year ? ` · ${esc(result.year)}` : ""}${result.subtitle ? ` · ${esc(result.subtitle)}` : ""}</small><p>${esc(result.description || "")}</p></div><button class="button secondary small" type="button" data-add-metadata-index="${index}">Use</button></article>`).join("");
      window.lucide?.createIcons({ root: currentBox, attrs: { "aria-hidden": "true" } });
      observeDeferredImages(currentBox);
      currentMessage.textContent = results.length
        ? results.length + " results found." + (results.warnings?.length ? " " + results.warnings.length + " source(s) did not respond: " + results.warnings.join("; ") : "")
        : "No results found.";
    } catch (error) {
      if (requestId !== addMetadataRequestId || page !== "add") return;
      const currentMessage = $("#add-metadata-message");
      if (currentMessage) currentMessage.textContent = `Could not search metadata: ${error.message || "Please try again."}`;
    }
  }
  async function selectAddMetadata(index) {
    const box = $("#add-metadata-results"), result = box?._results?.[Number(index)], form = $("#item-form");
    if (!result || !form) return;
    form.elements.title.value = result.title || form.elements.title.value;
    form.elements.metadataSource.value = result.source || "";
    form.elements.providerId.value = result.providerId || "";
    form.elements.url.value = result.url || "";
    form.elements.year.value = result.year || "";
    form.elements.description.value = result.description || "";
    const hasLocalImage = /^data:image\//i.test(form.elements.image.value);
    if (!hasLocalImage && result.image) form.elements.image.value = result.image;
    const preview = $("[data-add-image-preview]");
    if (preview && result.image && !hasLocalImage) { preview.src = result.image; preview.hidden = false; const placeholder = $("[data-add-image-placeholder]"); if (placeholder) placeholder.hidden = true; }
    const message = $("#add-metadata-message");
    // The match is applied: collapse the result list (searching again reopens it).
    box.innerHTML = ""; box._results = null; box.hidden = true;
    const queryInput = $("#add-metadata-query"); if (queryInput) queryInput.value = result.title || queryInput.value;
    message.textContent = `Selected ${result.source} · ${result.title}. Loading available details…`;
    if (!result.providerId || !window.SplitAppDetails?.load) { message.textContent = `Selected ${result.source} · ${result.title}`; return; }
    try {
      const details = await window.SplitAppDetails.load({ ...result, category: config.categories[0].key, metadataSource: result.source }, detailSettings());
      if (!$("#item-form") || $("#item-form") !== form) return;
      if (!form.elements.description.value.trim() && details.description) form.elements.description.value = details.description;
      form.elements.year.value = details.year || form.elements.year.value;
      form.elements.url.value = details.url || result.url || form.elements.url.value;
      const detailImage = details.portraitImage || details.image || "";
      if (!hasLocalImage && detailImage) {
        form.elements.image.value = detailImage;
        if (preview) { preview.src = detailImage; preview.hidden = false; }
      }
      message.textContent = `Selected ${result.source} · ${result.title}; details loaded.`;
    } catch (_) {
      message.textContent = `Selected ${result.source} · ${result.title}; basic match details are ready.`;
    }
  }
  function updateProgressLabel(key) {
    const cat = category(key); const label = $("#progress-label");
    label.hidden = false; label.firstChild.textContent = cat?.progressLabel || (cat?.unit ? `Progress (${cat.unit})` : "Progress");
    const goalLabel = $("#goal-label"); goalLabel.hidden = false; goalLabel.firstChild.textContent = cat?.unit ? `Goal (${cat.unit})` : "Goal";
    $("#item-form").elements.progress.step = String(prefs.progressIncrement || 1);
  }
  // Switching between 5 stars and 10 points rescales saved ratings so a 4/5 becomes 8/10 (and back) instead of
  // being read on the new scale. 10 -> 5 keeps the exact score so switching back restores it.
  function convertRatingScale(from, to) {
    if (from === to) return [];
    const changed = [];
    for (const item of items) {
      const rating = Number(item.rating) || 0;
      if (!rating) continue;
      if (to === 10) {
        const exact = item.ratingExact;
        item.rating = exact && Math.round(exact / 2) === Math.round(rating) ? exact : Math.min(10, Math.round(rating * 2));
        delete item.ratingExact;
      } else {
        item.ratingExact = rating;
        item.rating = Math.min(5, Math.max(1, Math.round(rating / 2)));
      }
      item.updatedAt = Date.now(); changed.push(item.id);
    }
    return changed;
  }
  async function clearAllRatings() {
    const rated = items.filter(item => Number(item.rating) > 0);
    if (!rated.length) { toast("No ratings to clear."); return; }
    if (!(await appConfirm(`Remove the rating from ${rated.length} ${rated.length === 1 ? "game" : "games"}? This cannot be undone.`, { title: "Clear all ratings", confirmLabel: "Clear ratings", danger: true }))) return;
    if (prefs.backupBeforeDestructive) exportList({ silent: true });
    rated.forEach(item => { item.rating = 0; delete item.ratingExact; item.updatedAt = Date.now(); });
    persist({ ids: rated.map(item => item.id) }); render(); toast("All ratings cleared.");
  }
  function updateRatingOptions(chosen = "") {
    const select = $("#item-form")?.elements.rating;
    if (!select) return;
    const max = prefs.ratingFormat === "10-point" ? 10 : 5;
    const current = chosen || select.value;
    select.innerHTML = `<option value="">No rating</option>${Array.from({ length: max }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("")}`;
    if (current) select.value = String(current);
  }
  function syncEditedCompletionTarget(entry, previous) {
    if (entry.status !== "Completed" || previous?.status !== "Completed" || entry.goal === Number(previous.goal)) return;
    entry.completionTargetHours = entry.goal;
    entry.progress = Math.max(Number(entry.progress) || 0, entry.goal);
    const selected = completionChoices(entry).find(option => option.hours === entry.goal);
    if (selected) entry.completionTarget = selected.key;
    else delete entry.completionTarget;
  }
  async function saveItem(event) {
    const form = event.currentTarget; const data = new FormData(form); const id = data.get("id");
    const old = itemById(id); const key = data.get("category") || old?.category || config.categories[0]?.key;
    const image = String(data.get("image") || "");
    const entry = { ...old, id: id || crypto.randomUUID(), title: String(data.get("title")).trim(), category: key, status: data.get("status") || defaultStatus(key), progress: Math.max(0, Number(data.get("progress")) || 0), rating: Number(data.get("rating")) || 0, goal: Math.max(0, Number(data.get("goal")) || 0), image, ...(image.startsWith("data:image/") ? { localThumbnailData: image } : {}), description: String(data.get("description") || "").trim(), metadataSource: String(data.get("metadataSource") || ""), providerId: String(data.get("providerId") || ""), url: String(data.get("url") || ""), year: String(data.get("year") || ""), createdAt: old?.createdAt || Date.now(), updatedAt: Date.now() };
    if (!entry.title) return;
    if (entry.status === "Completed" && old?.status !== "Completed") {
      const target = await chooseCompletionTarget(entry);
      if (completionChoices(entry).length > 1 && !target) return;
      if (target) { entry.completionTarget = target.key; entry.completionTargetHours = target.hours; entry.goal = target.hours; entry.progress = target.hours; }
      else if (entry.goal > 0) { entry.completionTargetHours = entry.goal; entry.progress = Math.max(entry.progress, entry.goal); }
    }
    syncEditedCompletionTarget(entry, old);
    if (old) items[items.indexOf(old)] = entry; else items.unshift(entry);
    if (entry.status !== "Backlog" && entry.status !== old?.status) history.unshift({ itemId: entry.id, title: entry.title, action: entry.status, status: entry.status, at: Date.now() });
    await persist({ ids: [entry.id] }); entryDraftId = null; goto(addReturnPage); toast(old ? "Entry updated." : "Added to your library.");
    if (!old && key === "game" && !startSyncJob([entry])) enrichLibraryEntryWithMix(entry, { ...entry, source: entry.metadataSource }, "Add Game");
  }
  async function saveAddForm(form) {
    if (!form?.isConnected || !form.reportValidity()) return;
    await saveItem({ currentTarget: form });
  }
  async function updateProgress(id) {
    const item = itemById(id); if (!item) return;
    const step = Number(prefs.progressIncrement) > 0 ? Number(prefs.progressIncrement) : 1; item.progress = Math.round(((Number(item.progress) || 0) + step) * 1000) / 1000; item.updatedAt = Date.now();
    const previousStatus = item.status;
    if (item.goal && item.progress >= item.goal && prefs.automaticCompletion === "automatic") item.status = "Completed";
    if (item.goal && item.progress >= item.goal && prefs.automaticCompletion === "ask" && await appConfirm(`Mark “${item.title}” completed?`, { title: "Completed?", confirmLabel: "Mark completed" })) item.status = "Completed";
    if (item.status !== previousStatus && ["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(item.status)) history.unshift({ itemId: item.id, title: item.title, action: item.status, status: item.status, at: Date.now() });
    await persist({ ids: [item.id] }); render(); toast("Progress updated.");
  }
  function finishDeletingItem(id, returnPage) {
    const exists = id != null && items.some(entry => String(entry.id) === String(id));
    const removedEntry = exists ? items.find(entry => String(entry.id) === String(id)) : null;
    const removedIndex = removedEntry ? items.indexOf(removedEntry) : -1, removedCopy = removedEntry ? cloneJson(removedEntry) : null;
    if (exists) backupBeforeBulk();
    if (exists) items = items.filter(entry => String(entry.id) !== String(id));
    const requestedPage = returnPage === "details" ? detailReturnPage : returnPage;
    const destination = requestedPage && requestedPage !== "details" && requestedPage in titles ? requestedPage : "dashboard";
    entryDraftId = null;
    detailItemId = null; detailPreview = null; detailData = null; detailError = ""; detailLoading = false; detailEditMode = false; detailRequest++;
    detailReturnPage = "dashboard";
    if (exists) persist();
    goto(destination);
    if (exists && removedCopy) toastUndo("Entry deleted.", () => { items.splice(Math.min(removedIndex, items.length), 0, removedCopy); persist({ ids: [removedCopy.id] }); render(); toast("Restored."); });
    else toast(exists ? "Entry deleted." : "This entry was already removed.");
  }
  function redirectHomeIfDetailMissing() {
    if (page !== "details" || !detailItemId || detailPreview || items.some(entry => String(entry.id) === String(detailItemId))) return false;
    detailItemId = null; detailData = null; detailError = ""; detailLoading = false; detailEditMode = false; detailRequest++;
    goto("dashboard");
    return true;
  }
  async function deleteItem(id) {
    const item = itemById(id); if (!item) return;
    if (!(await appConfirm(`Delete “${item.title}” from your library?`, { title: "Delete title", confirmLabel: "Delete", danger: true }))) return;
    finishDeletingItem(id, addReturnPage);
  }
  // ⋮ → Edit entry opens the game's details page in edit mode (same as its Edit button).
  function openEdit(id) { if (itemById(id)) openDetails(id, true); }
  async function saveDetailEdit(event) {
    event.preventDefault();
    const item = itemById(detailItemId);
    if (!item) return;
    const data = new FormData(event.currentTarget);
    const oldStatus = item.status;
    const draft = { ...item, title: String(data.get("title") || "").trim(), status: String(data.get("status") || item.status), progress: Math.max(0, Number(data.get("progress")) || 0), goal: Math.max(0, Number(data.get("goal")) || 0) };
    if (draft.status === "Completed" && oldStatus !== "Completed") {
      const target = await chooseCompletionTarget(draft);
      if (completionChoices(draft).length > 1 && !target) return;
      if (target) { draft.completionTarget = target.key; draft.completionTargetHours = target.hours; draft.goal = target.hours; draft.progress = target.hours; }
      else if (draft.goal > 0) { draft.completionTargetHours = draft.goal; draft.progress = Math.max(draft.progress, draft.goal); }
    }
    syncEditedCompletionTarget(draft, item);
    Object.assign(item, draft, { updatedAt: Date.now() });
    if (oldStatus !== item.status && ["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(item.status)) history.unshift({ itemId: item.id, title: item.title, action: item.status, status: item.status, at: Date.now() });
    detailEditMode = false;
    await persist({ ids: [item.id] }); render(); toast("Entry updated.");
  }

  function submitDiscover() {
    const input = $("#discover-query");
    if (input) discoverQuery = input.value;
    // Enter fires keydown and "search" together on some keyboards; run the request once.
    if (discoverQuery === discoverSubmitted && Date.now() - discoverSubmittedAt < 500) return;
    discoverSubmitted = discoverQuery; discoverSubmittedAt = Date.now();
    discover();
  }
  function setDiscoverEmptyState(title, description = "", retryLabel = "") {
    const empty = $("#discover-empty");
    if (!empty) return;
    empty.innerHTML = `<i data-lucide="search" aria-hidden="true"></i><p>${esc(title)}</p>${description ? `<small>${esc(description)}</small>` : ""}${retryLabel ? `<button type="button" class="button secondary small" data-discover-retry>${esc(retryLabel)}</button>` : ""}`;
    window.lucide?.createIcons({ root: empty, attrs: { "aria-hidden": "true" } });
  }
  function discoverCardArtwork(image) {
    const hasImage = Boolean(image);
    return `<div class="discover-card-art">${hasImage ? `<img data-deferred-image data-lazy-src="${esc(image)}" alt="" loading="lazy" decoding="async" fetchpriority="low" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<span class="discover-art-fallback" aria-hidden="true"${hasImage ? " hidden" : ""}><i data-lucide="gamepad-2"></i></span></div>`;
  }
  const normalizeLibraryTitle = value => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  // Keys that identify the catalog entry a game was added from. Enrichment can later rename the game or change
  // its year, so matching on the live title alone would show "+ Add" again for a game that is already saved.
  function libraryOriginKeys(result) {
    const keys = [];
    const source = result?.source || result?.metadataSource, id = result?.providerId;
    if (source && id) keys.push(`id:${source}:${id}`);
    const title = normalizeLibraryTitle(result?.title);
    if (title) keys.push(`t:${title}`);
    return keys;
  }
  function findLibraryMatch(result) {
    if (!result?.title) return null;
    const keys = libraryOriginKeys(result);
    const sourceKey = keys.find(key => key.startsWith("id:"));
    if (sourceKey) {
      const byId = items.find(item => (item.originKeys || []).includes(sourceKey) || (item.providerId && item.providerId === result.providerId && (item.metadataSource || item.source) === (result.source || result.metadataSource)) || (item.sourceIds && result.providerId != null && String(item.sourceIds[result.source || result.metadataSource]) === String(result.providerId)));
      if (byId) return byId;
    }
    const yearOf = value => String(value || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "";
    const title = normalizeLibraryTitle(result.title);
    const matches = items.filter(item => (!result.category || item.category === result.category) && (normalizeLibraryTitle(item.title) === title || (item.originKeys || []).includes(`t:${title}`)));
    const year = yearOf(result.year);
    if (year) return matches.find(item => yearOf(item.year) === year) || (matches.length === 1 && !yearOf(matches[0].year) ? matches[0] : null) || matches.find(item => (item.originKeys || []).includes(`t:${title}`) && item.originYear === year) || null;
    return matches.length === 1 ? matches[0] : null;
  }
  function discoverAddButton(result, index) {
    const saved = Boolean(findLibraryMatch(result));
    return `<button class="button ${saved ? "secondary" : "primary"} small" data-discover-row-add="${index}"${saved ? " disabled aria-label=\"Already in your library\"" : ` data-discover-add="${index}"`}>${saved ? "✓ In library" : "+ Add"}</button>`;
  }
  function updateDiscoverLibraryActions() {
    const box = $("#discover-results"); if (!box) return;
    const results = box._results || [];
    $$("[data-discover-row-add]", box).forEach(button => {
      const result = results[Number(button.dataset.discoverRowAdd)], saved = result && findLibraryMatch(result);
      button.disabled = Boolean(saved);
      button.classList.toggle("primary", !saved);
      button.classList.toggle("secondary", Boolean(saved));
      button.textContent = saved ? "✓ In library" : "+ Add";
      button.setAttribute("aria-label", saved ? "Already in your library" : `Add ${result?.title || "game"} to your library`);
      if (saved) button.removeAttribute("data-discover-add");
      else button.dataset.discoverAdd = button.dataset.discoverRowAdd;
    });
  }
  function setDiscoverStatusState(state) {
    const banner = $("#discover-message")?.closest(".discover-status-banner");
    if (banner) banner.dataset.state = state;
  }
  function paintDiscoverResults(results, sourceKey) {
    const key = config.categories[0].key;
    const sourceName = window.SplitAppSources.list().find(source => source.key === sourceKey)?.name;
    const currentMessage = $("#discover-message"), box = $("#discover-results"), empty = $("#discover-empty");
    if (!currentMessage || !box || !empty) return false;
    box.setAttribute("aria-busy", "false");
    const warnings = results.warnings || [];
    const pendingWarning = warnings.find(warning => /source\(s\) still responding/i.test(warning));
    const pendingCount = Number(/^(\d+)/.exec(pendingWarning || "")?.[1]) || 0;
    const failedCount = warnings.length - Number(Boolean(pendingWarning));
    const timeoutText = pendingCount ? "; " + pendingCount + " sources timed out" : "";
    const failureText = failedCount ? "; " + failedCount + (failedCount === 1 ? " source" : " sources") + " failed" : "";
    const partialMessage = warnings.length ? " Showing available matches" + timeoutText + failureText + "." : ".";
    currentMessage.textContent = results.length
      ? results.length + " results found" + (sourceName ? " from " + sourceName : "") + partialMessage
      : "No results found" + (sourceName ? " from " + sourceName : "") + ".";
    setDiscoverStatusState(warnings.length ? "warning" : results.length ? "success" : "neutral");
    box.innerHTML = results.slice(0, 12).map((result, index) => `<article class="discover-card" data-discover-details="${index}">${discoverCardArtwork(result.image)}<div class="discover-card-body"><h3>${esc(result.title)}</h3><p>${esc(result.year || labelCategory(key))}${result.description ? ` · ${esc(result.description.slice(0, 85))}` : ""}</p><div class="toolbar"><button class="button secondary small" data-discover-details="${index}">Details</button>${discoverAddButton(result, index)}</div></div></article>`).join("");
    window.lucide?.createIcons({ root: box, attrs: { "aria-hidden": "true" } });
    empty.hidden = results.length > 0;
    if (!results.length) setDiscoverEmptyState(
      discoverQuery.trim() ? "No games found" : "Search games",
      discoverQuery.trim() ? "Try another title or search a different source." : "Search your connected catalogs to find a game."
    );
    box._results = results;
    updateDiscoverLibraryActions();
    observeDeferredImages(box);
    return true;
  }
  let suggestionsCache = null, suggestionsRequest = 0;
  async function loadDiscoverSuggestions(forceRefresh = false) {
    const requestId = ++suggestionsRequest, sourceKey = discoverSource, category = config.categories[0].key;
    const box = $("#discover-results"), empty = $("#discover-empty"), message = $("#discover-message");
    if (!box) return;
    const cacheKey = `${sourceKey}|${new Date().toDateString()}|${prefs.apiKeys?.rawg ? "k" : ""}`;
    let sections = !forceRefresh && suggestionsCache?.key === cacheKey ? suggestionsCache.sections : null;
    if (!sections && (prefs.metadataMode === "offline" || !navigator.onLine)) {
      box.innerHTML = "";
      box.setAttribute("aria-busy", "false");
      if (empty) empty.hidden = false;
      if (prefs.metadataMode === "offline") {
        setDiscoverEmptyState("Online discovery is off", "Enable metadata sources in Settings to browse suggestions.");
        if (message) message.textContent = "Online metadata is disabled in Settings.";
        setDiscoverStatusState("warning");
      } else {
        setDiscoverEmptyState("You’re offline", "Reconnect to load suggestions. Your saved library is still available.");
        if (message) message.textContent = "No saved suggestions are available offline.";
        setDiscoverStatusState("warning");
      }
      return;
    }
    if (empty) empty.hidden = true;
    if (!sections) {
      box.setAttribute("aria-busy", "true");
      box.innerHTML = `<div class="discover-suggest-loading" aria-hidden="true">${"<span></span>".repeat(6)}</div>`;
      let suggestionsTimeout;
      if (message && navigator.onLine) { message.textContent = "Loading suggestions. You can still search above."; setDiscoverStatusState("neutral"); }
      try {
        sections = await Promise.race([
          window.SplitAppDiscovery.trending(category, detailSettings({ forceRefresh }), sourceKey),
          new Promise((_, reject) => { suggestionsTimeout = setTimeout(() => reject(new Error("Suggestions took too long to load.")), 8000); })
        ]);
      }
      catch (error) {
        if (requestId !== suggestionsRequest || page !== "discover") return;
        box.setAttribute("aria-busy", "false");
        box.innerHTML = ""; if (empty) empty.hidden = false;
        setDiscoverEmptyState("Suggestions unavailable", "Search for a game instead, or try again later.", "Try suggestions again");
        if (message && navigator.onLine) { message.textContent = "Could not load suggestions. Search for a game above."; setDiscoverStatusState("warning"); }
        return;
      } finally { clearTimeout(suggestionsTimeout); }
      suggestionsCache = { key: cacheKey, sections };
    }
    if (requestId !== suggestionsRequest || page !== "discover" || (discoverQuery.trim() && discoverQuery === discoverSubmitted)) return;
    const flat = [];
    const html = sections.map(section => `<section class="discover-suggest"><h2>${esc(section.title)}</h2><div class="discover-rail">${section.items.map(result => {
      const index = flat.push(result) - 1;
      return `<article class="discover-card discover-suggest-card" data-discover-details="${flat.length - 1}">${discoverCardArtwork(result.image)}<div class="discover-card-body"><h3>${esc(result.title)}</h3><p>${esc(result.subtitle || result.year || "")}</p><div class="toolbar"><button class="button secondary small" data-discover-details="${index}">Details</button>${discoverAddButton(result, index)}</div></div></article>`;
    }).join("")}</div></section>`).join("");
    box.setAttribute("aria-busy", "false");
    box.innerHTML = html || ""; box._results = flat;
    updateDiscoverLibraryActions();
    window.lucide?.createIcons({ root: box, attrs: { "aria-hidden": "true" } });
    observeDeferredImages(box);
    if (empty) empty.hidden = flat.length > 0;
    if (!flat.length) setDiscoverEmptyState("No suggestions available", "Search for a game above or check your enabled sources.");
    if (message && flat.length) message.textContent = !navigator.onLine || prefs.metadataMode === "offline"
      ? "Showing saved suggestions; online requests are off."
      : sections.warnings?.length
        ? "Some sources did not respond. Showing available suggestions."
        : "";
    setDiscoverStatusState(sections.warnings?.length ? "warning" : !navigator.onLine || prefs.metadataMode === "offline" ? "neutral" : "success");
  }
  async function discover({ forceRefresh = false } = {}) {
    const query = String(discoverQuery || "").trim(); const key = config.categories[0].key;
    if (query) suggestionsRequest += 1;
    const requestId = ++discoverRequestId; const sourceKey = discoverSource;
    const message = $("#discover-message");
    if (query) discoverInFlight = `${sourceKey}|${query}`;
    if (!query) { message.textContent = ""; loadDiscoverSuggestions(); return; }
    const initialBox = $("#discover-results"), initialEmpty = $("#discover-empty");
    if (initialBox?.isConnected) initialBox.innerHTML = "";
    if (initialBox?.isConnected) initialBox.setAttribute("aria-busy", "false");
    if (initialEmpty?.isConnected) initialEmpty.hidden = false;
    if (prefs.metadataMode === "offline") {
      message.textContent = "Online metadata is disabled in Settings.";
      setDiscoverStatusState("warning");
      setDiscoverEmptyState("Online discovery is off", "Enable metadata sources in Settings to search games.");
      return;
    }
    if (!navigator.onLine) {
      message.textContent = "You are offline. Reconnect and try again.";
      setDiscoverStatusState("warning");
      setDiscoverEmptyState("You’re offline", "Reconnect to search connected catalogs.");
      return;
    }
    if (initialEmpty?.isConnected) initialEmpty.hidden = true;
    if (initialBox?.isConnected) initialBox.setAttribute("aria-busy", "true");
    if (message?.isConnected) { message.textContent = "Searching connected sources…"; setDiscoverStatusState("neutral"); }
    try {
      const results = sourceKey ? await exploreSourceSearch(query, sourceKey, { forceRefresh }) : await discoverSearch(query, key, { forceRefresh });
      if (requestId !== discoverRequestId || page !== "discover" || discoverSource !== sourceKey) return;
      const sourceName = window.SplitAppSources.list().find(source => source.key === sourceKey)?.name;
      if (!paintDiscoverResults(results, sourceKey)) return;
      discoverCache = { source: sourceKey, query, results }; discoverInFlight = "";
    } catch (error) {
      if (requestId === discoverRequestId) discoverInFlight = "";
      if (requestId !== discoverRequestId || page !== "discover" || discoverSource !== sourceKey) return;
      if (initialBox?.isConnected) initialBox.setAttribute("aria-busy", "false");
      const sourceName = window.SplitAppSources.list().find(source => source.key === sourceKey)?.name;
      const status = Number(error?.status) || Number(/\b(\d{3})\b/.exec(error?.message || "")?.[1]);
      const providerMessage = sourceKey === "rawg" && status === 401
        ? "RAWG rejected the API key (HTTP 401). Check or replace it in Settings → Metadata Sources."
        : sourceKey === "igdb" && status === 401
          ? "IGDB rejected the access token (HTTP 401). Replace the Twitch token in Settings → Metadata Sources → IGDB options."
          : sourceKey === "igdb" && status === 403
            ? "IGDB denied the request (HTTP 403). Check that the Twitch Client ID and token belong to the same app."
        : sourceKey === "rawg" && status === 403
          ? "RAWG denied the request (HTTP 403). Check that the key is active, then try again."
          : sourceKey === "rawg" && status === 429
            ? "RAWG’s request limit was reached (HTTP 429). Wait a bit, then try again."
            : status === 403
              ? `${sourceName || "The metadata source"} denied this request (HTTP 403). If the provider showed a consent prompt, review it there and retry; otherwise try another source or try again later.`
              : sourceKey === "rawg" && status === 522
                ? "RAWG is temporarily unreachable (Cloudflare 522). Try again in a little while."
                : error?.message || "Please try again.";
      const currentMessage = $("#discover-message"); if (currentMessage) currentMessage.textContent = `Could not search${sourceName ? ` ${sourceName}` : " sources"}: ${providerMessage}`;
      setDiscoverStatusState("warning");
      const empty = $("#discover-empty"); if (empty) empty.hidden = false;
      setDiscoverEmptyState("Search couldn’t finish", "Check your connection or source settings, then try again.", "Try search again");
      const consentLink = $("#discover-consent-link");
      if (consentLink && sourceKey === "howlongtobeat" && status === 403) {
        consentLink.hidden = false;
        // Give the user an immediate, explicit path to review the provider's
        // consent prompt after a 403. SavePoint never accepts terms for them.
        showPopup($("#discover-consent-dialog"));
      }
      recordLog("warning", `Discover search failed${sourceName ? ` for ${sourceName}` : ""}: ${providerMessage}`);
    }
  }
  async function discoverSearch(query, key, { forceRefresh = false } = {}) {
    if (!window.SplitAppDiscovery) throw new Error("This app's discovery backend did not load.");
    return window.SplitAppDiscovery.search(query, key, {
      metadataSources: prefs.metadataSources, metadataSourceOrder: prefs.metadataSourceOrder, apiKeys: prefs.apiKeys, sourceOptions: prefs.sourceOptions,
      offlineFallback: prefs.offlineFallback, metadataRefreshInterval: prefs.metadataRefreshInterval, forceRefresh
    });
  }
  async function exploreSourceSearch(query, sourceKey, { forceRefresh = false } = {}) {
    if (!window.SplitAppDiscovery?.searchSource) throw new Error("The metadata search service did not load.");
    return window.SplitAppDiscovery.searchSource(query, config.categories[0].key, {
      metadataSources: prefs.metadataSources, metadataSourceOrder: prefs.metadataSourceOrder, apiKeys: prefs.apiKeys, sourceOptions: prefs.sourceOptions,
      offlineFallback: prefs.offlineFallback, metadataRefreshInterval: prefs.metadataRefreshInterval, forceRefresh
    }, sourceKey);
  }
  function syncBackupSchedule() {
    const plugin = window.Capacitor?.Plugins?.BackupScheduler;
    if (!plugin) return;
    if (prefs.backgroundBackups && prefs.backupSchedule === "daily") plugin.schedule?.().catch(() => toast("Could not schedule encrypted backups."));
    else plugin.cancel?.().catch(() => {});
  }
  function applyMixIdentity(item, result) {
    if (!item || !result || (result.source !== "mix" && result.metadataSource !== "mix")) return item;
    const asList = value => Array.isArray(value) ? value : [];
    const sourceKeys = [
      ...asList(item.mixSourceKeys), ...asList(item.facts?.sources),
      ...asList(result.mixSourceKeys), ...asList(result.facts?.sources), ...asList(result.cachedDetails?.facts?.sources)
    ];
    const sourceLabels = [...asList(item.mixSources), ...asList(result.mixSources), ...asList(result.cachedDetails?.mixSources)];
    const knownSourceName = key => window.SplitAppSources.list().find(source => source.key === key)?.name || key;
    if (item.metadataSource && item.metadataSource !== "mix" && item.providerId) item.mixPrimary = { key: item.metadataSource, providerId: item.providerId };
    item.source = item.metadataSource = "mix";
    item.providerId = result.providerId || result.key || item.providerId || "";
    item.mixSourceKeys = [...new Set(sourceKeys.filter(Boolean))];
    item.mixSources = [...new Set([...sourceLabels, ...item.mixSourceKeys.map(knownSourceName)].filter(Boolean))];
    item.facts = { ...(item.facts || {}), source: "mix", sources: item.mixSourceKeys };
    if (result.cachedDetails) item.cachedDetails = result.cachedDetails;
    return item;
  }
  async function addDiscoverResult(result, origin = "Discover") {
    if (!result) return null;
    let item = findLibraryMatch(result);
    const wasSaved = Boolean(item);
    if (!item) {
      item = { ...result, originKeys: libraryOriginKeys(result), originYear: String(result.year || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "", metadataSource: result.source || result.metadataSource || "", id: crypto.randomUUID(), status: prefs.defaultStatus || defaultStatus(result.category), progress: 0, rating: 0, createdAt: Date.now(), updatedAt: Date.now() };
      applyMixIdentity(item, result);
      items.unshift(item);
      if (["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(item.status)) history.unshift({ itemId: item.id, title: item.title, action: item.status, status: item.status, at: Date.now() });
    }
    item.updatedAt = Date.now();
    await persist({ ids: [item.id] });
    updateDiscoverLibraryActions();
    if (page === "mix") paintMixResults();
    toast(wasSaved ? "Refreshing this library entry from enabled sources…" : `Added to your library. Fetching details from enabled sources…`);
    // Shown on the Sync page like any other background sync; falls back to a direct fetch when sync is unavailable (offline, no sources).
    if (!startSyncJob([item])) enrichLibraryEntryWithMix(item, result, origin);
    return item;
  }
  // Keep the best value per fact across providers (a later source never blanks out earlier data).
  function mergeFacts(previous = {}, next = {}) {
    const merged = { ...previous };
    for (const [key, value] of Object.entries(next || {})) {
      const empty = value === "" || value == null || value === 0 || (Array.isArray(value) && !value.length);
      if (!empty || merged[key] == null) merged[key] = value;
    }
    return merged;
  }
  function applyEnrichedDetails(current, loaded, mixed) {
    if (!current || !loaded) return;
    if (mixed) {
      applyMixIdentity(current, loaded);
      current.mixSourceKeys = [...new Set(loaded.facts?.sources || [])];
      current.mixSources = [...new Set(loaded.mixSources || current.mixSourceKeys.map(key => window.SplitAppSources.list().find(source => source.key === key)?.name || key))];
    }
    // Per-game index of source -> provider id; only ever grows, so later syncs fetch by id and a flaky source can't drop out.
    if (loaded.sourceIds) current.sourceIds = { ...(current.sourceIds || {}), ...loaded.sourceIds };
    if (mixed) current.mixSourceKeys = [...new Set([...(current.mixSourceKeys || []), ...(loaded.facts?.sources || [])])];
    current.cachedDetails = loaded;
    current.facts = mergeFacts(current.facts, loaded.facts);
    current.description = loaded.description || current.description;
    current.year = loaded.year || current.year;
    current.url = loaded.url || current.url;
    current.image = current.customCover || current.localThumbnailData || loaded.portraitImage || loaded.image || current.image;
    current.backdrop = loaded.landscapeImage || loaded.backgroundImage || current.backdrop;
    current.updatedAt = Date.now();
  }
  function enrichLibraryEntryWithMix(item, sourceResult = {}, origin = "Library", options = {}) {
    if (!item?.id || item.category !== "game" || !window.SplitAppMix?.load) return Promise.resolve(null);
    if (mixEnrichmentByItem.has(String(item.id))) return mixEnrichmentByItem.get(String(item.id));
    const itemId = String(item.id);
    const task = (async () => {
      const saved = itemById(itemId);
      if (!saved) return null;
      let loaded = null, mixed = false;
      try {
        loaded = await window.SplitAppMix.load({ ...saved, ...sourceResult, title: saved.title, category: saved.category }, { ...detailSettings(), background: options.background !== false }, options.quiet ? null : partial => {
          const current = itemById(itemId);
          if (!current) return;
          applyEnrichedDetails(current, partial, true);
          if (page === "details" && String(detailItemId) === itemId) { detailData = partial; render(); }
        });
        mixed = true;
      } catch (mixError) {
        if (!options.quiet) recordLog("warning", `Mix fetch could not load ${saved.title}: ${mixError?.message || mixError}`);
        const sourceKey = sourceResult.metadataSource || sourceResult.source || saved.metadataSource;
        const providerId = sourceResult.providerId || saved.providerId;
        // A game that already has merged details keeps them when a known source is down; the single-source fallback is only for games with nothing saved.
        if (!saved.cachedDetails && sourceKey && sourceKey !== "mix" && providerId && window.SplitAppDetailController?.load) {
          try { loaded = await window.SplitAppDetailController.load({ ...saved, ...sourceResult, metadataSource: sourceKey, providerId, title: saved.title, category: saved.category }, detailSettings()); }
          catch (error) { if (!options.quiet) recordLog("warning", `Could not load source details for ${saved.title}: ${error?.message || error}`); }
        }
      }
      const current = itemById(itemId);
      if (current && !loaded) current.mixFailedAt = Date.now();
      if (!current || !loaded) return null;
      applyEnrichedDetails(current, loaded, mixed);
      // Remember when and against which sources this game was last checked, so a later refresh can skip it.
      current.mixCheckedAt = Date.now(); current.mixCheckedSources = loaded.checkedSources || enabledGameSourceKeys(); delete current.mixFailedAt;
      if (options.persist !== false) await persist({ ids: [itemId] });
      if (options.loadImages !== false) {
        try {
          const localImages = await window.SplitAppBackend?.loadItemImages?.(current);
          if (localImages && Object.keys(localImages).length) current.localImageData = localImages;
        } catch (error) { if (!options.quiet) recordLog("warning", `Could not load local images for ${current.title}: ${error?.message || error}`); }
      }
      if (page === "details" && String(detailItemId) === itemId) { detailData = loaded; detailLoading = false; render(); }
      updateDiscoverLibraryActions();
      if (page === "dashboard") patchDashboardCard(itemId);
      else if (page === "discover" || page === "mix") render();
      return loaded;
    })().catch(error => {
      if (!options.quiet) recordLog("error", `Could not save fetched details for ${item.title}: ${error?.message || error}`);
      return null;
    }).finally(() => mixEnrichmentByItem.delete(itemId));
    mixEnrichmentByItem.set(itemId, task);
    return task;
  }
  // ---- Mix fetch (experimental) ----
  const mixChips = keys => (keys || []).map(key => window.SplitAppSources.list().find(source => source.key === key)?.name || key).map(name => `<span class="mix-chip">${esc(name)}</span>`).join("");
  function paintMixResults() {
    const box = $("#mix-results"), message = $("#mix-message"); if (!box) return;
    const rows = mixCache?.results || [];
    box.innerHTML = rows.map((row, index) => { const saved = findLibraryMatch({ ...row, category: config.categories[0].key }); return `<li class="mix-row"><button type="button" class="mix-result-main" data-mix-open="${index}" aria-label="View details for ${esc(row.title)}"><span class="mix-row-art">${row.image ? `<img data-deferred-image data-lazy-src="${esc(row.image)}" alt="" loading="lazy" decoding="async" fetchpriority="low" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<i data-lucide="gamepad-2" aria-hidden="true"${row.image ? " hidden" : ""}></i></span><span class="mix-row-copy"><strong>${esc(row.title)}</strong><small>${row.year ? esc(row.year) : "Game"}</small><span class="mix-row-sources">${mixChips(row.sources)}</span></span></button><button type="button" class="button ${saved ? "secondary" : "primary"} small" data-mix-add="${index}" aria-label="${saved ? "Already in your library" : `Add ${esc(row.title)} to library`}"${saved ? " disabled" : ""}><i data-lucide="${saved ? "check" : "plus"}" aria-hidden="true"></i><span>${saved ? "In library" : "Add"}</span></button></li>`; }).join("");
    window.lucide?.createIcons({ root: box, attrs: { "aria-hidden": "true" } });
    observeDeferredImages(box);
    if (message && mixCache && !message.textContent) message.textContent = rows.length ? `${rows.length} games · open one to merge details from all sources.` : "No games found.";
  }
  async function runMixSearch() {
    const query = ($("#mix-query")?.value || "").trim(), message = $("#mix-message"), box = $("#mix-results");
    if (!query) { if (message) message.textContent = "Type a title to search."; return; }
    const requestId = ++mixRequest; if (box) box.innerHTML = ""; if (message) message.textContent = "Searching all enabled sources…";
    try {
      const results = await window.SplitAppMix.search(query, detailSettings());
      if (requestId !== mixRequest || page !== "mix") return;
      mixCache = { query, results }; if (message) message.textContent = ""; paintMixResults();
    } catch (error) { if (requestId === mixRequest && message) message.textContent = error?.message || "Search failed."; }
  }
  const mixItem = row => ({ title: row.title, category: config.categories[0].key, source: "mix", metadataSource: "mix", providerId: row.key, mixSourceKeys: [...(row.sources || [])], mixSources: (row.sources || []).map(key => window.SplitAppSources.list().find(source => source.key === key)?.name || key), image: row.image || "", year: row.year || "", description: "", url: "" });
  function openMixDetails(row) {
    detailTab = "";
    detailReturnPage = "mix"; detailPreview = mixItem(row); detailEditMode = false; detailItemId = null; detailData = null; detailError = "";
    goto("details"); loadDetails();
  }
  async function addMixResult(row) {
    if (!row) return;
    const candidate = mixItem(row);
    return addDiscoverResult(candidate, "Mix fetch");
  }
  // Looks up play time (HowLongToBeat in the Android app, then RAWG) for games whose saved source has no hours.
  async function findMissingHours(button) {
    if (factsRunning) return; factsRunning = true; button.disabled = true;
    const hasHours = item => Number(item.facts?.mainHours) || Number(item.facts?.averageHours);
    const pending = items.filter(item => !hasHours(item));
    let found = 0, completed = 0;
    await runWithConcurrency(pending, prefs.metadataWorkers, async item => {
      button.textContent = `Looking up ${Math.min(pending.length, completed + 1)} of ${pending.length}…`;
      try {
        const hours = await window.SplitAppMix.hours(item.title, detailSettings());
        if (hours) { item.facts = mergeFacts(item.facts, hours); item.updatedAt = Date.now(); found += 1; }
      } catch (error) { recordLog("warning", `Play-time lookup failed for ${item.title}: ${error?.message || error}`); }
      completed += 1;
    });
    if (found) await persist();
    factsRunning = false; render(); toast(found ? `Found play times for ${found} of ${pending.length} games.` : "No play times found. Enable HowLongToBeat (Android) or add a RAWG key.");
  }
  // Saves provider details (play time, price, team, requirements, images) for games that never opened their details page.
  let factsRunning = false;
  async function fetchMissingFacts(button) {
    if (factsRunning) return; factsRunning = true; button.disabled = true;
    const pending = items.filter(item => item.metadataSource && item.providerId && !item.facts?.fetchedAt);
    let done = 0, completed = 0;
    await runWithConcurrency(pending, prefs.metadataWorkers, async item => {
      button.textContent = `Fetching ${Math.min(pending.length, completed + 1)} of ${pending.length}…`;
      try {
        const loaded = await window.SplitAppDetails.load(item, detailSettings());
        item.cachedDetails = loaded; item.facts = mergeFacts(item.facts, loaded.facts);
        item.description = loaded.description || item.description; item.year = loaded.year || item.year;
        item.image = loaded.portraitImage || loaded.image || item.image;
        item.backdrop = loaded.landscapeImage || loaded.backgroundImage || item.backdrop;
        item.updatedAt = Date.now();
        done += 1;
      } catch (error) { recordLog("warning", `Could not fetch details for ${item.title}: ${error?.message || error}`); }
      completed += 1;
    });
    if (done) await persist();
    factsRunning = false; render(); toast(`Saved details for ${done} of ${pending.length} games.`);
  }
  function readCustomSourceForm() {
    const form = $("#custom-source-form"); if (!form) return null;
    const get = name => String(form.elements[name]?.value || "").trim();
    const group = prefix => Object.fromEntries([...form.elements].filter(el => el.name?.startsWith(prefix)).map(el => [el.name.slice(prefix.length), String(el.value || "").trim()]).filter(([, value]) => value));
    return { id: get("sourceId") || crypto.randomUUID().slice(0, 8), name: get("name"), searchUrl: get("searchUrl"), apiKey: get("apiKey"), apiKeyHeader: get("apiKeyHeader"), resultsPath: get("resultsPath"), imageTemplate: get("imageTemplate"), suggestionsUrl: get("suggestionsUrl"), detailUrl: get("detailUrl"), detailRoot: get("detailRoot"), map: group("map."), detailMap: group("dmap.") };
  }
  function validateCustomSource(config) {
    if (!config?.name) return "Give the source a name.";
    if (!/^https?:\/\//i.test(config.searchUrl)) return "The search URL must start with http:// or https://.";
    if (!/\{query\}/.test(config.searchUrl)) return "The search URL needs {query} where the search text goes.";
    if (!config.map.title) return "Say which field holds the game title.";
    return "";
  }
  async function testCustomSourceForm() {
    const output = $("#custom-source-test-output"), config = readCustomSourceForm(), problem = validateCustomSource(config);
    if (problem) { output.textContent = problem; output.dataset.state = "error"; return; }
    output.textContent = "Testing…"; output.dataset.state = "";
    try {
      const results = await window.SplitAppDiscovery.testCustomSource(config, "zelda", detailSettings());
      output.dataset.state = results.length ? "ok" : "error";
      output.innerHTML = results.length ? `<strong>${results.length} result${results.length === 1 ? "" : "s"} found</strong>${results.slice(0, 4).map(row => `<div class="cs-test-row">${row.image ? `<img src="${esc(row.image)}" alt="" onerror="this.hidden=true">` : ""}<span>${esc(row.title)}<small>${esc(row.subtitle || row.year || "")}</small></span></div>`).join("")}` : "The request worked but no results matched. Check the results path and the title field.";
    } catch (error) { output.dataset.state = "error"; output.textContent = `Failed: ${error?.message || error}`; }
  }
  function saveCustomSource(event) {
    event.preventDefault();
    const config = readCustomSourceForm(), problem = validateCustomSource(config);
    if (problem) { const output = $("#custom-source-test-output"); output.textContent = problem; output.dataset.state = "error"; return; }
    const list = [...(prefs.customSources || [])], index = list.findIndex(row => row.id === config.id);
    if (index >= 0) list[index] = config; else list.push(config);
    prefs.customSources = list; refreshSourceRegistry();
    prefs.metadataSources[`custom:${config.id}`] = prefs.metadataSources[`custom:${config.id}`] !== false;
    persist(); settingsParam = ""; settingsGroup = "metadata-sources"; goto("settings", false); window.history.replaceState({ page, settingsGroup }, "", "#settings/metadata-sources"); toast(index >= 0 ? "Custom source updated." : "Custom source added.");
  }
  async function deleteCustomSource() {
    const id = $("#custom-source-form")?.elements.sourceId.value; if (!id || !(await appConfirm("Delete this custom source?", { title: "Delete source", confirmLabel: "Delete", danger: true }))) return;
    prefs.customSources = (prefs.customSources || []).filter(row => row.id !== id);
    delete prefs.metadataSources[`custom:${id}`]; refreshSourceRegistry();
    persist(); settingsParam = ""; settingsGroup = "metadata-sources"; goto("settings", false); window.history.replaceState({ page, settingsGroup }, "", "#settings/metadata-sources"); toast("Custom source deleted.");
  }
  function detailSettings({ forceRefresh = false } = {}) { return { metadataSources: prefs.metadataSources, apiKeys: prefs.apiKeys, sourceOptions: prefs.sourceOptions, offlineFallback: prefs.offlineFallback, metadataRefreshInterval: prefs.metadataRefreshInterval, forceRefresh }; }
  function detailCacheIsFresh(item) {
    const stamp = Number(item?.cachedDetails?.fetchedAt || item?.cachedDetails?.facts?.fetchedAt || item?.facts?.fetchedAt) || 0;
    if (!stamp) return false;
    const maxAge = { daily: 86400000, weekly: 604800000, monthly: 2592000000, never: Infinity }[prefs.metadataRefreshInterval] ?? 604800000;
    return Date.now() - stamp < maxAge;
  }
  async function loadDetails({ force = false } = {}) {
    const isPreview = Boolean(detailPreview);
    const item = detailPreview || itemById(detailItemId);
    const requestId = ++detailRequest; detailData = item?.cachedDetails || null; detailError = "";
    if (!item) { detailLoading = false; render(); return; }
    const hasCachedDetails = Boolean(item.cachedDetails);
    detailLoading = !hasCachedDetails;
    render();
    // Artwork restoration can touch several folder files. Let the cached page paint
    // first so local file reads never delay opening an otherwise ready game.
    if (!isPreview && window.SplitAppBackend?.loadItemImages) {
      window.SplitAppBackend.loadItemImages(item).then(localImageData => {
        if (requestId === detailRequest && page === "details" && Object.keys(localImageData || {}).length) { item.localImageData = localImageData; render(); }
      }).catch(() => {});
    }
    if (!item.metadataSource || !item.providerId) { detailLoading = false; return; }
    const singleSource = !isPreview && item.category === "game" && item.metadataSource !== "mix" && hasCachedDetails && Boolean(window.SplitAppMix?.load);
    const mixDue = singleSource && Date.now() - (Number(item.mixTriedAt) || 0) > 6 * 3600000;
    const mixOnly = !force && hasCachedDetails && detailCacheIsFresh(item) && mixDue;
    if (!force && hasCachedDetails && detailCacheIsFresh(item) && !mixDue) { detailLoading = false; return; }
    if (prefs.metadataMode === "offline" || !navigator.onLine) { detailLoading = false; return; }
    // Stale cached content stays visible while this refresh runs in the background.
    detailLoading = !hasCachedDetails;
    if (detailLoading) render();
    try {
      const settings = detailSettings({ forceRefresh: force });
      const requestKey = isPreview ? `preview:${item.metadataSource}:${item.providerId}` : String(item.id);
      let refresh = detailRefreshByItem.get(requestKey);
      if (!refresh) {
        refresh = (async () => {
          let loaded, upgradedToMix = false;
          // A stale single-source game checks all enabled catalogs. Multiple matches
          // upgrade it to Mix; otherwise its original provider remains authoritative.
          // Only when something is already on screen: with nothing cached, waiting for every catalog would keep the page loading.
          if (singleSource) {
            try {
              // Something is already on screen, so slow catalogs (HowLongToBeat) get the long grace period.
              const combined = await window.SplitAppMix.load(item, { ...settings, background: true });
              if ((combined?.facts?.sources || []).length > 1) { loaded = combined; upgradedToMix = true; }
            } catch (_) { /* Keep the saved provider as a fallback if cross-source lookup fails. */ }
            item.mixTriedAt = Date.now();
          }
          if (!loaded) loaded = mixOnly ? item.cachedDetails : await window.SplitAppDetails.load(item, settings);
          return { loaded, upgradedToMix };
        })();
        detailRefreshByItem.set(requestKey, refresh);
      }
      let refreshed;
      try { refreshed = await refresh; }
      finally { if (detailRefreshByItem.get(requestKey) === refresh) detailRefreshByItem.delete(requestKey); }
      const { loaded, upgradedToMix } = refreshed;
      if (requestId === detailRequest) {
        detailData = loaded;
        if (!isPreview) {
          const tracking = {
            status: item.status,
            goal: item.goal,
            progress: item.progress,
            completionTarget: item.completionTarget,
            completionTargetHours: item.completionTargetHours
          };
          if (upgradedToMix) applyMixIdentity(item, loaded);
          item.cachedDetails = loaded;
          if (item.metadataSource === "mix") {
            item.mixSources = loaded.mixSources || item.mixSources;
            item.mixSourceKeys = loaded.facts?.sources || item.mixSourceKeys || [];
          }
          item.facts = mergeFacts(item.facts, loaded.facts);
          item.description = loaded.description || item.description;
          item.year = loaded.year || item.year;
          item.image = loaded.portraitImage || loaded.image || item.image;
          item.backdrop = loaded.landscapeImage || loaded.backgroundImage || item.backdrop;
          Object.assign(item, tracking);
          item.updatedAt = Date.now();
          persist({ ids: [item.id] });
          window.SplitAppBackend?.loadItemImages?.(item).then(localImageData => {
            if (requestId === detailRequest && page === "details" && Object.keys(localImageData || {}).length) { item.localImageData = localImageData; render(); }
          }).catch(() => {});
        }
      }
    }
    catch (error) { if (requestId === detailRequest) { detailError = hasCachedDetails ? "" : error?.message || "Could not load source details."; recordLog(hasCachedDetails ? "warning" : "error", `${item.metadataSource} detail request failed: ${error?.message || error}`); } }
    finally { if (requestId === detailRequest) { detailLoading = false; render(); } }
  }
  function toggleEpisodeWatched(itemId, episodeId, episodeTitle) {
    const item = itemById(itemId); if (!item) return;
    const watched = new Set((item.watchedEpisodeIds || []).map(String));
    const id = String(episodeId);
    const previousStatus = item.status;
    if (watched.has(id)) watched.delete(id); else watched.add(id);
    item.watchedEpisodeIds = [...watched];
    item.goal = Number(item.goal) || Number(detailData?.goal) || watched.size;
    item.progress = watched.size;
    if (item.goal && item.progress >= item.goal && prefs.automaticCompletion === "automatic") item.status = "Completed";
    item.updatedAt = Date.now();
    if (item.status !== previousStatus && ["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(item.status)) history.unshift({ itemId: item.id, title: item.title, action: item.status, status: item.status, at: Date.now() });
    persist({ ids: [item.id] }); render(); toast(watched.has(id) ? "Episode marked watched." : "Episode marked unwatched.");
  }
  function deleteFromDetails(id) {
    // Deleting from a detail view always returns to the Home library.
    finishDeletingItem(id, "dashboard");
  }
  function requestDeleteDetails(id) {
    const dialog = $("#detail-delete-dialog");
    const confirmButton = dialog?.querySelector("[data-detail-delete-confirm]");
    if (dialog) dialog.dataset.itemId = String(id ?? "");
    if (confirmButton) confirmButton.dataset.detailDeleteId = String(id ?? "");
    if (!items.some(entry => String(entry.id) === String(id))) { closePopup(dialog); deleteFromDetails(id); return; }
    showPopup(dialog);
  }
  function completionChoices(item) {
    const facts = { ...(item?.cachedDetails?.facts || {}), ...(item?.facts || {}) };
    return [["mainHours", "Main story"], ["extrasHours", "Main story + extras"], ["completionistHours", "Completionist"]]
      .map(([key, label]) => ({ key, label, hours: Number(facts[key]) || 0 })).filter(option => option.hours > 0);
  }
  function chooseCompletionTarget(item) {
    const options = completionChoices(item);
    if (options.length < 2) return Promise.resolve(options[0] || null);
    return new Promise(resolve => {
      let dialog = $("#completion-target-dialog");
      if (!dialog) { dialog = document.createElement("dialog"); dialog.id = "completion-target-dialog"; dialog.className = "choice-dialog completion-target-dialog"; document.body.appendChild(dialog); }
      let settled = false;
      const finish = option => { if (settled) return; settled = true; dialog.removeEventListener("click", onClick); dialog.removeEventListener("close", onClose); closePopup(dialog); resolve(option); };
      const onClose = () => finish(null);
      const onClick = event => { const choice = event.target.closest("[data-completion-target]"); if (choice) finish(options[Number(choice.dataset.completionTarget)] || null); else if (event.target === dialog || event.target.closest("[data-completion-cancel]")) finish(null); };
      dialog.innerHTML = `<div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">PLAYTIME GOAL</p><h2>How did you finish ${esc(item.title)}?</h2></div></header><p class="completion-target-help">Choose the playtime target to use for your goal and statistics.</p><div class="completion-target-options">${options.map((option, index) => `<button type="button" class="completion-target-option" data-completion-target="${index}"><span><strong>${esc(option.label)}</strong><small>${option.hours} hours</small></span><i data-lucide="chevron-right" aria-hidden="true"></i></button>`).join("")}</div><footer class="choice-dialog-actions"><button type="button" class="button secondary" data-completion-cancel>Cancel</button></footer>`;
      dialog.addEventListener("click", onClick); dialog.addEventListener("close", onClose);
      window.lucide?.createIcons({ root: dialog, attrs: { "aria-hidden": "true" } });
      showPopup(dialog);
    });
  }
  async function setItemStatus(item, status) {
    if (!item || (item.status === status && status !== "Completed")) return false;
    let selectedTarget = null;
    if (status === "Completed") {
      selectedTarget = await chooseCompletionTarget(item);
      if (completionChoices(item).length > 1 && !selectedTarget) return false;
      if (selectedTarget) {
        item.completionTarget = selectedTarget.key;
        item.completionTargetHours = selectedTarget.hours;
        item.goal = selectedTarget.hours;
        item.progress = selectedTarget.hours;
      } else if (Number(item.goal) > 0) {
        item.completionTargetHours = Number(item.goal);
        item.progress = Math.max(Number(item.progress) || 0, Number(item.goal));
      }
    }
    const changed = item.status !== status;
    item.status = status; item.updatedAt = Date.now();
    if (changed && ["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(status)) history.unshift({ itemId: item.id, title: item.title, action: status, status, at: Date.now() });
    await persist({ ids: [item.id] });
    return true;
  }
  function toggleFavorite(id) {
    const item = itemById(String(id)); if (!item) return;
    item.favorite = !item.favorite; item.updatedAt = Date.now();
    persist({ ids: [item.id] }); render();
    toast(item.favorite ? "Added to favorites." : "Removed from favorites.");
  }
  function openItemActions(id) {
    const item = itemById(String(id)); if (!item) return;
    const statusIcons = { Playing: "gamepad-2", Upcoming: "calendar-clock", Backlog: "bookmark", "On Hold": "pause-circle", Dropped: "circle-minus", Completed: "check-circle" };
    const statusColors = { Playing: "accent", Upcoming: "accent", Backlog: "neutral", "On Hold": "warning", Dropped: "danger", Completed: "success" };
    const availableStatuses = [...new Set(category(item.category)?.statuses || ["Backlog", "Playing", "On Hold", "Dropped", "Completed", "Upcoming"])]
      .filter(status => status !== item.status);
    const statusActions = availableStatuses.map(status => `<button type="button" class="${statusColors[status] || "neutral"}" data-sheet-action="${esc(status)}"><i data-lucide="${statusIcons[status] || "circle"}"></i>Mark as ${esc(status)}</button>`).join("");
    let dialog = $("#item-action-dialog");
    if (!dialog) {
      dialog = document.createElement("dialog"); dialog.id = "item-action-dialog"; dialog.className = "ios-action-sheet";
      document.body.appendChild(dialog);
      dialog.addEventListener("click", async event => {
        if (event.target === dialog) { closePopup(dialog); return; }
        const button = event.target.closest("[data-sheet-action]"); if (!button) return;
        const target = itemById(String(dialog.dataset.itemId));
        if (!target) return;
        const action = button.dataset.sheetAction;
        if (action === "details") {
          closePopup(dialog, { preserveHistory: true });
          openDetails(target.id);
          return;
        }
        // Editing navigates to another page; keep the sheet's history entry so closing it cannot undo that navigation.
        closePopup(dialog, { preserveHistory: action === "edit" });
        if (action === "edit") openEdit(target.id);
        else if (action === "favorite") toggleFavorite(target.id);
        else if (action === "remove") {
          if (!(await appConfirm(`Remove “${target.title}” from your collection?`, { title: "Remove title", confirmLabel: "Remove", danger: true }))) return;
          removeItemsWithUndo([target], `Removed “${target.title}”.`);
        } else if (action !== "cancel") { if (await setItemStatus(target, action)) { render(); toast(`Marked as ${action}.`); } }
      });
    }
    dialog.dataset.itemId = id;
    dialog.innerHTML = `<div class="ios-action-group"><p>${esc(item.title)}</p><button type="button" data-sheet-action="edit"><i data-lucide="pencil"></i>Edit entry</button><button type="button" data-sheet-action="details"><i data-lucide="info"></i>View Full Details</button><button type="button" class="${item.favorite ? "favorite-on" : ""}" data-sheet-action="favorite"><i data-lucide="heart"></i>${item.favorite ? "Remove from favorites" : "Add to favorites"}</button>${statusActions}<button type="button" data-sheet-action="remove" class="danger"><i data-lucide="trash-2"></i>Remove from Collection</button></div><button type="button" class="ios-action-cancel" data-sheet-action="cancel">Cancel</button>`;
    window.lucide?.createIcons({ root: dialog, attrs: { "aria-hidden": "true" } });
    showPopup(dialog);
  }
  function openDetails(id, edit = false) { detailTab = ""; detailReturnPage = page === "details" ? detailReturnPage : page; detailPreview = null; detailEditMode = edit; detailItemId = id; detailData = null; detailError = ""; goto("details"); loadDetails(); }
  function openDiscoverDetails(result) { if (!result) return; detailTab = ""; detailReturnPage = "discover"; detailPreview = { ...result, metadataSource: result.source }; detailEditMode = false; detailItemId = null; detailData = null; detailError = ""; goto("details"); loadDetails(); }
  function showDetailImage(position) {
    const dialog = $("#detail-image-modal");
    const triggers = $$("#page-content [data-detail-image-src]");
    if (!dialog || !triggers.length) return;
    const wasOpen = dialog.open;
    const previousPosition = detailImagePosition;
    detailImagePosition = ((position % triggers.length) + triggers.length) % triggers.length;
    const trigger = triggers[detailImagePosition];
    const image = $("[data-detail-modal-img]", dialog);
    if (!image || !trigger) return;
    if (!wasOpen) detailImageOpener = trigger;
    const requestId = Number(dialog.dataset.imageRequest || 0) + 1;
    dialog.dataset.imageRequest = String(requestId);
    const status = $("[data-detail-image-status]", dialog);
    const label = trigger.dataset.detailImageLabel || "Game image";
    image.classList.remove("is-loaded", "is-switching");
    image.classList.toggle("is-switching", wasOpen);
    if (wasOpen) window.setTimeout(() => image.classList.remove("is-switching"), 220);
    dialog.dataset.imageDirection = position >= previousPosition ? "next" : "previous";
    image.alt = label;
    if (status) { status.hidden = false; status.textContent = "Loading image…"; }
    image.onload = () => {
      if (Number(dialog.dataset.imageRequest) !== requestId) return;
      image.classList.add("is-loaded");
      if (status) status.hidden = true;
    };
    image.onerror = () => {
      if (Number(dialog.dataset.imageRequest) !== requestId) return;
      image.classList.remove("is-loaded");
      if (status) { status.hidden = false; status.textContent = "This image couldn’t be loaded."; }
    };
    image.src = trigger.dataset.detailImageSrc;
    if (image.complete) {
      if (image.naturalWidth > 0) image.onload?.();
      else image.onerror?.();
    }
    $("[data-detail-modal-caption]", dialog).textContent = label;
    $("[data-detail-image-counter]", dialog).textContent = `${detailImagePosition + 1} / ${triggers.length}`;
    dialog.setAttribute("aria-label", `Image viewer, ${detailImagePosition + 1} of ${triggers.length}`);
    $("[data-detail-image-prev]", dialog).hidden = triggers.length < 2;
    $("[data-detail-image-next]", dialog).hidden = triggers.length < 2;
    const hint = $("[data-detail-image-hint]", dialog);
    if (hint) hint.hidden = triggers.length < 2;
    if (!wasOpen) {
      showPopup(dialog);
      $("[data-detail-image-close]", dialog)?.focus({ preventScroll: true });
    }
  }
  function closeDetailImage() {
    const dialog = $("#detail-image-modal");
    if (!dialog) return;
    const opener = detailImageOpener;
    detailImageOpener = null;
    dialog.classList.remove("is-rotated"); dialog.dataset.rotate = "";
    closePopup(dialog);
    requestAnimationFrame(() => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  }
  function currentDetailImage() {
    const trigger = $$("#page-content [data-detail-image-src]")[detailImagePosition];
    const src = trigger?.dataset.detailImageSrc;
    if (!src) { toast("Image is unavailable."); return null; }
    const label = trigger.dataset.detailImageLabel || "SavePoint image";
    const baseName = label.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "savepoint-image";
    return { src, label, baseName };
  }
  async function detailImageBlob(src) {
    const response = await fetch(src);
    if (!response.ok) throw new Error("Could not read this image.");
    return response.blob();
  }
  function detailImageFilename(baseName, blob) {
    const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" })[blob.type] || "jpg";
    return `${baseName}.${ext}`;
  }
  async function downloadDetailImage() {
    const image = currentDetailImage();
    if (!image) return;
    const nativeShare = window.Capacitor?.Plugins?.ShareIntent;
    if (nativeShare?.downloadImage) {
      try {
        const result = await nativeShare.downloadImage({ src: image.src, filename: image.baseName, title: image.label });
        const location = result?.location || "image to Downloads";
        toast(result?.notification ? `Saved ${location}. Download complete notification sent.` : `Saved ${location}. Turn on notifications for download alerts.`);
      }
      catch (error) { toast(error?.message || "Could not save the image."); }
      return;
    }
    try {
      const blob = await detailImageBlob(image.src);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = detailImageFilename(image.baseName, blob); anchor.style.display = "none";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast("Image downloaded.");
    } catch (_) {
      const anchor = document.createElement("a");
      anchor.href = image.src; anchor.download = `${image.baseName}.jpg`; anchor.target = "_blank"; anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      toast("Opened the image so you can save it.");
    }
  }
  async function copyDetailImage() {
    const image = currentDetailImage();
    if (!image) return;
    const nativeShare = window.Capacitor?.Plugins?.ShareIntent;
    if (nativeShare?.copyImage) {
      try { await nativeShare.copyImage({ src: image.src, filename: image.baseName, title: image.label }); toast("Image copied to clipboard."); }
      catch (error) { toast(error?.message || "Could not copy the image."); }
      return;
    }
    try {
      const blob = await detailImageBlob(image.src);
      if (navigator.clipboard?.write && window.ClipboardItem && /^image\/(png|jpeg|webp)$/.test(blob.type)) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        toast("Image copied."); return;
      }
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(image.src);
      toast("Image link copied.");
    } catch (_) {
      try { await navigator.clipboard.writeText(image.src); toast("Image link copied."); }
      catch (_) { toast("Could not copy this image on this device."); }
    }
  }
  async function shareDetailImage() {
    const image = currentDetailImage();
    if (!image) return;
    const nativeShare = window.Capacitor?.Plugins?.ShareIntent;
    if (nativeShare?.shareImage) {
      try { await nativeShare.shareImage({ src: image.src, filename: image.baseName, title: image.label }); }
      catch (error) { toast(error?.message || "Could not open Android sharing."); }
      return;
    }
    try {
      const blob = await detailImageBlob(image.src);
      const file = new File([blob], detailImageFilename(image.baseName, blob), { type: blob.type || "image/jpeg" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: image.label }); return;
      }
      if (navigator.share) { await navigator.share({ title: image.label, text: image.label, url: image.src }); return; }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(image.src); toast("Sharing isn’t available here; image link copied."); return; }
      toast("Sharing isn’t available on this device.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      try {
        if (navigator.share) { await navigator.share({ title: image.label, text: image.label, url: image.src }); return; }
        if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(image.src); toast("Image link copied."); return; }
      } catch (fallbackError) { if (fallbackError?.name === "AbortError") return; }
      toast("Could not share this image.");
    }
  }


  function setPreference(key, value) {
    if (key === "currencyRate") {
      const code = window.SplitAppCurrency?.target(prefs) || "USD", rate = Number(value);
      if (code !== "USD" && rate > 0) { prefs.currencyRates = { ...(prefs.currencyRates || {}), [code]: rate }; if (code === "INR") prefs.usdToInrRate = rate; }
      persist({ meta: true }); render();
      return;
    }
    const ratingChange = key === "ratingFormat" && value !== prefs.ratingFormat ? convertRatingScale(prefs.ratingFormat === "10-point" ? 10 : 5, value === "10-point" ? 10 : 5) : null;
    prefs[key] = value;
    if (ratingChange?.length) persist({ ids: ratingChange });
    if (key === "bottomBarBackground" && value === "solid") prefs.bottomBarTransparency = 100;
    persist({ meta: true }); applyPreferences();
    if (key === "backgroundBackups" || key === "backupSchedule") syncBackupSchedule();
    if (key === "ratingFormat") updateRatingOptions();
    if (key === "dashboardStatusFilter") {
      dashboardStatusFilter = value || "all";
      if (prefs.dashboardDefaultCategory === "remember") prefs.dashboardLastStatus = dashboardStatusFilter;
    }
    if (key === "dashboardDefaultCategory") {
      dashboardStatusFilter = value === "remember" ? prefs.dashboardLastStatus || "all" : value || "all";
      prefs.dashboardStatusFilter = dashboardStatusFilter;
      persist({ meta: true });
    }
    if (key === "dashboardDefaultPlatform") {
      dashboardPlatformFilter = value || "all";
      prefs.dashboardPlatformFilter = dashboardPlatformFilter;
      persist({ meta: true });
    }
    if (["dashboardGroupBy", "dashboardSort", "showRatings", "showProgress", "showThumbnails", "dashboardDensity", "dashboardView", "dashboardStatusFilter", "dashboardDefaultCategory", "dashboardDefaultPlatform", "dashboardRowActions", "cardCorners", "oneHandedMode", "tabletTwoColumn", "theme", "ratingFormat", "humanReadableStats", "currencyDisplay", "usdToInrRate"].includes(key)) render();
  }
  function openSettingPicker(trigger) {
    let options = [];
    try { options = JSON.parse(trigger.dataset.pickerOptions || "[]").map(entry => { const [value, ...label] = entry.split("|"); return { value, label: label.join("|") }; }); } catch (_) { return; }
    const key = trigger.dataset.settingPicker;
    const kind = trigger.dataset.pickerKind;
    const dialog = $("#setting-picker-dialog");
    const list = $("[data-setting-picker-list]", dialog);
    const title = $("[data-setting-picker-title]", dialog);
    if (!dialog || !list || !title) return;
    title.textContent = trigger.getAttribute("aria-label")?.split(":")[0] || "Choose an option";
    const themeInfo = {
      light:["Clean white surfaces with indigo accents.","#f8fafc","#4f46e5","#0f172a"], dark:["Neutral charcoal surfaces with violet accents.","#111111","#8b5cf6","#f5f5f7"], grey:["Soft graphite surfaces with slate accents.","#111827","#64748b","#f9fafb"], amoled:["Pure black surfaces with raised charcoal cards.","#000000","#a78bfa","#f8fafc"], flashbang:["Bright white surfaces and bold charcoal details.","#f8fafc","#111827","#0f172a"], "material-you":["Layered charcoal surfaces with purple accents.","#10131d","#8b5cf6","#f8fafc"], ocean:["Midnight blue surfaces with clear aqua accents.","#081b2b","#38bdf8","#e0f2fe"], forest:["Deep evergreen surfaces with fresh mint accents.","#10221b","#4ade80","#ecfdf5"], sunset:["Warm espresso surfaces with golden orange accents.","#261714","#fb923c","#fff7ed"], rose:["Dark plum surfaces with soft rose accents.","#251722","#fb7185","#fff1f2"], lavender:["Smoky violet surfaces with lilac accents.","#211d35","#c4b5fd","#f5f3ff"], nord:["Cool blue-grey surfaces with icy blue accents.","#242d3b","#88c0d0","#eceff4"], sand:["Warm paper surfaces with terracotta accents.","#faf4e8","#c2410c","#29231d"], mint:["Pale green surfaces with deep teal accents.","#effaf5","#0f766e","#12352d"], system:["Match your device appearance setting.","#e2e8f0","#6366f1","#0f172a"]
    };
    const fontInfo = { system:"Uses the font built into your device.", inter:"Clean, neutral, and easy to scan.", outfit:"Rounded geometric lettering with a friendly feel.", serif:"Traditional letterforms with a bookish feel.", monospace:"Even-width characters with a technical feel.", rounded:"Soft, friendly rounded letterforms.", poppins:"Geometric sans serif with a warm feel.", roboto:"Compact, familiar Android-style lettering.", nunito:"Soft shapes with highly readable text.", lato:"Open, balanced letterforms for longer reading.", merriweather:"Serif lettering tuned for comfortable reading.", "jetbrains-mono":"Clear monospaced lettering for detail.", "open-sans":"Open, friendly lettering for everyday reading.", montserrat:"Bold geometric lettering with a modern feel.", oswald:"Tall, condensed lettering for strong headings.", raleway:"Elegant, light geometric lettering.", ubuntu:"Warm, humanist lettering with a distinct character.", "playfair-display":"High-contrast serif lettering for a refined feel.", "fira-sans":"Readable humanist lettering designed for screens.", rubik:"Rounded, clean lettering with a modern shape.", quicksand:"Rounded, light lettering with a relaxed feel.", caveat:"Casual handwritten lettering with a personal feel." };
    const settingPreviewIcons = {
      textSize: { small: "type", normal: "text", large: "text-cursor-input" },
      animationSpeed: { off: "pause", fast: "zap", normal: "gauge", slow: "turtle", custom: "sliders-horizontal" },
      animationEasing: { smooth: "spline", spring: "activity", bouncy: "repeat", linear: "move-right" },
      pageTransition: { slide: "move-right", fade: "cloud", zoom: "maximize-2", rise: "move-up", flip: "flip-horizontal", none: "ban" },
      cardEntrance: { rise: "arrow-up-from-line", fade: "cloud", pop: "sparkles", slide: "move-right", none: "ban" },
      sheetAnimation: { slide: "panel-bottom", pop: "maximize-2", fade: "cloud" },
      pressEffect: { shrink: "pointer", soft: "hand", none: "pointer-off" },
      bottomBarBackground: { solid: "square", glass: "panels-top-left", transparent: "panels-top-bottom" },
      bottomBarStyle: { box: "square", "icon-color": "palette", underline: "underline" },
      bottomBarCorners: { round: "panels-top-left", sharp: "square" },
      bottomBarLabels: { "icons-labels": "list", "icons-only": "layout-grid" },
      bottomBarLayout: { spread: "align-horizontal-space-between", center: "align-horizontal-justify-center", left: "align-horizontal-justify-start" },
      dashboardView: { list: "list", "detailed-grid": "layout-dashboard", "compact-grid": "grid-3x3", "large-grid": "square" },
      dashboardDefaultPlatform: { all: "layers-3", pc: "monitor", mac: "laptop", mobile: "smartphone", xbox: "tv", playstation: "gamepad-2", nintendo: "joystick" },
      dashboardDefaultCategory: { remember: "history", all: "layers", Playing: "gamepad-2", Completed: "circle-check", Backlog: "bookmark", Upcoming: "calendar-clock", "On Hold": "pause-circle", Dropped: "circle-minus" },
      defaultStatus: { Backlog: "bookmark", Upcoming: "calendar-clock", Playing: "play", "On Hold": "pause", Dropped: "circle-x", Completed: "circle-check" },
      dateFormat: { auto: "globe", dmy: "calendar", mdy: "calendar", iso: "calendar-days", long: "calendar-check" },
      iconStyle: { tiles: "layout-grid", inline: "list" },
      imageStorage: { all: "images", posters: "image", online: "cloud-off" },
      cardCorners: { rounded: "circle", soft: "squircle", square: "square" },
      dashboardDensity: { comfortable: "rows-3", compact: "rows-2" },
      dashboardGroupBy: { none: "list", status: "circle-check", category: "folders", release: "calendar-days" },
      dashboardSort: { "updated-desc": "clock-3", "created-desc": "calendar-plus", "progress-desc": "trending-up", "progress-asc": "trending-down", "rating-desc": "star", "release-desc": "calendar-days", "alphabetical-asc": "arrow-down-a-z", "alphabetical-desc": "arrow-up-z-a" },
      ratingFormat: { "5-stars": "star", "10-point": "chart-no-axes-column-increasing" },
      automaticCompletion: { automatic: "refresh-cw", ask: "message-circle-question", manual: "hand" },
      defaultStatus: { Backlog: "archive", Upcoming: "calendar-clock", Playing: "gamepad-2", "On Hold": "circle-pause", Dropped: "circle-x", Completed: "circle-check" },
      progressIncrement: { 1: "signal-low", 5: "signal-medium", 10: "signal-high" },
      backupSchedule: { never: "calendar-x", daily: "calendar-days" },
      backupRetention: { 3: "archive", 5: "archive-restore", 10: "boxes", 20: "warehouse" },
      folderSyncDelay: { 0: "zap", 30: "timer", 60: "alarm-clock", 300: "hourglass" },
      maximumBackupSize: { 250: "hard-drive-download", 1000: "hard-drive", 5000: "server", 0: "infinity" },
      metadataMode: { online: "globe", offline: "wifi-off" },
      metadataRefreshInterval: { daily: "calendar-check", weekly: "calendar-range", monthly: "calendar-days", never: "calendar-x" },
      metadataRetryLimit: { 1: "rotate-cw", 3: "repeat", 5: "refresh-ccw-dot" },
      offlineFallback: { cached: "database", none: "ban" },
      metadataSyncFrequency: { immediate: "zap", hourly: "clock-3", daily: "calendar-days", manual: "hand" },
      metadataWorkers: { 1: "cpu", 2: "server", 5: "workflow", 10: "network" },
      thumbnailCleanup: { never: "image", daily: "calendar-check", weekly: "calendar-range" },
      thumbnailSize: { small: "image", medium: "images", large: "gallery-horizontal" },
      thumbnailQuality: { low: "battery-low", balanced: "circle-gauge", high: "scan-eye" },
      imageCacheMaxEntries: { 100: "image", 250: "images", 500: "gallery-horizontal", 1000: "album", 0: "infinity" },
      storageWarningLimitMb: { 250: "triangle-alert", 500: "badge-alert", 1000: "siren", 2000: "octagon-alert" },
      backupStorageLimitMb: { 500: "archive", 1000: "archive-restore", 5000: "warehouse", 0: "infinity" },
    };
    list.replaceChildren();
    options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `setting-picker-option${String(prefs[key]) === option.value ? " active" : ""}`;
      button.setAttribute("aria-pressed", String(String(prefs[key]) === option.value));
      const radio = document.createElement("span"); radio.className = "setting-picker-radio"; radio.setAttribute("aria-hidden", "true");
      let preview;
      let description = "";
      if (kind === "theme") {
        const palette = themeInfo[option.value] || themeInfo.dark;
        preview = document.createElement("span"); preview.className = "setting-theme-preview";
        preview.style.setProperty("--preview-bg", palette[1]); preview.style.setProperty("--preview-accent", palette[2]); preview.style.setProperty("--preview-text", palette[3]);
        preview.innerHTML = '<i></i><span><b></b><b></b></span>';
        description = palette[0];
      } else if (kind === "font") {
        preview = document.createElement("span"); preview.className = "setting-font-preview"; preview.textContent = "Aa";
        preview.style.fontFamily = fontFamilies[option.value] || fontFamilies.inter;
        button.style.fontFamily = fontFamilies[option.value] || fontFamilies.inter;
        description = fontInfo[option.value] || "Preview this typeface throughout the app.";
      } else if (kind === "palette") {
        preview = document.createElement("span"); preview.className = "setting-color-preview"; preview.style.setProperty("--choice-color", option.value);
        description = `Use ${option.label.toLowerCase()} for buttons and highlights.`;
      } else if (key === "bottomBarStyle") {
        preview = document.createElement("span"); preview.className = `setting-nav-style-preview setting-nav-style-${option.value}`;
        preview.innerHTML = `<i data-lucide="${settingPreviewIcons.bottomBarStyle[option.value]}"></i>`;
        description = option.value === "box" ? "Highlight the selected destination with a soft tile." : option.value === "icon-color" ? "Color the selected icon without a tile." : "Underline the selected destination.";
      } else {
        preview = document.createElement("span"); preview.className = "setting-option-preview";
        const icon = settingPreviewIcons[key]?.[option.value];
        if (key === "currencyDisplay") { preview.classList.add("setting-currency-preview"); preview.textContent = window.SplitAppCurrency?.symbol(option.value) || option.value; }
        else if (icon) preview.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i>`;
        else preview.textContent = "•";
      }
      const copy = document.createElement("span"); copy.className = "setting-picker-copy";
      const name = document.createElement("strong"); name.textContent = option.label;
      copy.appendChild(name);
      if (description) { const detail = document.createElement("small"); detail.textContent = description; copy.appendChild(detail); }
      button.append(radio, preview, copy);
      button.addEventListener("click", () => { setPreference(key, option.value); render(); closePopup(dialog); });
      list.appendChild(button);
    });
    if (kind === "palette") {
      const custom = document.createElement("label"); custom.className = "setting-custom-color"; custom.innerHTML = `<span><strong>Custom color</strong><small>Choose any accent color.</small></span><input type="color" data-custom-picker value="${esc(prefs[key] || "#6355f8")}" aria-label="Choose a custom accent color">`;
      list.appendChild(custom);
    }
    window.lucide?.createIcons({ root: list, attrs: { "aria-hidden": "true" } });
    showPopup(dialog);
  }
  function openCategoryColorsPicker() {
    const dialog = $("#setting-picker-dialog");
    const list = dialog ? $("[data-setting-picker-list]", dialog) : null;
    const title = $("[data-setting-picker-title]", dialog);
    if (!dialog || !list || !title) return;
    title.textContent = "Category colors";
    const draft = { ...prefs.categoryColors };
    list.replaceChildren();
    const note = document.createElement("p"); note.className = "setting-picker-note"; note.textContent = "Choose an accent color for each library category."; list.appendChild(note);
    config.categories.forEach(category => {
      const row = document.createElement("label"); row.className = "category-color-option";
      const copy = document.createElement("span"); copy.className = "category-color-copy";
      const icon = document.createElement("span"); icon.className = "category-color-icon"; icon.textContent = category.icon || "◦";
      const name = document.createElement("strong"); name.textContent = category.label; copy.append(icon, name);
      const color = document.createElement("input"); color.type = "color"; color.value = draft[category.key] || category.color || prefs.mainColor; color.setAttribute("aria-label", `${category.label} accent color`);
      color.addEventListener("input", () => { draft[category.key] = color.value; });
      row.append(copy, color); list.appendChild(row);
    });
    const save = document.createElement("button"); save.type = "button"; save.className = "setting-picker-save"; save.textContent = "Save colors";
    save.addEventListener("click", () => { prefs.categoryColors = draft; persist({ meta: true }); render(); closePopup(dialog); toast("Category colors updated."); });
    list.appendChild(save);
    showPopup(dialog);
  }
  // Native: stream the library in small chunks to a file the user picks with Android's "Save as" screen
  // (silent: straight into the backup folder, used before destructive actions). Browsers get a normal download.
  let exportRunning = false;
  const REVIEW_FIELDS = ["review", "reviews", "notes"];
  let exportOptions = { format: "json", ratings: prefs.backupIncludeRatings !== false, reviews: prefs.backupIncludeRatings !== false };
  // Manual exports honour the Export page options; automatic safety backups (silent) always keep everything.
  function exportableItems(silent, opts = exportOptions) {
    if (silent || (opts.ratings && opts.reviews)) return items;
    return items.map(item => { const copy = { ...item }; if (!opts.ratings) { delete copy.rating; delete copy.ratingExact; } if (!opts.reviews) REVIEW_FIELDS.forEach(field => delete copy[field]); return copy; });
  }
  const csvCell = value => { const text = String(value ?? ""); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; };
  async function exportNames(format, opts = exportOptions) {
    if (!items.length) { toast("Your library is empty."); return; }
    const sorted = [...items].sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { sensitivity: "base" }));
    const csv = format === "csv", max = prefs.ratingFormat === "10-point" ? 10 : 5;
    const reviewOf = item => String(item.review ?? item.reviews ?? item.notes ?? "").replace(/\s+/g, " ").trim();
    const content = csv
      ? ["Title", "Year", "Status", ...(opts.ratings ? ["Rating"] : []), ...(opts.reviews ? ["Review"] : [])].join(",") + "\r\n" + sorted.map(item => [item.title, String(item.year || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "", item.status, ...(opts.ratings ? [Number(item.rating) || ""] : []), ...(opts.reviews ? [reviewOf(item)] : [])].map(csvCell).join(",")).join("\r\n") + "\r\n"
      : sorted.map(item => { const line = String(item.title).replace(/[\r\n]+/g, " ").trim(); const extras = [opts.ratings && Number(item.rating) ? `${item.rating}/${max}` : "", opts.reviews ? reviewOf(item) : ""].filter(Boolean); return extras.length ? `${line} — ${extras.join(" — ")}` : line; }).join("\n") + "\n";
    const fileName = `${config.key}-names-${new Date().toISOString().slice(0, 10)}.${csv ? "csv" : "txt"}`, mimeType = csv ? "text/csv" : "text/plain";
    try {
      if (nativeAndroid && window.SplitAppBackend?.exportTextFile) {
        toast("Choose where to save your list…");
        await window.SplitAppBackend.exportTextFile({ fileName, mimeType, content });
      } else {
        const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` })); link.download = fileName; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      toast(`Exported ${items.length} names.`);
    } catch (error) {
      const message = String(error?.message || error);
      if (!/cancel/i.test(message)) { toast(`Export failed: ${message}`); recordLog("error", `Names export failed: ${message}`); }
    }
  }
  function runExport() { return exportOptions.format === "json" ? exportList() : exportNames(exportOptions.format); }
  async function exportList({ silent = false } = {}) {
    if (exportRunning) { toast("An export is already running."); return; }
    const backend = window.SplitAppBackend;
    const exportItems = exportableItems(silent);
    if (nativeAndroid && backend?.exportLibrary) {
      exportRunning = true;
      let lastToast = 0;
      try {
        if (!silent) toast("Choose where to save your library…");
        const result = await backend.exportLibrary({ items: exportItems, history, preferences: prefs }, { mode: silent ? "folder" : "ask", onProgress: (done, total) => {
          if (Date.now() - lastToast > 700 && done < total) { lastToast = Date.now(); toast(`Exporting… ${Math.round(done / total * 100)}%`); }
        } });
        toast(silent ? `Backup saved: ${result.fileName}` : `Exported ${items.length} games${!exportOptions.ratings || !exportOptions.reviews ? " with your export options" : ""}.`);
      } catch (error) {
        const message = String(error?.message || error);
        if (!/cancel/i.test(message)) { toast(`Export failed: ${message}`); recordLog("error", `Export failed: ${message}`); }
      } finally { exportRunning = false; }
      return;
    }
    const fileName = `${config.key}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const parts = [`{"app":${JSON.stringify(config.name)},"version":1,"exportedAt":${JSON.stringify(new Date().toISOString())},"items":[`];
    exportItems.forEach((item, index) => parts.push((index ? "," : "") + JSON.stringify(item)));
    parts.push(`],"history":${JSON.stringify(history)},"preferences":${JSON.stringify(prefs)}}`);
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(parts, { type: "application/json" })); link.download = fileName; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); toast("Export ready.");
  }
  function importIdentity(item) {
    const title = String(item?.title || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const year = String(item?.year || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "";
    return `${item?.category || "game"}:${title}:${year}`;
  }
  // .txt: one game per line. .csv: first column (or a "Title"/"Name" column) is the title; "Year" and "Status" are optional.
  function parseNamesList(text, isCsv) {
    const statuses = config.categories[0].statuses || [];
    const rows = [];
    if (isCsv) {
      let row = [], cell = "", quoted = false;
      const body = String(text).replace(/^\uFEFF/, "");
      for (let index = 0; index < body.length; index++) {
        const char = body[index];
        if (quoted) { if (char === '"') { if (body[index + 1] === '"') { cell += '"'; index++; } else quoted = false; } else cell += char; }
        else if (char === '"') quoted = true;
        else if (char === ",") { row.push(cell); cell = ""; }
        else if (char === "\n" || char === "\r") { if (char === "\r" && body[index + 1] === "\n") index++; row.push(cell); cell = ""; if (row.some(value => value.trim())) rows.push(row); row = []; }
        else cell += char;
      }
      row.push(cell); if (row.some(value => value.trim())) rows.push(row);
    } else String(text).split(/\r?\n/).forEach(line => { if (line.trim()) rows.push([line]); });
    let titleAt = 0, yearAt = -1, statusAt = -1, ratingAt = -1, start = 0;
    const header = (rows[0] || []).map(value => value.trim().toLowerCase());
    if (isCsv && header.some(value => ["title", "name", "game"].includes(value))) {
      titleAt = Math.max(0, header.findIndex(value => ["title", "name", "game"].includes(value)));
      yearAt = header.indexOf("year"); statusAt = header.indexOf("status"); ratingAt = header.indexOf("rating"); start = 1;
    }
    return { items: rows.slice(start).map(row => {
      const status = statuses.find(name => name.toLowerCase() === String(row[statusAt] || "").trim().toLowerCase());
      return { title: String(row[titleAt] || "").trim(), ...(yearAt >= 0 && row[yearAt] ? { year: String(row[yearAt]).trim() } : {}), ...(status ? { status } : {}), ...(ratingAt >= 0 && Number(row[ratingAt]) > 0 ? { rating: Number(row[ratingAt]) } : {}) };
    }).filter(item => item.title) };
  }
  // A restored game keeps what it was saved with; only a game with no saved details gets fetched again.
  const hasSavedMetadata = item => Boolean(item?.cachedDetails || item?.facts?.fetchedAt || item?.mixSources?.length);
  // Games already in the library keep their data, but blanks (rating, favourite, progress, sources…) are filled from the backup.
  const RESTORE_FILL_FIELDS = ["rating", "ratingExact", "favorite", "progress", "goal", "completionTarget", "completionTargetHours", "metadataSource", "providerId", "originKeys", "originYear", "mixSources", "mixSourceKeys", "facts", "cachedDetails", "url", "description", "image", "backdrop", "year"];
  function restorePatch(existing, backup) {
    const patch = {};
    const empty = value => value == null || value === "" || value === 0 || value === false || (Array.isArray(value) && !value.length) || (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length);
    for (const field of RESTORE_FILL_FIELDS) if (empty(existing[field]) && !empty(backup[field])) patch[field] = backup[field];
    return Object.keys(patch).length ? patch : null;
  }
  async function importList(file) {
    if (!file) return;
    importState = { phase: "reading", fileName: file.name || "Library backup", fileSize: Number(file.size) || 0, incoming: [], fresh: [], skipped: 0, completed: 0, synced: 0, failed: 0, error: "" };
    goto("import-preview");
    try {
      const text = await file.text();
      const asList = /\.(txt|csv)$/i.test(file.name || "") || !/^\s*[\[{]/.test(text);
      const data = asList ? parseNamesList(text, /\.csv$/i.test(file.name || "")) : JSON.parse(text); const incoming = Array.isArray(data) ? data : data.items;
      if (!Array.isArray(incoming)) throw new Error("No item list found in this file.");
      const now = Date.now();
      const idMap = new Map();
      const stamp = value => { const n = Number(value) || Date.parse(value) || 0; return n > 0 && n <= now ? n : now; };
      const normalized = incoming.filter(item => item && String(item.title || "").trim()).map(item => {
        const id = crypto.randomUUID();
        if (item.id != null) idMap.set(String(item.id), id);
        // Keep the backup's own dates so Timeline and Activity show when things really happened.
        const catKey = config.categories.some(cat => cat.key === item.category) ? item.category : config.categories[0].key;
        return { ...item, id, category: catKey, status: item.status || prefs.defaultStatus || defaultStatus(catKey), createdAt: stamp(item.createdAt), updatedAt: stamp(item.updatedAt) };
      });
      const known = new Set(items.map(importIdentity));
      const seen = new Set();
      const fresh = normalized.filter(item => {
        const identity = importIdentity(item);
        if (known.has(identity) || seen.has(identity)) return false;
        seen.add(identity);
        return true;
      });
      // Near-duplicates (edition names, one side missing a year) are held back for the user to confirm.
      const split = splitSimilarImports(fresh);
      fresh.length = 0; fresh.push(...split.kept);
      const freshIdentity = new Set(fresh.map(item => item.id));
      const byIdentity = new Map(items.map(item => [importIdentity(item), item]));
      const patches = [];
      normalized.forEach(item => { const existing = byIdentity.get(importIdentity(item)); const patch = existing && !freshIdentity.has(item.id) ? restorePatch(existing, item) : null; if (patch) patches.push({ id: existing.id, patch }); });
      // Timeline/Activity read from history: use the backup's history (re-pointed at the new ids), or build it from statuses.
      const freshIds = new Set(fresh.map(item => item.id));
      const fileHistory = Array.isArray(data.history) ? data.history : [];
      let importedHistory = fileHistory.filter(entry => entry && idMap.has(String(entry.itemId)) && freshIds.has(idMap.get(String(entry.itemId)))).map(entry => ({ ...entry, itemId: idMap.get(String(entry.itemId)) }));
      if (!importedHistory.length) importedHistory = fresh.filter(item => ["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(item.status)).map(item => ({ itemId: item.id, title: item.title, action: item.status, status: item.status, at: item.updatedAt }));
      importState = { ...importState, phase: "preview", incoming: normalized, fresh, similar: split.similar, patches, importedHistory, skipped: normalized.length - fresh.length - split.similar.length };
      render();
      if (prefs.restorePreview === false && fresh.length) continueImport().catch(error => { if (importState) { importState.phase = "restore-error"; importState.error = error.message || "Could not finish the restore."; render(); } });
    } catch (error) {
      importState = { ...importState, phase: "error", error: error.message || "Could not import this file." };
      render();
    }
  }
  function updateImportProgress(message = "") {
    if (!importState) return;
    const counter = $("#import-progress-count"), label = $("#import-progress-label"), bar = $("#import-progress-bar"), synced = $("#import-progress-synced");
    const total = importState.total || 0, completed = importState.completed || 0;
    const percent = total ? Math.min(100, Math.round(completed / total * 100)) : importState.phase === "complete" ? 100 : 0;
    if (counter) counter.textContent = `${Math.min(completed, total)} / ${total}`;
    const percentLabel = $("#import-progress-percent"); if (percentLabel) percentLabel.textContent = `${percent}%`;
    if (label) label.textContent = message || `Checking ${importState.currentTitle || "next game"}…`;
    if (synced) synced.textContent = `${importState.synced || 0} updated · ${importState.failed || 0} unavailable`;
    if (bar) bar.style.width = `${total ? Math.min(100, completed / total * 100) : importState.phase === "complete" ? 100 : 0}%`;
    const progress = $(".import-progress-track");
    if (progress) {
      progress.setAttribute("aria-valuemax", String(total));
      progress.setAttribute("aria-valuenow", String(Math.min(completed, total)));
      progress.setAttribute("aria-valuetext", `${percent}%`);
    }
  }
  async function continueImport() {
    if (!importState || importState.phase !== "preview") return;
    const keptSimilar = (importState.similar || []).filter(row => row.keep).map(row => row.item);
    const fresh = [...importState.fresh, ...keptSimilar];
    backupBeforeBulk();
    importState = { ...importState, phase: "saving", total: fresh.length, completed: 0, synced: 0, failed: 0, currentTitle: "" };
    render();
    await new Promise(resolve => requestAnimationFrame(resolve));
    items = [...fresh, ...items];
    history = [...(importState.importedHistory || []), ...history].sort((a, b) => (Number(b.at) || Date.parse(b.at) || 0) - (Number(a.at) || Date.parse(a.at) || 0));
    const patchedIds = [];
    for (const { id, patch } of importState.patches || []) { const existing = itemById(id); if (existing) { Object.assign(existing, patch, { updatedAt: Date.now() }); patchedIds.push(id); } }
    await persist({ ids: [...fresh.map(item => item.id), ...patchedIds] });
    const count = fresh.length;
    importState = { ...importState, phase: "complete", completed: count, total: count };
    render();
    await new Promise(resolve => setTimeout(resolve, 600));
    importState = null;
    goto("dashboard");
    const started = startSyncJob(fresh.filter(item => !hasSavedMetadata(item)));
    const undoImport = () => {
      const ids = new Set(fresh.map(item => String(item.id)));
      items = items.filter(item => !ids.has(String(item.id))); history = history.filter(entry => !ids.has(String(entry.itemId)));
      if (syncJob) { syncJob.queue = syncJob.queue.filter(item => !ids.has(String(item.id))); syncJob.entries = syncJob.entries.filter(entry => !ids.has(String(entry.id))); }
      persist({ removed: [...ids] }); render(); toast("Import undone.");
    };
    if (count) toastUndo(started ? `Added ${count} ${count === 1 ? "game" : "games"}. Syncing in the background.` : `Added ${count} ${count === 1 ? "game" : "games"}.`, undoImport, 10000);
    else toast("Nothing was added.");
  }
  // ---- Background metadata sync -------------------------------------------
  let syncJob = null, syncHideTimer = 0, syncPersistCount = 0;
  const syncNotifier = () => window.Capacitor?.Plugins?.SyncNotification;
  function syncCounts() {
    const e = syncJob?.entries || [];
    const done = e.filter(x => x.status === "done").length, failed = e.filter(x => x.status === "failed").length;
    const total = e.length, completed = done + failed;
    return { total, done, failed, completed, syncing: e.filter(x => x.status === "syncing").length, percent: total ? Math.round(completed / total * 100) : 0 };
  }
  function startSyncJob(list) {
    const sources = window.SplitAppSources?.available("game", prefs) || [];
    const canSync = prefs.metadataMode !== "offline" && navigator.onLine && sources.length > 0 && Boolean(window.SplitAppMix?.load);
    const games = list.filter(item => item.category === "game");
    if (!canSync || !games.length) return false;
    if (syncJob && !syncJob.finished) {
      syncJob.entries.push(...games.map(i => ({ id: i.id, title: i.title, status: "queued", error: "" })));
      syncJob.queue.push(...games);
      return true;
    }
    clearTimeout(syncHideTimer);
    syncJob = { finished: false, paused: false, waiters: [], dirty: [], queue: [...games], entries: games.map(i => ({ id: i.id, title: i.title, status: "queued", error: "" })) };
    syncPersistCount = 0;
    syncNotifier()?.requestPermission?.().catch(() => {});
    if (!syncActionListener && syncNotifier()?.addListener) {
      // Notification "Pause"/"Resume" button.
      syncActionListener = syncNotifier().addListener("action", event => setSyncPaused(event?.action === "pause"));
    }
    updateSyncUI();
    runSyncJob(syncJob);
    return true;
  }
  // How many lookups may run at once. Scales with cores and memory, backs off on slow or
  // metered networks and when the tab is hidden, and never exceeds the user's setting.
  function syncConcurrency() {
    const cores = Number(navigator.hardwareConcurrency) || 4, memory = Number(navigator.deviceMemory) || 4;
    const connection = navigator.connection || {};
    let limit = Math.round(cores / 2);
    if (memory <= 2) limit = Math.min(limit, 1); else if (memory <= 4) limit = Math.min(limit, 2);
    if (connection.saveData || /^(slow-2g|2g)$/.test(connection.effectiveType || "")) limit = 1;
    else if (connection.effectiveType === "3g") limit = Math.min(limit, 2);
    if (document.hidden) limit = Math.min(limit, 2);
    return Math.max(1, Math.min(limit, Number(prefs.metadataWorkers) || 5, 8));
  }
  // Background work waits for an idle moment and for pending taps/scrolls, so it never
  // competes with what the user is doing.
  function yieldToUser() {
    return new Promise(resolve => {
      const go = () => {
        if (navigator.scheduling?.isInputPending?.()) { setTimeout(go, 40); return; }
        if (window.scheduler?.postTask) window.scheduler.postTask(resolve, { priority: "background" }).catch(resolve);
        else if (window.requestIdleCallback) window.requestIdleCallback(() => resolve(), { timeout: 1500 });
        else setTimeout(resolve, 0);
      };
      go();
    });
  }
  async function runSyncJob(job) {
    // Extra workers are parked while the adaptive limit is lower than their number.
    const workers = Array.from({ length: 8 }, async (_, index) => {
      while (true) {
        // A worker is parked only while the allowed slots are busy. Parking by index alone deadlocked: games added
        // moments after the active workers finished were left "Waiting" because only parked workers were still alive.
        const slotsFull = () => job.entries.filter(x => x.status === "syncing").length >= syncConcurrency();
        while (job.paused || (index >= syncConcurrency() && slotsFull())) {
          if (!job.queue.length && !job.entries.some(x => x.status === "syncing")) return;
          if (job.paused) await new Promise(resolve => job.waiters.push(resolve));
          else await new Promise(resolve => setTimeout(resolve, 1500));
          if (index > 0 && !job.queue.length) return;
        }
        if (!job.queue.length) break;
        await yieldToUser();
        if (!job.queue.length || job.paused) continue;
        const item = job.queue.shift();
        const entry = job.entries.find(x => x.id === item.id);
        if (!entry) continue;
        entry.status = "syncing"; updateSyncUI();
        try {
          const current = itemById(item.id) || item;
          const loaded = await enrichLibraryEntryWithMix(current, { ...current, source: current.metadataSource }, "Background sync", { persist: false, loadImages: false, quiet: true, background: true });
          entry.status = loaded ? "done" : "failed";
          if (!loaded) entry.error = "No metadata found";
        } catch (error) { entry.status = "failed"; entry.error = error?.message || "Request failed"; }
        mixEnrichmentByItem.delete(String(item.id));
        // Paused with nothing left to fetch: finish instead of waiting for a resume.
        if (job.paused && !job.queue.length && !job.entries.some(x => x.status === "syncing" || x.status === "queued")) { job.paused = false; const waiters = job.waiters; job.waiters = []; waiters.forEach(resolve => resolve()); }
        job.dirty.push(item.id);
        if (++syncPersistCount % 10 === 0) persist({ ids: job.dirty.splice(0) });
        updateSyncUI();
      }
    });
    await Promise.all(workers);
    job.finished = true;
    await persist({ ids: job.dirty.splice(0) });
    updateSyncUI();
    const c = syncCounts();
    toast(c.failed ? `Sync finished · ${c.done} updated, ${c.failed} failed.` : `Metadata sync finished · ${c.done} updated.`);
    // A finished sync stops floating over the app after a while (failures stay listed on the Sync page).
    setTimeout(() => { if (syncJob === job) { job.fabHidden = true; updateSyncUI(); } }, 12000);
    if (!c.failed) syncHideTimer = setTimeout(() => { if (syncJob === job) { syncJob = null; updateSyncUI(); if (page === "sync") render(); } }, 6000);
  }
  let syncActionListener = null;
  function setSyncPaused(paused, { quiet = false } = {}) {
    if (!syncJob || syncJob.finished || syncJob.paused === paused) return;
    syncJob.paused = paused;
    if (!paused) { const waiters = syncJob.waiters; syncJob.waiters = []; waiters.forEach(resolve => resolve()); }
    updateSyncUI();
    if (page === "sync") render();
    if (!quiet) toast(paused ? "Sync paused." : "Sync resumed.");
  }
  function retrySyncFailures() {
    if (!syncJob || !syncJob.finished) return;
    const failed = syncJob.entries.filter(x => x.status === "failed");
    const games = failed.map(x => itemById(x.id)).filter(Boolean);
    if (!games.length) return;
    failed.forEach(x => { x.status = "queued"; x.error = ""; });
    syncJob.finished = false; syncJob.queue = games; syncPersistCount = 0;
    runSyncJob(syncJob); render();
  }
  // Paint at most once per frame, and talk to the native notification at most once a second
  // (every bridge call costs a JS->Java hop), except when the state itself changes.
  let syncPaintQueued = false, lastNotify = 0, lastNotifyState = "";
  function updateSyncUI() {
    if (syncPaintQueued) return;
    syncPaintQueued = true;
    requestAnimationFrame(() => { syncPaintQueued = false; paintSyncUI(); });
  }
  function paintSyncUI() {
    let fab = $("#sync-fab");
    const c = syncCounts();
    const show = Boolean(syncJob) && !syncJob.fabHidden && page !== "sync" && page !== "add"; // never cover the add/edit form
    if (!fab && syncJob) {
      fab = document.createElement("a"); fab.id = "sync-fab"; fab.className = "sync-fab"; fab.href = "#sync";
      fab.innerHTML = '<span class="sync-fab-pie"><b></b></span>';
      document.body.appendChild(fab);
    }
    if (fab) {
      fab.hidden = !show;
      fab.style.setProperty("--p", c.percent + "%");
      fab.classList.toggle("is-done", Boolean(syncJob?.finished));
      fab.classList.toggle("is-paused", Boolean(syncJob?.paused));
      fab.classList.toggle("has-failed", c.failed > 0);
      fab.querySelector("b").textContent = syncJob?.finished && !c.failed ? "✓" : syncJob?.paused ? "❚❚" : c.percent + "%";
      fab.setAttribute("aria-label", `Metadata sync ${c.percent}% — ${c.completed} of ${c.total} done. Open details.`);
    }
    if (page === "sync") livePatchSyncPage(c);
    const n = syncNotifier();
    const stateKey = syncJob ? `${syncJob.finished}|${syncJob.paused}` : "none";
    if (n && syncJob && stateKey === lastNotifyState && Date.now() - lastNotify < 1000) return;
    lastNotifyState = stateKey; lastNotify = Date.now();
    if (n && syncJob) {
      const text = syncJob.finished ? `${c.done} updated${c.failed ? ` · ${c.failed} failed` : ""}` : `${c.completed} / ${c.total} games · ${c.percent}%${syncJob.paused ? " · paused" : ""}`;
      n.update({ title: syncJob.finished ? "Metadata sync finished" : syncJob.paused ? "Metadata sync paused" : "Syncing game metadata", text, progress: c.completed, max: c.total, done: Boolean(syncJob.finished), paused: Boolean(syncJob.paused) }).catch(() => {});
    } else if (n && !syncJob) n.cancel?.().catch(() => {});
  }
  function livePatchSyncPage(c) {
    const root = $("#sync-page"); if (!root) return;
    const set = (sel, v) => { const el = root.querySelector(sel); if (el) el.textContent = v; };
    root.style.setProperty("--p", c.percent + "%");
    set("[data-sync-percent]", c.percent + "%"); set("[data-sync-completed]", `${c.completed} / ${c.total}`);
    set("[data-sync-done]", c.done); set("[data-sync-failed]", c.failed); set("[data-sync-active]", c.total - c.completed);
    // Only the ~60 rendered rows matter. Patch changed rows in place: a full render would rebuild the list and
    // throw the scroll position back to the top while the user is reading it.
    const byId = new Map((syncJob?.entries || []).map(entry => [entry.id, entry]));
    const labels = { syncing: syncJob?.paused ? "Finishing…" : "Syncing…", queued: syncJob?.paused ? "Paused" : "Waiting", done: "Updated", failed: "Failed" };
    const icons = { syncing: "loader-circle", queued: "clock", done: "circle-check", failed: "circle-alert" };
    root.querySelectorAll("[data-sync-row]").forEach(row => {
      const entry = byId.get(row.dataset.syncRow); if (!entry || entry.status === row.dataset.status) return;
      row.className = `sync-row is-${entry.status}`; row.dataset.status = entry.status;
      const label = row.querySelector("em"); if (label) label.textContent = labels[entry.status] || "";
      const icon = row.querySelector("svg, i[data-lucide]");
      if (icon) { const fresh = document.createElement("i"); fresh.dataset.lucide = icons[entry.status] || "clock"; fresh.setAttribute("aria-hidden", "true"); icon.replaceWith(fresh); window.lucide?.createIcons({ root: row, attrs: { "aria-hidden": "true" } }); }
      const copy = row.querySelector("span"); copy?.querySelector("small")?.remove();
      if (entry.error && copy) { const small = document.createElement("small"); small.textContent = entry.error; copy.appendChild(small); }
    });
  }
  let syncPageRenderTimer = 0;
  function resetDashboard() {
    Object.assign(prefs, { dashboardView: "list", dashboardDefaultCategory: "remember", dashboardStatusFilter: "all", dashboardDefaultPlatform: "all", dashboardPlatformFilter: "all", dashboardSort: "alphabetical-asc", cardCorners: "rounded", dashboardDensity: "comfortable", dashboardGroupBy: "status", dashboardRowActions: "menu", showThumbnails: true, showRatings: true, showProgress: true, ratingFormat: "5-stars", oneHandedMode: "off", tabletTwoColumn: true });
    dashboardStatusFilter = "all"; dashboardPlatformFilter = "all"; activeCategory = "all"; persist({ meta: true }); applyPreferences(); render(); toast("Dashboard preferences restored.");
  }
  function clearDashboardFilters() {
    dashboardStatusFilter = prefs.dashboardStatusFilter = "all";
    prefs.dashboardLastStatus = "all";
    dashboardPlatformFilter = prefs.dashboardPlatformFilter = "all";
    prefs.favoritesOnly = false;
    prefs.dashboardView = "list";
    prefs.dashboardSort = "alphabetical-asc";
    prefs.dashboardGroupBy = "status";
    libraryQuery = "";
    persist({ meta: true }); applyPreferences(); historyPush(); closePopup($("#dashboard-filter-dialog")); render();
  }
  function resetAnimations() {
    ["reduceMotion", "animationSpeed", "animationCustom", "animationEasing", "pageTransition", "cardEntrance", "animationStagger", "sheetAnimation", "pressEffect", "hoverLift", "navBounce", "progressAnimation", "skeletonShimmer"].forEach(key => { prefs[key] = JSON.parse(JSON.stringify(prefsDefaults[key])); });
    persist({ meta: true }); applyPreferences(); render(); toast("Animation settings restored.");
  }
  function previewAnimations() {
    const content = $("#page-content"); if (!content) return;
    document.body.dataset.navDir = "forward"; content.classList.remove("page-route-enter"); void content.offsetWidth; content.classList.add("page-route-enter");
    toast("Replaying animations.");
  }
  function resetAppearance() {
    ["theme", "textSize", "font", "dateFormat", "iconStyle", "mainColor", "showSidebar", "showScrollbars", "bottomBarStyle", "bottomBarCorners", "bottomBarLabels", "bottomBarBackground", "bottomBarTransparency", "bottomBarLayout"].forEach(key => { prefs[key] = JSON.parse(JSON.stringify(prefsDefaults[key])); });
    prefs.categoryColors = {};
    prefs.navIcons = { ...prefsDefaults.navIcons };
    prefs.navBar = { order: [...prefsDefaults.navBar.order], visible: { ...prefsDefaults.navBar.visible } };
    persist({ meta: true }); applyPreferences(); render(); toast("Appearance settings restored.");
  }

  $("#topbar-actions")?.addEventListener("click", event => {
    if (!event.target.closest("[data-open-collection-filter]")) return;
    event.preventDefault(); event.stopPropagation();
    if (page === "dashboard") showPopup($("#dashboard-filter-dialog"));
  });
  $("#page-content").addEventListener("keydown", event => {
    const tab = event.target.closest("[data-detail-tab]");
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = [...tab.closest("[role=tablist]").querySelectorAll("[data-detail-tab]")];
    const current = tabs.indexOf(tab);
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next]?.focus();
    tabs[next]?.click();
  });
  $("#page-content").addEventListener("click", async event => {
    const sourceKeyToggle = event.target.closest("[data-toggle-source-key]");
    if (sourceKeyToggle) {
      const sourceKey = sourceKeyToggle.dataset.toggleSourceKey;
      const keyInput = [...document.querySelectorAll("[data-source-api-key]")].find(input => input.dataset.sourceApiKey === sourceKey);
      if (keyInput) {
        const reveal = keyInput.type === "password";
        keyInput.type = reveal ? "text" : "password";
        sourceKeyToggle.textContent = reveal ? "Hide" : "Show";
        sourceKeyToggle.setAttribute("aria-label", `${reveal ? "Hide" : "Show"} ${sourceKey} API key`);
      }
      return;
    }
    if (event.target.closest("[data-discover-retry]")) {
      submitDiscover();
      return;
    }
    if (event.target.closest("[data-open-dashboard-filter]")) { showPopup($("#dashboard-filter-dialog")); return; }
    const searchSurface = event.target.closest(".collection-search[role='search']");
    if (searchSurface && !event.target.closest("input, button")) { searchSurface.querySelector('input[type="search"]')?.focus(); return; }
    const pill = event.target.closest("[data-pill-name]");
    if (pill) {
      const group = pill.closest(".ios-pills");
      group.querySelector('input[type="hidden"]').value = pill.dataset.pillValue;
      group.querySelectorAll("[data-pill-name]").forEach(button => { const on = button === pill; button.classList.toggle("active", on); button.setAttribute("aria-pressed", String(on)); });
      const card = pill.closest(".dashboard-filter-card");
      const selection = card?.querySelector(".dashboard-filter-card-selection");
      const name = pill.dataset.pillName;
      const label = pill.querySelector(".dashboard-view-label")?.textContent.trim()
        || pill.querySelector("span")?.textContent.trim()
        || pill.textContent.replace(/\s+\d+\s*$/, "").trim();
      if (selection && name === "sort") selection.textContent = label;
      if (selection && name === "status") selection.textContent = label;
      if (selection && name === "platform") selection.textContent = label;
      if (selection && name === "view") {
        const grouping = card.querySelector('[data-pill-name="groupBy"].active')?.textContent.trim() || "Status";
        selection.textContent = `${label} · ${grouping}`;
      }
      if (selection && name === "groupBy") {
        const layout = card.querySelector('[data-pill-name="view"].active .dashboard-view-label')?.textContent.trim() || "List";
        selection.textContent = `${layout} · ${label}`;
      }
      if (pill.dataset.pillName === "status") {
        const apply = pill.closest("form")?.querySelector('[type="submit"]');
        const count = pill.querySelector("em")?.textContent || "0";
        if (apply) apply.textContent = `Apply filter (${count})`;
      }
      return;
    }
    if (event.target.closest("[data-favorites-filter]")) { setPreference("favoritesOnly", !prefs.favoritesOnly); render(); return; }
    const favoriteToggle = event.target.closest("[data-action=toggle-favorite]");
    if (favoriteToggle) { toggleFavorite(favoriteToggle.dataset.id); return; }
    const quickStatus = event.target.closest("[data-quick-status]");
    if (quickStatus) { setPreference("dashboardStatusFilter", quickStatus.dataset.quickStatus); return; }
    if (event.target.closest("[data-clear-dashboard-filters-home]")) { clearDashboardFilters(); return; }
    if (event.target.closest("[data-open-collection-filter]")) { showPopup($("#dashboard-filter-dialog")); return; }
    if (event.target.closest("[data-reveal-playing]")) { document.querySelector(".library-section")?.scrollIntoView({ behavior: prefs.reduceMotion ? "auto" : "smooth", block: "start" }); return; }
    const detailStatus = event.target.closest("[data-detail-status-btn]");
    if (detailStatus) {
      const item = itemById(detailItemId);
      if (item) {
        setItemStatus(item, detailStatus.dataset.detailStatusBtn).then(changed => { if (changed) render(); });
      }
      return;
    }
    const shareGameBtn = event.target.closest("[data-share-game]");
    if (shareGameBtn) { openShareGame(shareGameBtn.dataset.shareGame); return; }
    const shareGroup = event.target.closest("[data-share-group]");
    if (shareGroup) {
      const key = shareGroup.dataset.shareGroup, by = prefs.dashboardGroupBy || "status";
      const list = dashboardSortedItems().filter(item => by === "status" ? item.status === key : by === "category" ? String(item.category || "other") === key : by === "none" ? true : String(item.year || "Unknown release date") === key);
      window.SplitAppShare.open({ title: by === "none" ? "All games" : key, entries: list.map(shareEntry), getImage: shareImageFor }, { showPopup, closePopup, toast, esc, cacheGet: shareCacheGet, cachePut: shareCachePut });
      return;
    }
    const itemCard = event.target.closest(".item-card[data-item]");
    if (itemCard && !event.target.closest("button,a,input,select,textarea,label")) { openDetails(itemCard.dataset.item); return; }
    const itemMenu = event.target.closest("[data-open-item-actions]");
    if (itemMenu) { openItemActions(itemMenu.dataset.openItemActions); return; }
    const dashboardViewChoice = event.target.closest("button[data-dashboard-view]");
    if (dashboardViewChoice) { setPreference("dashboardView", dashboardViewChoice.dataset.dashboardView); return; }
    const dashboardSortChoice = event.target.closest("button[data-dashboard-sort]");
    if (dashboardSortChoice) { setPreference("dashboardSort", dashboardSortChoice.dataset.dashboardSort); return; }
    if (event.target.closest("[data-close-dashboard-filter]")) { closePopup($("#dashboard-filter-dialog")); return; }
    if (event.target.closest("[data-reset-dashboard-filter]")) { clearDashboardFilters(); return; }
    const dashboardLoader = event.target.closest("[data-dashboard-load-more]");
    if (dashboardLoader) { dashboardLazyObserver?.unobserve(dashboardLoader); loadDashboardMore(dashboardLoader); if (dashboardLoader.isConnected) dashboardLazyObserver?.observe(dashboardLoader); return; }
    const detailImage = event.target.closest("[data-detail-image-src]");
    if (detailImage) {
      showDetailImage($$("[data-detail-image-src]", $("#page-content")).indexOf(detailImage));
      return;
    }
    if (event.target.closest("[data-detail-image-rotate]")) { const modal = $("#detail-image-modal"); if (modal) { const next = { "": "cw", cw: "ccw", ccw: "" }[modal.dataset.rotate || ""]; modal.dataset.rotate = next; modal.classList.toggle("is-rotated", Boolean(next)); } return; }
    if (event.target.closest("[data-detail-image-close]")) { closeDetailImage(); return; }
    if (event.target.closest("[data-detail-image-prev]")) { showDetailImage(detailImagePosition - 1); return; }
    if (event.target.closest("[data-detail-image-next]")) { showDetailImage(detailImagePosition + 1); return; }
    if (event.target.id === "detail-image-modal") { closeDetailImage(); return; }
    const statsFilter = event.target.closest("[data-stats-filter]");
    if (statsFilter) { setPreference("dashboardStatusFilter", statsFilter.dataset.statsFilter); goto("dashboard"); return; }
    if (event.target.closest("[data-mix-search]")) { runMixSearch(); return; }
    const mixAdd = event.target.closest("[data-mix-add]");
    if (mixAdd) { event.stopPropagation(); const row = mixCache?.results?.[Number(mixAdd.dataset.mixAdd)]; if (row) addMixResult(row); return; }
    const mixOpen = event.target.closest("[data-mix-open]");
    if (mixOpen) { const row = mixCache?.results?.[Number(mixOpen.dataset.mixOpen)]; if (row) openMixDetails(row); return; }
    const backLink = event.target.closest("[data-back]");
    if (backLink && inAppNav) { event.preventDefault(); navigateBackTo(new URL(backLink.getAttribute("href") || "#dashboard", location.href).hash); return; }
    const csInsert = event.target.closest("[data-cs-insert]");
    if (csInsert) { const input = $("#custom-source-form")?.elements.searchUrl; if (input) { const at = input.selectionStart ?? input.value.length; input.setRangeText(csInsert.dataset.csInsert, at, input.selectionEnd ?? at, "end"); input.focus(); } return; }
    if (event.target.closest("[data-custom-source-test]")) { testCustomSourceForm(); return; }
    if (event.target.closest("[data-custom-source-delete]")) { deleteCustomSource(); return; }
    const rangeButton = event.target.closest("[data-stats-range]");
    if (rangeButton) { statsRange = rangeButton.dataset.statsRange === "month" ? "month" : "week"; statsActivityDate = ""; statsLimits = { ...statsLimits, pages: { ...(statsLimits.pages || {}), act: 0 } }; render(); return; }
    const activityDay = event.target.closest("[data-stats-activity-date]");
    if (activityDay) { statsActivityDate = activityDay.dataset.statsActivityDate; statsLimits = { ...statsLimits, pages: { ...(statsLimits.pages || {}), act: 0 } }; render(); return; }
    const statsGroup = event.target.closest("[data-stats-group]");
    if (statsGroup) { const score = statsGroup.dataset.statsGroup; const wasOpen = statsGroup.getAttribute("aria-expanded") === "true"; statsLimits = { ...statsLimits, open: { ...(statsLimits.open || {}), [score]: !wasOpen } }; render(); return; }
    const statsMore = event.target.closest("[data-stats-more]");
    if (statsMore) { const kind = statsMore.dataset.statsMore === "rated" ? "rated" : "quick"; statsLimits = { ...statsLimits, [kind]: statsLimits[kind] + (kind === "rated" ? 15 : 10) }; render(); return; }
    if (event.target.closest("[data-clear-all-ratings]")) { clearAllRatings(); return; }
    const pgBtn = event.target.closest("[data-stats-pg]");
    if (pgBtn) { const [key, dir] = pgBtn.dataset.statsPg.split("|"); const pages = { ...(statsLimits.pages || {}) }; pages[key] = Math.max(0, (pages[key] || 0) + (dir === "next" ? 1 : -1)); statsLimits = { ...statsLimits, pages }; render(); return; }
    const libSummary = event.target.closest("details[data-stats-lib] > summary");
    if (libSummary) { event.preventDefault(); const k2 = libSummary.parentElement.dataset.statsLib; statsLimits = { ...statsLimits, libOpen: { ...(statsLimits.libOpen || {}), [k2]: !(statsLimits.libOpen || {})[k2] } }; render(); return; }
    const ptBtn = event.target.closest("[data-stats-pt]");
    if (ptBtn) { statsLimits = { ...statsLimits, playtimePage: Math.max(0, (statsLimits.playtimePage || 0) + (ptBtn.dataset.statsPt === "next" ? 1 : -1)) }; render(); return; }
    const statsRating = event.target.closest("[data-stats-rating]");
    if (statsRating) {
      const item = itemById(String(statsRating.dataset.statsRating));
      if (item) { item.rating = Number(statsRating.dataset.score) || 0; delete item.ratingExact; item.updatedAt = Date.now(); persist({ ids: [item.id] }); render(); toast(`Rated ${item.title} ${item.rating}/${prefs.ratingFormat === "10-point" ? 10 : 5}.`); }
      return;
    }
    const findHours = event.target.closest("[data-stats-find-hours]");
    if (findHours) { findMissingHours(findHours); return; }
    const fetchFacts = event.target.closest("[data-stats-fetch-facts]");
    if (fetchFacts) { fetchMissingFacts(fetchFacts); return; }
    const adjust = event.target.closest("[data-adjust-progress]");
    if (adjust) {
      const item = itemById(detailItemId);
      if (item) { item.progress = Math.max(0, (Number(item.progress) || 0) + Number(adjust.dataset.adjustProgress)); item.updatedAt = Date.now(); persist({ ids: [item.id] }); render(); }
      return;
    }
    const stepper = event.target.closest("[data-step-input]");
    if (stepper) {
      const input = $("#item-form")?.elements[stepper.dataset.stepInput];
      if (input) { input.value = Math.max(0, (Number(input.value) || 0) + Number(stepper.dataset.step)); input.dispatchEvent(new Event("input", { bubbles: true })); }
      return;
    }
    const addStar = event.target.closest("[data-add-star]");
    if (addStar) {
      const select = $("#item-form")?.elements.rating;
      if (select) {
        const value = Number(select.value) === Number(addStar.dataset.addStar) ? "" : addStar.dataset.addStar;
        select.value = value;
        $$("[data-add-star]").forEach(star => {
          star.classList.toggle("active", Number(star.dataset.addStar) <= Number(value || 0));
          star.setAttribute("aria-pressed", String(Number(star.dataset.addStar) === Number(value || 0)));
        });
        const label = $("#add-rating-label"); if (label) label.textContent = value ? `${value} / ${select.options.length - 1}` : "No rating";
      }
      return;
    }
    const detailRating = event.target.closest("[data-detail-rating]");
    if (detailRating) {
      const item = itemById(detailItemId);
      if (!item) return;
      item.rating = Number(detailRating.dataset.detailRating) || 0;
      item.updatedAt = Date.now();
      persist({ ids: [item.id] });
      $$("[data-detail-rating]").forEach(button => {
        const active = Number(button.dataset.detailRating) <= item.rating;
        button.setAttribute("aria-pressed", String(Number(button.dataset.detailRating) === item.rating));
        const star = button.querySelector("svg, i"); star?.classList.toggle("active", active);
        if (button === detailRating) { star?.classList.remove("pop"); void star?.getBoundingClientRect(); star?.classList.add("pop"); }
      });
      return;
    }
    const cancelAdd = event.target.closest("[data-cancel-add]");
    if (cancelAdd) { entryDraftId = null; goto(addReturnPage); return; }
    const entryStatus = event.target.closest("[data-entry-status]");
    if (entryStatus) {
      const form = entryStatus.closest("form");
      if (form?.elements.status) form.elements.status.value = entryStatus.dataset.entryStatus;
      entryStatus.parentElement?.querySelectorAll("[data-entry-status]").forEach(button => {
        const selected = button === entryStatus; button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected));
      });
      return;
    }
    const clearCookies = event.target.closest("[data-source-clear-cookies]");
    if (clearCookies) {
      const key = clearCookies.dataset.sourceClearCookies, provider = window.SplitAppSources.list().find(row => row.key === key);
      if (prefs.sourceOptions[key]) { delete prefs.sourceOptions[key].cookies; if (!Object.keys(prefs.sourceOptions[key]).length) delete prefs.sourceOptions[key]; }
      const host = window.SplitAppMetadata.cleanDomain(prefs.sourceOptions[key]?.domain) || provider?.domain;
      try { window.Capacitor?.Plugins?.CapacitorCookies?.clearCookies?.({ url: `https://${host}` }); } catch (_) {}
      persist(); render(); toast("Cookies cleared."); return;
    }
    const resetOptions = event.target.closest("[data-source-reset-options]");
    if (resetOptions) { delete prefs.sourceOptions[resetOptions.dataset.sourceResetOptions]; persist({ meta: true }); render(); toast("Source options reset."); return; }
    const go = event.target.closest("[data-go]"); if (go) { if (go.classList.contains("detail-back")) navigateBackTo(go.dataset.go); else goto(go.dataset.go); return; }
    if (event.target.closest("[data-category-colors-picker]")) { openCategoryColorsPicker(); return; }
    const sourceFilter = event.target.closest("[data-source-filter]");
    if (sourceFilter) {
      metadataSourceFilter = sourceFilter.dataset.sourceFilter;
      $$('[data-source-filter]').forEach(button => { const selected = button === sourceFilter; button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected)); });
      $$('[data-source-row]').forEach(row => { const enabled = row.dataset.sourceEnabledState === "true"; row.hidden = metadataSourceFilter === "enabled" ? !enabled : metadataSourceFilter === "disabled" ? enabled : false; });
      return;
    }
    const storageAction = event.target.closest("[data-storage-action]");
    if (storageAction) { runStorageAction(storageAction.dataset.storageAction); return; }
    const backupFolderAction = event.target.closest("[data-backup-folder-action]");
    if (backupFolderAction) {
      if (backupFolderAction.dataset.backupFolderAction === "choose") chooseBackupDatabaseFolder();
      else refreshBackupFolderStatus();
      return;
    }
    const logAction = event.target.closest("[data-log-action]");
    if (logAction?.dataset.logAction === "clear") { localStorage.removeItem(`${storageKey}_log`); render(); toast("Logs cleared."); return; }
    const settingPicker = event.target.closest("[data-setting-picker]");
    if (settingPicker) { openSettingPicker(settingPicker); return; }
    if (event.target.closest("[data-close-setting-picker]")) { closePopup($("#setting-picker-dialog")); return; }
    if (event.target.id === "setting-picker-dialog") { closePopup(event.target); return; }
    const timelineFilterButton = event.target.closest("[data-timeline-filter]");
    if (timelineFilterButton) { timelineFilter = timelineFilterButton.dataset.timelineFilter; render(); return; }
    if (event.target.closest("[data-open-timeline-filters]")) { showPopup($("#timeline-filter-dialog")); return; }
    if (event.target.closest("[data-clear-timeline-filters]")) {
      timelineSearch = ""; timelineMonth = ""; timelineYear = ""; timelineFilter = "all";
      closePopup($("#timeline-filter-dialog")); render(); return;
    }
    const episode = event.target.closest("[data-episode-toggle]");
    if (episode) { toggleEpisodeWatched(detailItemId, episode.dataset.episodeId, episode.dataset.episodeTitle || "Episode"); return; }
    const tabButton = event.target.closest("[data-detail-tab]");
    if (tabButton) {
      detailTab = tabButton.dataset.detailTab; const root = tabButton.closest(".detail-page");
      root.querySelectorAll("[data-detail-tab]").forEach(button => { const on = button === tabButton; button.classList.toggle("active", on); button.setAttribute("aria-selected", String(on)); button.tabIndex = on ? 0 : -1; });
      root.querySelectorAll("[data-detail-panel]").forEach(panel => { panel.hidden = panel.dataset.detailPanel !== detailTab; });
      return;
    }
    const action = event.target.closest("[data-action]");
    if (action) { if (action.dataset.action === "add") openItem(); else if (action.dataset.action === "progress") updateProgress(action.dataset.id); else if (action.dataset.action === "edit") { if (page === "details") { detailEditMode = true; render(); } else openEdit(action.dataset.id); } else if (action.dataset.action === "cancel-detail-edit") { detailEditMode = false; render(); } else if (action.dataset.action === "details") openDetails(action.dataset.id); else if (action.dataset.action === "refresh-details") loadDetails({ force: true }); else if (action.dataset.action === "delete-detail") requestDeleteDetails(action.dataset.id); else if (action.dataset.action === "save-detail-item") { const saved = await addDiscoverResult(detailPreview); if (saved) { detailPreview = null; detailItemId = saved.id; detailData = null; loadDetails(); } } return; }
    const deleteButton = event.target.closest("#delete-item"); if (deleteButton) { deleteItem(deleteButton.dataset.id); return; }
    const settingAction = event.target.closest("[data-setting-action]");
    if (settingAction && settingAction.type !== "file") {
      const key = settingAction.dataset.settingAction;
      if (key === "export") goto("export"); else if (key === "resetDashboard") resetDashboard(); else if (key === "resetAnimations") resetAnimations(); else if (key === "previewAnimations") previewAnimations(); else if (key === "resetAppearance") resetAppearance();
      else if (key.startsWith("clear-")) {
        clearAppCaches(key === "clear-images" ? "images" : key === "clear-metadata" ? "metadata" : "temporary");
        toast("Temporary cache cleared.");
      }
      return;
    }
    if (event.target.closest("[data-sync-toggle]")) { setSyncPaused(!syncJob?.paused); return; }
    if (event.target.closest("[data-sync-retry]")) { retrySyncFailures(); return; }
    const keepSimilar = event.target.closest("[data-import-keep]");
    if (keepSimilar && importState?.similar) { const row = importState.similar[Number(keepSimilar.dataset.importKeep)]; if (row) row.keep = !row.keep; render(); return; }
    if (event.target.closest("[data-sync-dismiss]")) { if (syncJob?.finished) { syncJob = null; updateSyncUI(); goto("dashboard"); } return; }
    if (event.target.closest("[data-continue-import]")) { continueImport().catch(error => { if (importState) { importState.phase = "restore-error"; importState.error = error.message || "Could not restore this library."; render(); } }); return; }
    const exportFormat = event.target.closest("[data-export-format]");
    if (exportFormat) { exportOptions = { ...exportOptions, format: exportFormat.dataset.exportFormat }; render(); return; }
    const exportOpt = event.target.closest("[data-export-opt]");
    if (exportOpt) { exportOptions = { ...exportOptions, [exportOpt.dataset.exportOpt]: !exportOptions[exportOpt.dataset.exportOpt] }; render(); return; }
    if (event.target.closest("[data-run-export]")) { runExport(); return; }
    if (event.target.closest("[data-cancel-import]")) { importState = null; settingsGroup = "backups"; goto("settings"); return; }
    const discoverAdd = event.target.closest("[data-discover-add]"); if (discoverAdd) { await addDiscoverResult($("#discover-results")._results?.[Number(discoverAdd.dataset.discoverAdd)]); return; }
    if (event.target.closest("[data-discover-row-add]")) return;
    const sourceDetails = event.target.closest("[data-discover-details]"); if (sourceDetails) { openDiscoverDetails($("#discover-results")._results?.[Number(sourceDetails.dataset.discoverDetails)]); return; }
  });
  document.addEventListener("change", event => {
    const input = event.target;
    if (input.matches("[data-detail-status]")) {
      const item = itemById(detailItemId);
      if (!item || item.status === input.value) return;
      setItemStatus(item, input.value).then(changed => { if (!changed) input.value = item.status; else render(); });
      return;
    }
    if (input.matches("[data-detail-rating-select]")) {
      const item = itemById(detailItemId);
      if (item) { item.rating = Number(input.value) || 0; item.updatedAt = Date.now(); persist({ ids: [item.id] }); }
      return;
    }
    if (input.matches("[data-custom-picker]")) {
      setPreference("mainColor", input.value); render();
      const list = $("[data-setting-picker-list]");
      list?.querySelectorAll(".setting-picker-option").forEach(option => { option.classList.remove("active"); option.setAttribute("aria-pressed", "false"); });
      return;
    }
    if (input.matches("[data-pref]")) {
      const key = input.dataset.pref; let value = input.type === "checkbox" ? input.checked : input.value;
      if (input.type === "number" || input.type === "range") value = Number(value);
      setPreference(key, value); if (input.type === "range") input.nextElementSibling.value = `${value}%`;
    }
    if (input.matches("[data-category-color]")) { prefs.categoryColors[input.dataset.categoryColor] = input.value; persist({ meta: true }); render(); }
    if (input.matches("[data-api-key]")) { prefs.apiKeys[input.dataset.apiKey] = input.value.trim(); persist({ meta: true }); }
    if (input.matches("[data-source]")) { window.SplitAppSources.setEnabled(prefs, input.dataset.source, input.checked); persist({ meta: true }); }
    if (input.matches("[data-nav-visible]")) {
      const key = input.dataset.navVisible;
      if (key !== "dashboard" && key !== "settings") prefs.navBar.visible[key] = input.checked;
      persist({ meta: true }); applyPreferences(); render();
    }
    if (input.matches("[data-source-enabled]")) {
      window.SplitAppSources.setEnabled(prefs, input.dataset.sourceEnabled, input.checked);
      persist({ meta: true }); render();
    }
    if (input.matches("[data-source-option]")) {
      const [key, field] = input.dataset.sourceOption.split("|");
      const next = { ...(prefs.sourceOptions[key] || {}) }, value = field === "domain" ? window.SplitAppMetadata.cleanDomain(input.value) : input.value.trim();
      if (value) next[field] = value; else delete next[field];
      if (Object.keys(next).length) prefs.sourceOptions[key] = next; else delete prefs.sourceOptions[key];
      if (field === "domain") input.value = value;
      persist({ meta: true }); return;
    }
    if (input.matches("[data-source-api-key]")) { prefs.apiKeys[input.dataset.sourceApiKey] = input.value.trim(); persist({ meta: true }); }
    if (input.matches("[data-setting-action=import]")) { const file = input.files?.[0]; input.value = ""; importList(file); }
  });
  let navTouchDrag = null;
  const handleNavTouchMove = event => {
    const drag = navTouchDrag;
    const touch = drag && [...event.changedTouches].find(point => point.identifier === drag.identifier);
    if (!drag || !touch) return;
    if (!drag.moved && Math.abs(touch.clientY - drag.startY) < 7) return;
    drag.moved = true;
    event.preventDefault();
    drag.row.classList.add("dragging");
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-nav-row]");
    if (!target || target === drag.row || target.parentElement !== drag.row.parentElement) return;
    const rect = target.getBoundingClientRect();
    target.parentElement.insertBefore(drag.row, touch.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
  };
  document.addEventListener("touchstart", event => {
    if (navTouchDrag || event.touches.length !== 1) return;
    const handle = event.target.closest?.(".nav-layout-row .drag-handle");
    const row = handle?.closest("[data-nav-row]");
    if (!handle || !row) return;
    const touch = event.touches[0];
    navTouchDrag = { identifier: touch.identifier, row, startY: touch.clientY, moved: false, wasDraggable: row.draggable };
    row.draggable = false;
    document.addEventListener("touchmove", handleNavTouchMove, { passive: false });
  }, { passive: true });
  const finishNavTouchDrag = event => {
    const drag = navTouchDrag;
    if (!drag || (event && ![...event.changedTouches].some(touch => touch.identifier === drag.identifier))) return;
    navTouchDrag = null;
    document.removeEventListener("touchmove", handleNavTouchMove);
    drag.row.classList.remove("dragging");
    drag.row.draggable = drag.wasDraggable;
    if (!drag.moved) return;
    const list = drag.row.closest("#nav-bar-arrangement-list");
    if (!list) return;
    prefs.navBar.order = [...list.querySelectorAll("[data-nav-row]")].map(row => row.dataset.navRow);
    persist({ meta: true }); applyPreferences(); render();
  };
  document.addEventListener("touchend", finishNavTouchDrag);
  document.addEventListener("touchcancel", finishNavTouchDrag);
  document.addEventListener("dragstart", event => {
    const row = event.target.closest("[data-nav-row], [data-source-row]");
    if (!row || !event.dataTransfer) return;
    const kind = row.hasAttribute("data-nav-row") ? "nav" : "source";
    const key = row.dataset.navRow || row.dataset.sourceRow;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${kind}:${key}`);
    row.classList.add("dragging");
  });
  document.addEventListener("dragend", event => event.target.closest("[data-nav-row], [data-source-row]")?.classList.remove("dragging"));
  document.addEventListener("dragover", event => {
    if (event.target.closest("[data-nav-row], [data-source-row]")) event.preventDefault();
  });
  document.addEventListener("drop", event => {
    const targetRow = event.target.closest("[data-nav-row], [data-source-row]");
    if (!targetRow || !event.dataTransfer) return;
    event.preventDefault();
    const [kind, key] = event.dataTransfer.getData("text/plain").split(":");
    if (kind === "nav" && targetRow.dataset.navRow) {
      prefs.navBar.order = moveInOrder([...prefs.navBar.order], key, null, targetRow.dataset.navRow); persist({ meta: true }); applyPreferences(); render();
    } else if (kind === "source" && targetRow.dataset.sourceRow) {
      prefs.metadataSourceOrder = moveInOrder([...prefs.metadataSourceOrder], key, null, targetRow.dataset.sourceRow); persist({ meta: true }); render();
    }
  });
  document.addEventListener("input", event => {
    if (event.target.matches("[data-detail-notes]")) {
      const item = itemById(detailItemId);
      if (item) { item.notes = event.target.value; item.updatedAt = Date.now(); persist({ ids: [item.id] }); }
      return;
    }
    if (event.target.matches("[data-settings-index-search]")) {
      const query = event.target.value.trim().toLowerCase();
      let hasMatch = false;
      document.querySelectorAll("[data-settings-index-result]").forEach(result => {
        const matches = Boolean(query) && result.dataset.searchValue.includes(query);
        result.hidden = query !== "" && !matches;
        hasMatch ||= matches;
      });
      const results = $("[data-settings-index-results]");
      const categories = $("[data-settings-index-categories]");
      const empty = $("[data-settings-index-empty]");
      if (results) results.hidden = query === "";
      if (categories) categories.hidden = query !== "";
      if (empty) empty.hidden = query === "" || hasMatch;
      return;
    }
    if (event.target.matches("[data-settings-search]")) {
      const query = event.target.value.trim().toLowerCase();
      document.querySelectorAll(".settings-section").forEach(section => {
        const rows = [...section.querySelectorAll("[data-setting-search-row]")];
        rows.forEach(row => { row.hidden = query !== "" && !row.dataset.settingSearchRow.includes(query); });
        section.hidden = rows.length > 0 && rows.every(row => row.hidden);
      });
      let hasGlobalMatch = false;
      document.querySelectorAll("[data-settings-global-result]").forEach(result => {
        const matches = query !== "" && result.dataset.searchValue.includes(query);
        result.hidden = !matches;
        hasGlobalMatch ||= matches;
      });
      const globalResults = $("[data-settings-global-results]");
      if (globalResults) globalResults.hidden = !hasGlobalMatch;
      return;
    }
    if (event.target.id === "explore-source-search") {
      const query = event.target.value.trim().toLowerCase();
      const rows = $$("[data-explore-search]");
      let matches = 0;
      rows.forEach(row => { row.hidden = query !== "" && !row.dataset.exploreSearch.includes(query); if (!row.hidden) matches++; });
      const noEnabledSources = $("#explore-no-enabled-sources");
      const noMatches = $("#explore-no-sources");
      if (noEnabledSources) noEnabledSources.hidden = rows.length > 0;
      if (noMatches) noMatches.hidden = query === "" || matches > 0 || rows.length === 0;
      return;
    }
    if (event.target.id === "global-search") {
      libraryQuery = event.target.value;
      const clearButton = $("[data-clear-collection-search]");
      if (clearButton) clearButton.hidden = !libraryQuery;
      clearTimeout(searchRenderTimer);
      searchRenderTimer = setTimeout(() => refreshSearchResults("dashboard", "#collection-results"), 120);
      return;
    }
    if (event.target.id === "library-search") {
      libraryQuery = event.target.value;
      const clearButton = $("[data-clear-library-search]");
      if (clearButton) clearButton.hidden = !libraryQuery;
      clearTimeout(searchRenderTimer);
      searchRenderTimer = setTimeout(() => refreshSearchResults("search", "#search-results"), 120);
    }
  });
  document.addEventListener("submit", event => {
    if (event.target.id === "custom-source-form") { saveCustomSource(event); return; }
    if (event.target.id !== "dashboard-filter-form") return;
    event.preventDefault();
    dashboardStatusFilter = event.target.elements.status.value || "all";
    prefs.dashboardStatusFilter = dashboardStatusFilter;
    prefs.dashboardLastStatus = dashboardStatusFilter;
    dashboardPlatformFilter = event.target.elements.platform.value || "all";
    prefs.dashboardPlatformFilter = dashboardPlatformFilter;
    prefs.dashboardView = event.target.elements.view?.value || prefs.dashboardView;
    persist({ meta: true });
    applyPreferences();
    closePopup($("#dashboard-filter-dialog"));
    render();
  });
  document.addEventListener("submit", event => {
    if (!event.target.matches("#timeline-filter-dialog form")) return;
    event.preventDefault();
    const form = event.target;
    timelineSearch = form.elements["timeline-search"].value.trim();
    timelineMonth = form.elements["timeline-month"].value;
    timelineYear = form.elements["timeline-year"].value;
    closePopup($("#timeline-filter-dialog")); render();
  });
  $("#bottom-bar").addEventListener("click", event => {
    const button = event.target.closest(".nav-button[data-page]");
    if (!button) return;
    settingsGroup = null;
    goto(button.dataset.page);
  });
  $("#sidebar-nav").addEventListener("click", event => {
    const button = event.target.closest(".sidebar-nav-button[data-sidebar-page]");
    if (!button) return;
    settingsGroup = null;
    goto(button.dataset.sidebarPage);
  });
  async function refreshCurrentPage() {
    if (page === "details") { await loadDetails({ force: true }); return; }
    if (page === "discover") {
      if (prefs.metadataMode === "offline" || !navigator.onLine) { render(); return; }
      if (discoverQuery.trim()) { await discover({ forceRefresh: true }); return; }
      suggestionsCache = null;
      await loadDiscoverSuggestions(true);
      return;
    }
    if (page === "timeline") {
      render();
      fetchTimelineOnlineThumbnails();
      return;
    }
    if (page === "settings" && ["metadata-sources", "source-options", "custom-source"].includes(settingsGroup)) refreshSourceRegistry();
    if (page === "dashboard") syncUnsyncedGames();
    render();
  }
  // Long-press a Home card and drop it on another card to merge them into one Mix game
  // (e.g. a Steam entry onto its HowLongToBeat entry); the merged game re-fetches every pinned source, shown on the Sync page.
  function mergeIntoMix(sourceId, targetId) {
    const from = itemById(sourceId), to = itemById(targetId);
    if (!from || !to || from === to) return;
    backupBeforeBulk();
    const undoState = { from: cloneJson(from), to: cloneJson(to), fromIndex: items.indexOf(from), moved: history.filter(entry => String(entry.itemId) === String(from.id)) };
    const pinsOf = item => {
      const out = { ...(item.mixPins || {}) };
      if (item.metadataSource && item.metadataSource !== "mix" && item.providerId) out[item.metadataSource] = item.providerId;
      if (item.mixPrimary?.key) out[item.mixPrimary.key] = item.mixPrimary.providerId;
      return out;
    };
    const primary = to.metadataSource === "mix" ? to.mixPrimary : (to.metadataSource && to.providerId ? { key: to.metadataSource, providerId: to.providerId } : null);
    to.mixPins = { ...pinsOf(from), ...pinsOf(to) };
    if (primary) to.mixPrimary = primary;
    to.source = to.metadataSource = "mix";
    to.mixSourceKeys = [...new Set([...(to.mixSourceKeys || []), ...(from.mixSourceKeys || []), ...Object.keys(to.mixPins)])];
    to.progress = Math.max(Number(to.progress) || 0, Number(from.progress) || 0);
    if (!Number(to.rating) && Number(from.rating)) to.rating = from.rating;
    to.favorite = Boolean(to.favorite || from.favorite);
    history.forEach(entry => { if (String(entry.itemId) === String(from.id)) entry.itemId = to.id; });
    items = items.filter(entry => entry !== from);
    to.updatedAt = Date.now();
    persist();
    if (!startSyncJob([to])) enrichLibraryEntryWithMix(to, { ...to, source: "mix" }, "Merge");
    render();
    toastUndo(`Merged into “${to.title}”. Fetching from all enabled sources…`, () => {
      if (syncJob) { syncJob.queue = syncJob.queue.filter(entry => String(entry.id) !== String(to.id)); syncJob.entries = syncJob.entries.filter(entry => String(entry.id) !== String(to.id)); }
      const index = items.findIndex(entry => String(entry.id) === String(to.id));
      if (index >= 0) items[index] = undoState.to;
      items.splice(Math.min(undoState.fromIndex, items.length), 0, undoState.from);
      undoState.moved.forEach(entry => { entry.itemId = undoState.from.id; });
      persist({ ids: [undoState.to.id, undoState.from.id] }); render(); toast("Merge undone.");
    }, 10000);
  }
  (() => {
    let timer = 0, drag = null, start = null;
    const cardAt = (x, y, exceptId) => { const el = document.elementFromPoint(x, y)?.closest?.(".item-card[data-item]"); return el && el.dataset.item !== exceptId ? el : null; };
    const clear = () => { document.querySelectorAll(".mix-drop-target").forEach(el => { el.classList.remove("mix-drop-target"); el.style.outline = ""; }); };
    let finish = async (x, y, cancelled) => {
      clearTimeout(timer);
      if (!drag) { start = null; return; }
      const { id, ghost, source, moved } = drag; drag = null; start = null;
      ghost.remove(); source.style.opacity = ""; clear();
      if (cancelled) return;
      const target = cardAt(x, y, id);
      if (!target) { if (!moved) enterSelectMode(id); return; } // hold and release in place = select
      const from = itemById(id), to = itemById(target.dataset.item); if (!from || !to) return;
      if (await appConfirm(`Merge “${from.title}” into “${to.title}” as one Mix game? “${from.title}” will be removed and “${to.title}” fetches from both sources.`, { title: "Merge as Mix", confirmLabel: "Merge" })) mergeIntoMix(id, to.id);
    };
    document.addEventListener("pointerdown", event => {
      if (page !== "dashboard" || selectMode || (event.pointerType === "mouse" && event.button !== 0)) return;
      const card = event.target.closest?.(".item-card[data-item]"); if (!card || event.target.closest("[data-item-menu], .item-menu")) return;
      start = { x: event.clientX, y: event.clientY };
      clearTimeout(timer);
      timer = setTimeout(() => {
        const rect = card.getBoundingClientRect(), ghost = card.cloneNode(true);
        Object.assign(ghost.style, { position: "fixed", left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", margin: "0", zIndex: 9999, pointerEvents: "none", opacity: ".92", transform: "scale(.94)", boxShadow: "0 12px 30px rgba(0,0,0,.3)" });
        document.body.appendChild(ghost); card.style.opacity = ".4";
        drag = { id: card.dataset.item, ghost, source: card, dx: start.x - rect.left, dy: start.y - rect.top, sx: start.x, sy: start.y, moved: false };
        navigator.vibrate?.(25);
      }, 500);
    }, true);
    document.addEventListener("pointermove", event => {
      if (!drag) { if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) { clearTimeout(timer); start = null; } return; }
      if (Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) > 14) drag.moved = true;
      drag.ghost.style.left = event.clientX - drag.dx + "px"; drag.ghost.style.top = event.clientY - drag.dy + "px";
      clear(); const target = cardAt(event.clientX, event.clientY, drag.id);
      if (target) { target.classList.add("mix-drop-target"); target.style.outline = "3px solid var(--accent, #6355f5)"; }
    }, true);
    document.addEventListener("touchmove", event => { if (drag && event.cancelable) event.preventDefault(); }, { passive: false });
    document.addEventListener("pointerup", event => finish(event.clientX, event.clientY, false), true);
    document.addEventListener("pointercancel", event => finish(event.clientX, event.clientY, true), true);
    document.addEventListener("contextmenu", event => { if (drag || start) event.preventDefault(); }, true);
    // A drag must not also open the card it started on.
    document.addEventListener("click", event => { if (Date.now() - dragEndedAt < 400) { event.preventDefault(); event.stopPropagation(); } }, true);
    let dragEndedAt = 0;
    const baseFinish = finish; finish = async (...args) => { if (drag) dragEndedAt = Date.now(); return baseFinish(...args); };
  })();

  // ================= Library tools: undo, bulk select, fix match, cover picker, import duplicates =================
  function cloneJson(value) { return JSON.parse(JSON.stringify(value)); }
  // Toast with an Undo button (a few seconds to take the action back).
  function toastUndo(message, undo, ms = 8000) {
    const node = $("#toast"); node.textContent = "";
    const label = document.createElement("span"); label.textContent = message;
    const button = document.createElement("button"); button.type = "button"; button.className = "toast-undo"; button.textContent = "Undo";
    button.addEventListener("click", async event => {
      event.stopPropagation(); node.classList.remove("show", "has-action");
      try { await undo(); } catch (error) { recordLog("error", `Undo failed: ${error?.message || error}`); toast("Could not undo that."); }
    });
    node.append(label, button); node.classList.add("show", "has-action");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show", "has-action"), ms);
  }
  // Automatic backup before bulk changes (throttled; follows the "Backup before destructive actions" setting).
  function backupBeforeBulk() {
    if (!prefs.backupBeforeDestructive || Date.now() - lastAutoBackup < 60000) return;
    lastAutoBackup = Date.now();
    try { exportList({ silent: true }); } catch (_) {}
  }
  function removeItemsWithUndo(list, message) {
    const removed = list.map(entry => ({ item: cloneJson(entry), index: items.indexOf(entry) })).filter(row => row.index >= 0);
    if (!removed.length) return;
    backupBeforeBulk();
    const ids = new Set(removed.map(row => String(row.item.id)));
    items = items.filter(entry => !ids.has(String(entry.id)));
    if (syncJob) { syncJob.queue = syncJob.queue.filter(entry => !ids.has(String(entry.id))); syncJob.entries = syncJob.entries.filter(entry => !ids.has(String(entry.id))); }
    persist({ removed: [...ids] }); render();
    toastUndo(message || `Removed ${removed.length} ${removed.length === 1 ? "game" : "games"}.`, () => {
      removed.sort((a, b) => a.index - b.index).forEach(row => items.splice(Math.min(row.index, items.length), 0, row.item));
      persist({ ids: [...ids] }); render(); toast("Restored.");
    });
  }

  // ---- Bulk select (hold a card and release without moving, or use the select button) ----
  function enterSelectMode(id) {
    selectMode = true; selectedIds.clear(); if (id != null) selectedIds.add(String(id));
    document.body.classList.add("select-mode"); applySelectionUI(); navigator.vibrate?.(15);
  }
  function exitSelectMode() { selectMode = false; selectedIds.clear(); document.body.classList.remove("select-mode"); applySelectionUI(); }
  function applySelectionUI() {
    document.querySelectorAll(".item-card[data-item]").forEach(card => card.classList.toggle("is-selected", selectMode && selectedIds.has(card.dataset.item)));
    let bar = $("#select-bar");
    if (!selectMode) { bar?.remove(); $("#select-toggle")?.classList.remove("is-active"); return; }
    $("#select-toggle")?.classList.add("is-active");
    if (!bar) {
      bar = document.createElement("div"); bar.id = "select-bar"; bar.className = "select-bar"; bar.setAttribute("role", "toolbar");
      bar.innerHTML = '<span class="select-count" data-select-count></span><button type="button" data-select-act="status">Status</button><button type="button" data-select-act="favorite">♥</button><button type="button" data-select-act="delete" class="danger">Delete</button><button type="button" data-select-act="all">All</button><button type="button" data-select-act="done">Done</button>';
      document.body.appendChild(bar); bar.addEventListener("click", onSelectBarClick);
    }
    const countNode = bar.querySelector("[data-select-count]"); countNode.textContent = `${selectedIds.size} ✓`; countNode.setAttribute("aria-label", `${selectedIds.size} selected`);
    bar.querySelectorAll('[data-select-act="status"],[data-select-act="favorite"],[data-select-act="delete"]').forEach(button => { button.disabled = selectedIds.size === 0; });
  }
  const selectedItems = () => items.filter(item => selectedIds.has(String(item.id)));
  async function onSelectBarClick(event) {
    const act = event.target.closest("[data-select-act]")?.dataset.selectAct; if (!act) return;
    const list = selectedItems();
    if (act === "done") { exitSelectMode(); return; }
    if (act === "all") { document.querySelectorAll(".item-card[data-item]").forEach(card => selectedIds.add(card.dataset.item)); applySelectionUI(); return; }
    if (!list.length) return;
    if (act === "favorite") {
      const makeFavorite = list.some(item => !item.favorite);
      const before = list.map(item => [item, Boolean(item.favorite), item.updatedAt]);
      list.forEach(item => { item.favorite = makeFavorite; item.updatedAt = Date.now(); });
      persist({ ids: list.map(item => item.id) }); exitSelectMode(); render();
      toastUndo(makeFavorite ? `Added ${list.length} to favorites.` : `Removed ${list.length} from favorites.`, () => { before.forEach(([item, fav, at]) => { item.favorite = fav; item.updatedAt = at; }); persist({ ids: list.map(item => item.id) }); render(); });
    } else if (act === "delete") {
      if (!(await appConfirm(`Remove ${list.length} ${list.length === 1 ? "game" : "games"} from your collection?`, { title: "Remove games", confirmLabel: "Remove", danger: true }))) return;
      exitSelectMode(); removeItemsWithUndo(list);
    } else if (act === "status") {
      const statuses = [...new Set(category("game")?.statuses || ["Backlog", "Playing", "On Hold", "Dropped", "Completed", "Upcoming"])];
      let dialog = $("#bulk-status-dialog");
      if (!dialog) { dialog = document.createElement("dialog"); dialog.id = "bulk-status-dialog"; dialog.className = "ios-action-sheet"; document.body.appendChild(dialog); }
      dialog.innerHTML = `<div class="ios-action-group"><p>Set ${list.length} ${list.length === 1 ? "game" : "games"} to…</p>${statuses.map(status => `<button type="button" data-bulk-status="${esc(status)}">${esc(status)}</button>`).join("")}</div><div class="ios-action-group"><button type="button" data-bulk-status="">Cancel</button></div>`;
      dialog.onclick = event2 => {
        if (event2.target === dialog) { closePopup(dialog); return; }
        const choice = event2.target.closest("[data-bulk-status]"); if (!choice) return;
        const status = choice.dataset.bulkStatus; closePopup(dialog);
        if (status) applyBulkStatus(list, status);
      };
      showPopup(dialog);
    }
  }
  function applyBulkStatus(list, status) {
    backupBeforeBulk();
    const before = list.map(item => ({ item, status: item.status, progress: item.progress, updatedAt: item.updatedAt }));
    const addedHistory = [];
    list.forEach(item => {
      if (item.status === status) return;
      item.status = status; item.updatedAt = Date.now();
      if (status === "Completed" && Number(item.goal) > 0) item.progress = Math.max(Number(item.progress) || 0, Number(item.goal));
      if (["Dropped", "Completed", "On Hold", "Playing", "Upcoming"].includes(status)) { const entry = { itemId: item.id, title: item.title, action: status, status, at: Date.now() }; history.unshift(entry); addedHistory.push(entry); }
    });
    persist({ ids: list.map(item => item.id) }); exitSelectMode(); render();
    toastUndo(`Marked ${list.length} as ${status}.`, () => {
      before.forEach(row => { row.item.status = row.status; row.item.progress = row.progress; row.item.updatedAt = row.updatedAt; });
      history = history.filter(entry => !addedHistory.includes(entry));
      persist({ ids: list.map(item => item.id) }); render();
    });
  }
  document.addEventListener("click", event => {
    if (!selectMode || page !== "dashboard") return;
    const card = event.target.closest?.(".item-card[data-item]");
    if (!card) return;
    event.preventDefault(); event.stopPropagation();
    selectedIds.has(card.dataset.item) ? selectedIds.delete(card.dataset.item) : selectedIds.add(card.dataset.item);
    applySelectionUI();
  }, true);
  document.addEventListener("click", event => {
    if (event.target.closest?.("#select-toggle")) { event.preventDefault(); event.stopPropagation(); selectMode ? exitSelectMode() : enterSelectMode(); }
  }, true);

  // ---- Fix match: pick the right entry for any source, or unlink one ----
  function resetMixCheck(item) { delete item.mixCheckedAt; delete item.mixCheckedSources; delete item.mixFailedAt; }
  function resyncAfterRelink(item, message) {
    resetMixCheck(item);
    // Saved copies of the old source's artwork would mask the new match's cover.
    ["localImageData", "localPortraitData", "localThumbnailData", "localLandscapeData", "thumbnailPath", "thumbnailMime", "localImageFiles", "localImageFingerprint"].forEach(key => delete item[key]); item.updatedAt = Date.now(); persist({ ids: [item.id] });
    if (!startSyncJob([item])) enrichLibraryEntryWithMix(item, { ...item, source: item.metadataSource }, "Fix match");
    render(); toast(message);
  }
  function openFixMatch(id) {
    const item = itemById(String(id)); if (!item) return;
    const sources = (window.SplitAppSources?.available("game", prefs) || []);
    if (!sources.length) { toast("Enable a metadata source first."); return; }
    let dialog = $("#fix-match-dialog");
    if (!dialog) { dialog = document.createElement("dialog"); dialog.id = "fix-match-dialog"; dialog.className = "choice-dialog fix-match-dialog"; document.body.appendChild(dialog); }
    const state = { id: item.id, key: sources[0].key, rows: [], busy: false, message: "" };
    const linkedLabel = key => { const link = (itemById(String(state.id))?.sourceIds || {})[key]; return link ? `Linked · ${esc(String(link).replace(/^app:/, "#"))}` : "Not linked"; };
    const paint = () => {
      const current = itemById(String(state.id)); if (!current) return;
      const linkedCount = Object.keys(current.sourceIds || {}).length;
      dialog.innerHTML = `<div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">FIX MATCH</p><h2>${esc(current.title)}</h2></div><button class="choice-dialog-close" type="button" data-fix-close aria-label="Close">×</button></header>
        <div class="fix-match-body">
          <div class="fix-match-links">${sources.map(source => `<div class="fix-match-link"><strong>${esc(source.name)}</strong><small>${linkedLabel(source.key)}${current.mixSkip?.[source.key] ? " · skipped" : ""}</small>${(current.sourceIds || {})[source.key] && linkedCount > 1 ? `<button type="button" class="button secondary small" data-fix-unlink="${esc(source.key)}">Unlink</button>` : current.mixSkip?.[source.key] ? `<button type="button" class="button secondary small" data-fix-unskip="${esc(source.key)}">Allow</button>` : ""}</div>`).join("")}</div>
          <div class="fix-match-search"><select data-fix-source aria-label="Source">${sources.map(source => `<option value="${esc(source.key)}"${source.key === state.key ? " selected" : ""}>${esc(source.name)}</option>`).join("")}</select><input type="search" data-fix-query value="${esc(state.query ?? current.title)}" placeholder="Search this source" autocomplete="off"><button type="button" class="button primary small" data-fix-search>Search</button></div>
          <p class="fix-match-status" role="status">${esc(state.message)}</p>
          <ul class="fix-match-results">${state.rows.map((row, index) => `<li><span class="fix-match-art">${row.image ? `<img src="${esc(row.image)}" alt="" loading="lazy" onerror="this.hidden=true">` : ""}</span><span class="fix-match-copy"><strong>${esc(row.title)}</strong><small>${esc([row.year, row.description].filter(Boolean).join(" · ") || row.providerId)}</small></span><button type="button" class="button primary small" data-fix-use="${index}">Use</button></li>`).join("")}</ul>
        </div>`;
    };
    const search = async () => {
      const query = dialog.querySelector("[data-fix-query]")?.value.trim() || ""; state.query = query; state.key = dialog.querySelector("[data-fix-source]")?.value || state.key;
      if (!query) return; state.message = "Searching…"; state.rows = []; paint();
      try { state.rows = (await window.SplitAppDiscovery.searchSource(query, "game", detailSettings(), state.key)).slice(0, 15); state.message = state.rows.length ? "Pick the right one." : "No results from this source."; }
      catch (error) { state.message = error?.message || "Search failed."; }
      paint();
    };
    dialog.onclick = event => {
      const current = itemById(String(state.id)); if (!current) return;
      if (event.target === dialog || event.target.closest("[data-fix-close]")) { closePopup(dialog); return; }
      if (event.target.closest("[data-fix-search]")) { search(); return; }
      const use = event.target.closest("[data-fix-use]");
      if (use) {
        const row = state.rows[Number(use.dataset.fixUse)]; if (!row) return; const key = state.key, providerId = String(row.providerId);
        current.sourceIds = { ...(current.sourceIds || {}), [key]: providerId }; current.mixPins = { ...(current.mixPins || {}), [key]: providerId };
        if (current.mixSkip) delete current.mixSkip[key];
        if (current.metadataSource === key) current.providerId = providerId;
        if (current.metadataSource === "mix" && current.mixPrimary?.key === key) current.mixPrimary = { key, providerId };
        closePopup(dialog); resyncAfterRelink(current, `Linked “${row.title}”. Fetching details…`); return;
      }
      const unlink = event.target.closest("[data-fix-unlink]");
      if (unlink) {
        const key = unlink.dataset.fixUnlink;
        if (current.sourceIds) delete current.sourceIds[key]; if (current.mixPins) delete current.mixPins[key];
        current.mixSkip = { ...(current.mixSkip || {}), [key]: true };
        if (current.mixPrimary?.key === key) delete current.mixPrimary;
        if (current.metadataSource === key) { const other = Object.entries(current.sourceIds || {})[0]; if (other) { current.metadataSource = "mix"; current.providerId = other[1]; current.mixPrimary = { key: other[0], providerId: other[1] }; } }
        closePopup(dialog); resyncAfterRelink(current, "Source unlinked. Refreshing details…"); return;
      }
      const unskip = event.target.closest("[data-fix-unskip]");
      if (unskip) { delete current.mixSkip?.[unskip.dataset.fixUnskip]; resetMixCheck(current); persist({ ids: [current.id] }); paint(); }
    };
    dialog.onchange = event => { if (event.target.matches("[data-fix-source]")) { state.key = event.target.value; state.rows = []; state.message = ""; paint(); } };
    dialog.onkeydown = event => { if (event.key === "Enter" && event.target.matches("[data-fix-query]")) { event.preventDefault(); search(); } };
    paint(); showPopup(dialog);
  }

  // ---- Cover picker ----
  function coverCandidates(item) {
    const details = item.cachedDetails || {}, urls = [];
    const steamId = String((item.sourceIds || {}).steamdb || (item.metadataSource === "steamdb" ? item.providerId : "") || "").replace(/^app:/, "");
    if (steamId) urls.push(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/library_600x900.jpg`, `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`, `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/header.jpg`);
    urls.push(details.portraitImage, details.image, details.landscapeImage, details.backgroundImage, item.image, item.backdrop);
    (details.sections || []).filter(section => section.kind === "gallery").forEach(section => (section.items || []).slice(0, 6).forEach(entry => urls.push(entry.image)));
    return [...new Set(urls.filter(url => /^https?:/i.test(url || "")))];
  }
  function openCoverPicker(id) {
    const item = itemById(String(id)); if (!item) return;
    let dialog = $("#cover-picker-dialog");
    if (!dialog) { dialog = document.createElement("dialog"); dialog.id = "cover-picker-dialog"; dialog.className = "choice-dialog cover-picker-dialog"; document.body.appendChild(dialog); }
    const urls = coverCandidates(item);
    dialog.innerHTML = `<div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">COVER</p><h2>${esc(item.title)}</h2></div><button class="choice-dialog-close" type="button" data-cover-close aria-label="Close">×</button></header>
      <div class="cover-picker-body"><p class="fix-match-status">${item.customCover ? "Using your chosen cover." : "Pick a cover; it stays even after syncs."}</p>
      <div class="cover-picker-grid">${urls.map(url => `<button type="button" class="cover-choice${item.customCover === url ? " is-current" : ""}" data-cover-url="${esc(url)}"><img src="${esc(url)}" alt="" loading="lazy" onerror="this.closest('button').hidden=true"></button>`).join("")}</div>
      ${item.customCover ? '<button type="button" class="button secondary" data-cover-auto>Use automatic cover</button>' : ""}</div>`;
    dialog.onclick = event => {
      if (event.target === dialog || event.target.closest("[data-cover-close]")) { closePopup(dialog); return; }
      const choice = event.target.closest("[data-cover-url]"), auto = event.target.closest("[data-cover-auto]");
      if (!choice && !auto) return;
      if (choice) { item.customCover = choice.dataset.coverUrl; item.image = item.customCover; } else delete item.customCover;
      item.updatedAt = Date.now(); persist({ ids: [item.id] }); closePopup(dialog); render(); toast(auto ? "Automatic cover restored." : "Cover updated.");
    };
    showPopup(dialog);
  }
  document.addEventListener("click", event => {
    const fix = event.target.closest?.("[data-fix-match]"); if (fix) { event.preventDefault(); event.stopPropagation(); openFixMatch(fix.dataset.fixMatch); return; }
    const cover = event.target.closest?.("[data-change-cover]"); if (cover) { event.preventDefault(); event.stopPropagation(); openCoverPicker(cover.dataset.changeCover); return; }
    const retry = event.target.closest?.("[data-sync-retry-one]");
    if (retry) {
      event.preventDefault(); event.stopPropagation();
      const id = retry.dataset.syncRetryOne, entry = syncJob?.entries.find(row => String(row.id) === String(id)), item = itemById(String(id));
      if (!entry || !item) return;
      entry.status = "queued"; entry.error = ""; delete item.mixFailedAt;
      if (syncJob.finished) { syncJob.finished = false; syncJob.queue = [item]; syncPersistCount = 0; runSyncJob(syncJob); } else syncJob.queue.push(item);
      updateSyncUI(); render(); return;
    }
    const ignore = event.target.closest?.("[data-sync-ignore-one]");
    if (ignore) {
      event.preventDefault(); event.stopPropagation();
      const id = ignore.dataset.syncIgnoreOne, item = itemById(String(id));
      if (item) { item.mixFailedAt = Date.now(); persist({ ids: [item.id] }); }
      if (syncJob) { syncJob.entries = syncJob.entries.filter(row => String(row.id) !== String(id)); if (!syncJob.entries.length) syncJob = null; }
      updateSyncUI(); render();
    }
  }, true);

  // ---- Import: spot near-duplicates (edition names, missing years) before they are added ----
  const EDITION_WORDS = /\b(definitive|complete|ultimate|deluxe|enhanced|special|gold|standard|anniversary|remastered|remaster|game of the year|goty|directors cut|director s cut|digital|premium)\b( edition| cut| collection| version)?/g;
  function dupTitleKey(title) {
    return normalizeLibraryTitle(title).replace(/^the /, "").replace(EDITION_WORDS, " ").replace(/\s+/g, " ").trim();
  }
  const yearOfItem = item => String(item?.year || item?.originYear || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "";
  function splitSimilarImports(fresh) {
    const library = new Map();
    items.forEach(entry => { const key = `${entry.category || "game"}:${dupTitleKey(entry.title)}`; if (key.length > 6 && !library.has(key)) library.set(key, entry); });
    const kept = [], similar = [], exact = [], seen = new Map();
    for (const entry of fresh) {
      const key = `${entry.category || "game"}:${dupTitleKey(entry.title)}`;
      const hit = library.get(key) || seen.get(key);
      const compatible = hit && (!yearOfItem(hit) || !yearOfItem(entry) || yearOfItem(hit) === yearOfItem(entry));
      if (hit && compatible && key.length > 6) {
        // Same title once punctuation/case is ignored = plainly already there; only edition-name differences need a decision.
        if (normalizeLibraryTitle(hit.title) === normalizeLibraryTitle(entry.title)) exact.push(entry);
        else similar.push({ item: entry, matchTitle: hit.title, keep: false });
      } else { kept.push(entry); seen.set(key, entry); }
    }
    return { kept, similar, exact };
  }

  const enabledGameSourceKeys = () => (window.SplitAppSources?.available("game", prefs) || []).map(source => source.key).sort();
  // A game needs a (re)sync when it was never fetched, a newly enabled source hasn't been tried on it, it is older than
  // the refresh interval, or a previous attempt failed more than a few hours ago. Everything else is skipped.
  function needsMixSync(item, enabled = enabledGameSourceKeys()) {
    if (!item.cachedDetails) return !item.mixFailedAt || Date.now() - item.mixFailedAt > 6 * 3600000;
    // Merged with a source that is switched off right now: leave it alone until that source is back (its data stays).
    if (Object.keys(item.sourceIds || {}).some(key => !enabled.includes(key))) return false;
    if (item.mixFailedAt && Date.now() - item.mixFailedAt > 30 * 60000) return true; // a known source didn't answer last time
    // Sources already tried on this game (older saves only know the ones that answered).
    const tried = new Set(item.mixCheckedSources || [...(item.mixSourceKeys || []), ...(item.facts?.sources || [])]);
    if (enabled.some(key => !tried.has(key) && !item.mixSkip?.[key])) return true;
    const maxAge = { daily: 86400000, weekly: 604800000, monthly: 2592000000, never: Infinity }[prefs.metadataRefreshInterval] ?? 604800000;
    const stamp = Number(item.mixCheckedAt || item.cachedDetails?.fetchedAt || item.facts?.fetchedAt) || 0;
    return !stamp || Date.now() - stamp >= maxAge;
  }
  let upToDateAt = 0;
  // Pull-to-refresh on the library: sync only what needs it. Pulling again right after "all up to date" forces every game.
  function syncUnsyncedGames() {
    const active = new Set(syncJob && !syncJob.finished ? syncJob.entries.filter(e => e.status === "queued" || e.status === "syncing").map(e => e.id) : []);
    const enabled = enabledGameSourceKeys(), force = Date.now() - upToDateAt < 20000;
    const games = items.filter(item => item.category === "game" && !active.has(item.id));
    const pending = force ? games : games.filter(item => needsMixSync(item, enabled));
    if (!pending.length) { upToDateAt = Date.now(); toast(active.size ? "Sync is already running." : games.length ? "Everything is up to date. Pull again to re-check all games." : "No games to sync."); return; }
    upToDateAt = 0;
    if (!startSyncJob(pending)) { toast(prefs.metadataMode === "offline" || !navigator.onLine ? "Go online to sync metadata." : "No metadata sources are enabled."); return; }
    toast(`Syncing ${pending.length} of ${games.length} ${games.length === 1 ? "game" : "games"}${force ? "" : " that need it"}.`);
  }
  // Pull to refresh on the requested library, activity, discovery, statistics, and source pages.
  (() => {
    const THRESHOLD = 72, MAX = 130; let ptr = null, startY = 0, candidate = false, pulling = false, distance = 0, busy = false;
    const element = () => {
      if (ptr) return ptr;
      ptr = document.createElement("div"); ptr.className = "ptr"; ptr.setAttribute("role", "status"); ptr.setAttribute("aria-live", "polite");
      ptr.innerHTML = '<span class="ptr-bubble"><svg class="ptr-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg><span class="ptr-spinner"></span><svg class="ptr-check" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></span><span class="ptr-text"></span>';
      document.body.appendChild(ptr); return ptr;
    };
    const show = (state, text, offset) => { const el = element(); el.dataset.state = state; el.querySelector(".ptr-text").textContent = text; el.style.setProperty("--pull", `${offset}px`); el.style.setProperty("--turn", `${Math.min(1, offset / THRESHOLD) * 180}deg`); el.classList.add("show"); };
    const hide = () => { if (ptr) { ptr.classList.remove("show"); ptr.dataset.state = ""; ptr.style.setProperty("--pull", "0px"); } };
    const allowed = target => {
      const settingsSourcePage = page === "settings" && ["metadata-sources", "source-options", "custom-source"].includes(settingsGroup);
      const refreshable = ["dashboard", "timeline", "statistics", "discover", "details"].includes(page) || settingsSourcePage;
      return refreshable && !busy && window.scrollY <= 0 && !target.closest?.("input, textarea, select, button, a, label, dialog, [draggable=true], [role=button], [data-detail-image-src], .detail-carousel, .detail-gallery, .discover-rail, .ep-ratings-scroll, .season-pills, .detail-tabs");
    };
    const handleTouchMove = event => move(event.touches[0].clientY, event);
    const begin = (y, target) => {
      candidate = allowed(target); startY = y; pulling = false; distance = 0;
      if (candidate) document.addEventListener("touchmove", handleTouchMove, { passive: false });
    };
    const move = (y, event) => {
      if (!candidate) return;
      const dy = y - startY;
      if (dy <= 6 || window.scrollY > 0) { if (pulling) { pulling = false; hide(); } return; }
      pulling = true; distance = Math.min(MAX, dy * .55);
      if (event.cancelable) event.preventDefault();
      show(distance >= THRESHOLD ? "ready" : "pull", distance >= THRESHOLD ? "Release to refresh" : "Pull to refresh", distance);
    };
    const finish = async () => {
      const shouldRefresh = pulling && distance >= THRESHOLD; candidate = false; pulling = false;
      if (!shouldRefresh) { hide(); return; }
      busy = true; show("loading", "Refreshing…", 62);
      try { await refreshCurrentPage(); show("done", "Updated", 62); }
      catch (_) { show("done", "Could not refresh", 62); }
      await new Promise(resolve => setTimeout(resolve, 650)); hide(); busy = false;
    };
    const finishTouch = async () => {
      document.removeEventListener("touchmove", handleTouchMove);
      await finish();
    };
    const cancelTouch = () => { document.removeEventListener("touchmove", handleTouchMove); candidate = false; pulling = false; hide(); };
    document.addEventListener("touchstart", event => begin(event.touches[0].clientY, event.target), { passive: true });
    document.addEventListener("touchend", finishTouch); document.addEventListener("touchcancel", cancelTouch);
    let mouseDown = false;
    document.addEventListener("mousedown", event => { if (event.button !== 0 || event.target.closest("button, a, label")) return; mouseDown = true; begin(event.clientY, event.target); });
    document.addEventListener("mousemove", event => { if (mouseDown) move(event.clientY, event); });
    document.addEventListener("mouseup", () => { if (mouseDown) { mouseDown = false; finish(); } });
  })();

  $("[data-close-setting-picker]")?.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closePopup($("#setting-picker-dialog")); });
  function syncRouteFromHash() {
    const [hashPath, hashQuery = ""] = location.hash.slice(1).split("?");
    const route = hashPath.split("/"); const next = route[0];
    if (next === "search") { page = "dashboard"; settingsGroup = null; historyPush(); render(); syncPageNavigation(); return; }
    if (!(next in titles)) return;
    rememberScroll();
    const previousPage = page;
    if (previousPage === "details" && next !== "details") { detailRequest++; detailLoading = false; }
    if (next !== "discover") { discoverQuery = ""; discoverSubmitted = ""; discoverRequestId++; }
    if (next !== "add") { addMetadataQuery = ""; addMetadataRequestId++; entryDraftId = null; }
    else if (previousPage !== "add") { entryDraftId = null; addMetadataQuery = ""; } // opening Add from a link/back is a new entry
    const previousDiscoverSource = discoverSource;
    discoverSource = next === "discover" ? new URLSearchParams(hashQuery).get("source") || "" : "";
    page = next; settingsGroup = next === "settings" ? (route[1] === "manage-backups" ? "backups" : route[1] || null) : null;
    statsSubpage = next === "statistics" && statsSections.includes(route[1]) ? normalizeStatsSection(route[1]) : "";
    settingsParam = next === "settings" ? new URLSearchParams(hashQuery).get("id") || "" : "";
    document.body.dataset.navDir = "back";
    if (next === "details") {
      const id = detailIdFromQuery(hashQuery);
      const changedDetail = Boolean(id && id !== detailItemId);
      if (changedDetail) { detailItemId = id; detailPreview = null; detailData = null; detailError = ""; }
      if (!detailRestorePending && !detailPreview && !items.some(item => String(item.id) === String(detailItemId))) { redirectHomeIfDetailMissing(); return; }
      if (changedDetail || previousPage !== "details") { render(); syncPageNavigation(); loadDetails(); return; }
    }
    render(); syncPageNavigation(); restoreScroll();
    if (next === "discover" && previousDiscoverSource !== discoverSource && discoverQuery.trim()) submitDiscover();
  }
  document.addEventListener("keydown", event => { if (event.key === "Enter" && event.target?.id === "mix-query") { event.preventDefault(); runMixSearch(); } });
  window.addEventListener("popstate", event => {
    if (skipNextPop) { skipNextPop = false; event.stopImmediatePropagation(); return; }
    const open = document.querySelector("dialog[open]");
    if (open && dialogEntries > 0) { dialogEntries -= 1; closingFromPop = true; closePopup(open); closingFromPop = false; event.stopImmediatePropagation(); }
  });
  // Tapping the dimmed area outside a sheet/dialog closes it.
  document.addEventListener("click", event => {
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePopup(dialog);
  });
  window.addEventListener("popstate", syncRouteFromHash);
  // Android hardware back: close an open sheet, then step back through pages, then leave the app from Home.
  // Show the version that is actually installed (from the APK), not the one baked into app-config.js.
  window.Capacitor?.Plugins?.App?.getInfo?.().then(info => {
    if (!info?.version) return;
    window.APP_INSTALLED_VERSION = info.version;
    if (page === "settings" && settingsGroup === "app-info") render();
  }).catch(() => {});
  window.Capacitor?.Plugins?.App?.addListener?.("backButton", () => {
    const openDialog = document.querySelector("dialog[open]");
    if (openDialog) { closePopup(openDialog); return; }
    const backRoute = currentPageBackRoute();
    if (backRoute) { navigateBackTo(backRoute); return; }
    if (window.history.length > 1 && inAppNav) { window.history.back(); return; }
    if (page !== "dashboard") { navigateBackTo("dashboard"); return; }
    window.Capacitor.Plugins.App.exitApp?.();
  });
  window.addEventListener("hashchange", syncRouteFromHash);
  window.addEventListener("storage", event => { if (event.key === storageKey) toast("Library changed in another tab."); });
  window.addEventListener("beforeunload", flushPersist);
  // Save battery: metadata sync stops while the app is in the background and resumes when it comes back.
  let syncAutoPaused = false;
  function applyBackgroundState(hidden) {
    if (hidden) {
      flushPersist();
      if (prefs.pauseSyncInBackground !== false && syncJob && !syncJob.finished && !syncJob.paused) { syncAutoPaused = true; setSyncPaused(true, { quiet: true }); }
    } else if (syncAutoPaused) { syncAutoPaused = false; if (syncJob && !syncJob.finished && syncJob.paused) setSyncPaused(false, { quiet: true }); }
  }
  document.addEventListener("visibilitychange", () => applyBackgroundState(document.visibilityState === "hidden"));
  try { window.Capacitor?.Plugins?.App?.addListener?.("appStateChange", state => applyBackgroundState(!state?.isActive)); } catch (_) {}
  window.addEventListener("error", event => recordLog("error", event.message || "Unknown page error"));
  window.addEventListener("unhandledrejection", event => recordLog("error", event.reason?.message || event.reason || "Unhandled promise rejection"));
  async function restoreNativeData({ fast = false } = {}) {
    if (!window.SplitAppBackend?.load) return;
    const initialRevision = localMutationRevision;
    const initialItems = new Map(items.map(item => [String(item.id), JSON.stringify(item)]));
    const initialPreferences = JSON.parse(JSON.stringify(prefs));
    try {
      const restored = await window.SplitAppBackend.load({ fast });
      if (!restored) return null; // nothing stored locally: caller runs the full restore
      // Runtime-only artwork already loaded for the visible list survives the library swap.
      const runtimeArt = new Map(items.filter(item => item.localPortraitData || item.localThumbnailData || item.localLandscapeData).map(item => [String(item.id), item]));
      if (runtimeArt.size && Array.isArray(restored.items)) restored.items.forEach(item => {
        const old = runtimeArt.get(String(item.id));
        if (old) { item.localPortraitData = old.localPortraitData; item.localThumbnailData = old.localThumbnailData; item.localLandscapeData = old.localLandscapeData; }
      });
      const nativeItems = Array.isArray(restored.items) ? restored.items.filter(item => config.categories.some(category => category.key === item.category)) : items;
      // A game saved without a status would not appear under any Home group; give it the default one.
      const repairedIds = nativeItems.filter(item => item && !item.status).map(item => { item.status = prefs.defaultStatus || defaultStatus(item.category); return item.id; });
      if (repairedIds.length) persist({ ids: repairedIds });
      const nativeHistory = Array.isArray(restored.history) ? restored.history : history;
      const nativePreferences = restored.preferences && typeof restored.preferences === "object" ? restored.preferences : {};
      if (localMutationRevision === initialRevision) {
        items = nativeItems;
        history = nativeHistory;
        if (restored.loadedFromFolder) {
          Object.keys(prefs).forEach(key => delete prefs[key]);
          Object.assign(prefs, JSON.parse(JSON.stringify(prefsDefaults)), nativePreferences);
        } else Object.assign(prefs, nativePreferences);
      } else {
        const currentItems = new Map(items.map(item => [String(item.id), item]));
        const mergedItems = new Map(nativeItems.map(item => [String(item.id), item]));
        for (const id of initialItems.keys()) if (!currentItems.has(id)) mergedItems.delete(id);
        for (const [id, item] of currentItems) {
          if (!initialItems.has(id) || initialItems.get(id) !== JSON.stringify(item)) mergedItems.set(id, item);
        }
        items = [...mergedItems.values()];
        history = [...new Map([...history, ...nativeHistory].map(entry => [JSON.stringify(entry), entry])).values()];
        for (const [key, value] of Object.entries(prefs)) {
          if (JSON.stringify(value) !== JSON.stringify(initialPreferences[key])) nativePreferences[key] = value;
        }
        Object.assign(prefs, nativePreferences);
      }
      dashboardSortedItemsCache = null;
      normalizeDashboardView();
      delete prefs.defaultCategory;
      delete prefs.appLook;
      delete prefs.appDisplayName;
      refreshSourceRegistry();
      normalizeNavigationPrefs();
      if (!restored.fast) await window.SplitAppBackend.save({ items, history, preferences: prefs });
      return true;
    } catch (error) {
      recordLog("error", `App data restore failed: ${error.message || error}`);
      const message = $("#storage-folder-gate-message");
      if (message) message.textContent = `${error.message || "SavePoint could not open its database folder."} Select a storage folder to continue.`;
      return false;
    }
  }
  const storageFolderGate = $("#storage-folder-gate");
  const nativeFolderStorage = Boolean(window.SplitAppBackend?.isNativeFolderStorageAvailable?.());
  const folderGateRetry = $("#storage-folder-gate-retry");
  folderGateRetry?.addEventListener("click", async () => {
    folderGateRetry.disabled = true;
    try {
      const selected = await window.SplitAppBackend.chooseFolder({ items, history, preferences: prefs });
      applySelectedFolderData(selected);
      await window.SplitAppBackend.save({ items, history, preferences: prefs });
      if (storageFolderGate) storageFolderGate.hidden = true;
      detailRestorePending = false;
      redirectHomeIfDetailMissing();
      applyPreferences(); render(); syncBackupSchedule();
    } catch (error) {
      const message = $("#storage-folder-gate-message");
      if (message) message.textContent = `${error.message || "SavePoint could not open that folder."} Choose a folder to continue.`;
    } finally { folderGateRetry.disabled = false; }
  });
  applyPreferences();
  render();
  if (page === "details" && detailItemId) loadDetails();
  // Keep the splash until the saved library is loaded (never longer than 1.5s, so a storage-folder prompt stays reachable).
  setTimeout(() => window.SavePointSplash?.ready?.(), 1500);
  const finishStartup = success => {
    if (!success) {
      if (nativeFolderStorage && storageFolderGate) storageFolderGate.hidden = false;
      else {
        detailRestorePending = false;
        redirectHomeIfDetailMissing();
      }
      return;
    }
    if (storageFolderGate) storageFolderGate.hidden = true;
    detailRestorePending = false;
    const redirectedFromMissingDetail = redirectHomeIfDetailMissing();
    applyPreferences(); render(); syncBackupSchedule();
    if (!redirectedFromMissingDetail && page === "details" && detailItemId && !detailPreview) loadDetails();
  };
  // Phase 1: paint the library straight from IndexedDB (instant). Phase 2: reconcile with the
  // saved folder / encrypted store in the background and fill the artwork cache.
  restoreNativeData({ fast: true }).then(async fastResult => {
    if (fastResult === true) {
      requestAnimationFrame(() => window.SavePointSplash?.ready?.());
      finishStartup(true);
      await new Promise(resolve => setTimeout(resolve, 2500));
      const libraryStamp = () => `${items.length}:${items.reduce((sum, item) => sum + (Number(item.updatedAt) || 0), 0)}`;
      const before = libraryStamp();
      const full = await restoreNativeData();
      if (full === false) finishStartup(false);
      else if (full && libraryStamp() !== before) { applyPreferences(); render(); } // keep scroll position when nothing changed
      setTimeout(fillThumbCache, 1500);
      return;
    }
    const full = await restoreNativeData();
    requestAnimationFrame(() => window.SavePointSplash?.ready?.());
    finishStartup(full);
    setTimeout(fillThumbCache, 3000);
  });
})();
