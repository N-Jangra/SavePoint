// Experimental "Mix fetch": search every enabled source as one plain list, then fetch and merge details from all of them.
(() => {
  const { merge } = window.SplitAppMixMerge;
  const metadata = window.SplitAppMetadata;
  const discovery = window.SplitAppDiscovery;
  const controller = window.SplitAppDetailController;
  const category = "game";
  const norm = title => String(title || "").toLowerCase().replace(/[™®©]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/^the /, "").trim();
  const yearOf = value => String(value || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "";
  const SOURCE_GRACE_MS = 4000;
  // Background sync (e.g. after Import List) has no one waiting, so give slower sources such as
  // HowLongToBeat time to answer; a short grace dropped them and left only the first (Steam) data.
  const BACKGROUND_GRACE_MS = 14000;
  const withTimeout = (promise, ms = 15000) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))]);

  // Session memo with in-flight sharing. Mix fetch asks every source about the same title,
  // and POST-based sources (HowLongToBeat, IGDB) are not covered by the HTTP cache.
  const memo = new Map();
  const memoized = (key, run, bypass = false, ttl = 10 * 60 * 1000) => {
    const hit = memo.get(key);
    if (!bypass && hit && Date.now() - hit.at < ttl) return hit.promise;
    const promise = run();
    memo.set(key, { at: Date.now(), promise });
    promise.catch(() => { if (memo.get(key)?.promise === promise) memo.delete(key); });
    if (memo.size > 600) memo.delete(memo.keys().next().value);
    return promise;
  };
  const searchSource = (title, settings, key) => memoized(`s|${key}|${norm(title)}`, () => discovery.searchSource(title, category, settings, key), Boolean(settings.forceRefresh));
  const loadDetails = (key, providerId, item, settings) => memoized(`d|${key}|${providerId}|${item.title}`, () => controller.load(item, settings), Boolean(settings.forceRefresh));

  // One plain list: the same game from several sources becomes one row with a chip per source.
  async function search(query, settings = {}) {
    const results = await discovery.search(query, category, settings);
    const groups = new Map();
    for (const row of results) {
      const titleKey = norm(row.title); if (!titleKey) continue;
      const year = yearOf(row.year);
      const key = `${titleKey}|${year}`;
      if (!groups.has(key)) groups.set(key, { key, title: row.title, year: row.year || "", image: row.image || "", sources: [] });
      const group = groups.get(key);
      if (!group.year && row.year) group.year = row.year;
      if (row.image && (row.source === "howlongtobeat" || !group.image)) group.image = row.image;
      if (!group.sources.includes(row.source)) group.sources.push(row.source);
    }
    return [...groups.values()].slice(0, 40);
  }

  const bestMatch = (rows, title, year = "") => {
    const target = norm(title);
    const targetYear = yearOf(year);
    const titleMatches = rows.filter(row => norm(row.title) === target);
    if (targetYear && titleMatches.length) return titleMatches.find(row => yearOf(row.year) === targetYear) || titleMatches.find(row => !yearOf(row.year)) || null;
    if (titleMatches.length) return titleMatches.length === 1 ? titleMatches[0] : null;
    return rows.find(row => { const name = norm(row.title); return name.includes(target) || target.includes(name); }) || null;
  };

  // Fetch details from every enabled source that knows this game, then merge.
  async function load(item, settings = {}, onPartial = null) {
    const title = item.title;
    if (!title) throw new Error("This game has no title to look up.");
    const sources = metadata.available(category, settings);
    if (!sources.length) throw new Error("Enable at least one metadata source first.");
    const completedEntries = [];
    const tasks = sources.map(async (source, order) => {
      const rows = await withTimeout(searchSource(title, settings, source.key));
      const match = bestMatch(rows, title, item.year);
      if (!match) throw new Error("No match");
      const data = await withTimeout(loadDetails(source.key, match.providerId, { ...item, category, metadataSource: source.key, providerId: match.providerId, title: match.title, image: match.image || item.image, url: match.url || item.url, year: match.year || item.year, description: match.description || item.description }, settings));
      const entry = { key: source.key, name: source.name, data, order };
      completedEntries.push(entry);
      if (typeof onPartial === "function") {
        try { onPartial(merge([...completedEntries], title, item), entry); } catch (_) {}
      }
      return entry;
    });
    // Don't let one slow or dead source hold the whole game hostage: once any source has
    // answered, give the others a short grace period, then merge what we have. Stragglers
    // keep running and still reach onPartial when they finish.
    const entries = await new Promise(resolve => {
      const ok = []; let pending = tasks.length, timer = 0, finished = false;
      const finish = () => { if (finished) return; finished = true; clearTimeout(timer); resolve(ok.slice().sort((a, b) => a.order - b.order)); };
      tasks.forEach(task => task.then(entry => { ok.push(entry); if (!timer && !finished) timer = setTimeout(finish, settings.background ? BACKGROUND_GRACE_MS : SOURCE_GRACE_MS); }, () => {}).finally(() => { if (--pending === 0) finish(); }));
    });
    if (!entries.length) throw new Error(`No enabled source had details for “${title}”.`);
    // Background sync merges in the data worker so the page stays responsive.
    return settings.background && window.SplitAppIDB?.merge ? window.SplitAppIDB.merge(entries, title, item) : merge(entries, title, item);
  }

  // Play-time only lookup for games whose saved provider (e.g. Steam) has no hours: HowLongToBeat first, then RAWG.
  async function hours(title, settings = {}) {
    const enabled = new Set(metadata.available(category, settings).map(source => source.key));
    for (const key of ["howlongtobeat", "rawg"]) {
      if (!enabled.has(key)) continue;
      try {
        const match = bestMatch(await withTimeout(discovery.searchSource(title, category, settings, key)), title);
        if (!match) continue;
        const data = await withTimeout(controller.load({ category, metadataSource: key, providerId: match.providerId, title: match.title, image: match.image, url: match.url, year: match.year }, settings));
        const facts = data.facts || {};
        if (facts.mainHours || facts.averageHours) return { mainHours: facts.mainHours || 0, extrasHours: facts.extrasHours || 0, completionistHours: facts.completionistHours || 0, averageHours: facts.averageHours || 0, hoursSource: key };
      } catch (_) { /* try the next source */ }
    }
    return null;
  }

  window.SplitAppMix = Object.freeze({ search, load, merge, norm, hours });
})();
