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
  const withTimeout = (promise, ms = 15000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out")), ms);
    Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
  // Many games are synced at once, and HowLongToBeat (and Steam) rate-limit or time out when hit by dozens of requests together;
  // that made a pull-to-recheck "fail" and then work on retry. Each source gets only a few requests in flight.
  const LIMITS = { howlongtobeat: 2, steamdb: 4, rawg: 3, igdb: 3 };
  const lanes = new Map();
  const inLane = (key, run) => {
    const lane = lanes.get(key) || { active: 0, queue: [] }; lanes.set(key, lane);
    const max = LIMITS[key] || 4;
    return new Promise((resolve, reject) => {
      const start = () => { lane.active++; Promise.resolve().then(run).then(resolve, reject).finally(() => { lane.active--; lane.queue.shift()?.(); }); };
      lane.active < max ? start() : lane.queue.push(start);
    });
  };
  const isTransient = error => !/^(No match|Enable at least|This game has no title)/i.test(error?.message || "");
  // One quiet retry for timeouts / flaky responses (never for "No match").
  const retrying = async (run, settings = {}) => {
    const tries = (settings.background ? Math.max(0, Math.min(5, Number(settings.syncRetries ?? 1))) : 1) + 1;
    const pause = settings.background ? Math.max(0, Number(settings.syncRetryDelay ?? 3)) * 1000 : 900;
    let last;
    for (let attempt = 0; attempt < tries; attempt++) {
      try { return await run(); } catch (error) { last = error; if (!isTransient(error) || attempt === tries - 1) break; await new Promise(resolve => setTimeout(resolve, pause * (attempt + 1))); }
    }
    throw last;
  };
  // Same game when one title is the other plus a subtitle ("DOOM" / "DOOM Eternal" are NOT; "Mafia II" / "Mafia II: Definitive Edition" are).
  const sameGameTitle = (a, b) => {
    const x = norm(a), y = norm(b); if (!x || !y) return true;
    if (x === y) return true;
    const strip = value => value.replace(/\b(?:19|20)\d{2}\b/g, " ").replace(/\b(definitive|complete|ultimate|deluxe|enhanced|special|goty|game of the year|director s cut|directors cut|anniversary|gold|standard|remastered|remake|edition|collection|digital|premium)\b/g, " ").replace(/\s+/g, " ").trim();
    return strip(x) === strip(y);
  };

  // Session memo with in-flight sharing. Mix fetch asks every source about the same title,
  // and POST-based sources (HowLongToBeat, IGDB) are not covered by the HTTP cache.
  const memo = new Map();
  const memoized = (key, run, bypass = false, ttl = 10 * 60 * 1000) => {
    const hit = memo.get(key);
    if (!bypass && hit && Date.now() - hit.at < ttl) return hit.promise;
    const promise = run();
    memo.set(key, { at: Date.now(), promise });
    promise.catch(() => { if (memo.get(key)?.promise === promise) memo.delete(key); });
    const now = Date.now();
    for (const [oldKey, oldValue] of memo) if (now - oldValue.at >= ttl) memo.delete(oldKey);
    while (memo.size > 200) memo.delete(memo.keys().next().value);
    return promise;
  };
  const waitFor = settings => settings.background ? Math.max(5, Number(settings.syncTimeout) || 20) * 1000 : (window.Capacitor?.isNativePlatform?.() ? 35000 : 25000);
  const searchSource = (title, settings, key) => memoized(`s|${key}|${norm(title)}`, () => inLane(key, () => withTimeout(discovery.searchSource(title, category, settings, key), waitFor(settings))), Boolean(settings.forceRefresh));
  const loadDetails = (key, providerId, item, settings) => memoized(`d|${key}|${providerId}|${item.title}`, () => inLane(key, () => withTimeout(controller.load(item, settings), waitFor(settings))), Boolean(settings.forceRefresh));
  const NO_MATCH_TTL = 14 * 86400000;

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
    // Steam rows have no release year, so they never shared a group with HowLongToBeat's "Portal (2007)".
    // Fold a yearless group into the first same-title group that has a year and doesn't already list its sources.
    const ordered = [...groups.values()];
    for (const group of ordered) {
      if (group.year) continue;
      const home = ordered.find(other => other !== group && other.year && norm(other.title) === norm(group.title) && !group.sources.some(src => other.sources.includes(src)));
      if (!home) continue;
      home.sources.push(...group.sources);
      if (!home.image && group.image) home.image = group.image;
      group.merged = true;
    }
    return ordered.filter(group => !group.merged).slice(0, 40);
  }

  const bestMatch = (rows, title, year = "") => {
    const target = norm(title);
    const targetYear = yearOf(year);
    const titleMatches = rows.filter(row => norm(row.title) === target);
    if (targetYear && titleMatches.length) {
      const near = titleMatches.find(row => yearOf(row.year) === targetYear) || titleMatches.find(row => !yearOf(row.year));
      if (near) return near;
      // Sources disagree on release years (early access, re-releases): one exact title within two years is still the same game.
      const close = titleMatches.filter(row => Math.abs(Number(yearOf(row.year)) - Number(targetYear)) <= 2);
      return close.length === 1 ? close[0] : null;
    }
    if (titleMatches.length) return titleMatches.length === 1 ? titleMatches[0] : null;
    // Loose fallback only for real edition/subtitle forms ("Mafia II: Definitive Edition"); "Control" must never match "Control Resonant".
    const subtitled = (long, short) => long.startsWith(short + " ") && /^[\s]*(definitive|remastered|remake|complete|ultimate|deluxe|enhanced|special|goty|game of the year|director|anniversary|gold|standard|edition)/.test(long.slice(short.length + 1));
    return rows.find(row => { const name = norm(row.title); return name === target || subtitled(name, target) || subtitled(target, name); }) || null;
  };

  // Fetch details from every enabled source that knows this game, then merge.
  async function load(item, settings = {}, onPartial = null) {
    const title = item.title;
    if (!title) throw new Error("This game has no title to look up.");
    let sources = metadata.available(category, settings).filter(source => !item.mixSkip?.[source.key]);
    if (!sources.length) throw new Error("Enable at least one metadata source first.");
    const completedEntries = [];
    // The source the game was saved from stays authoritative: it is looked up by its saved id (no title search),
    // leads the merge, and a mix that lost it is rejected so another catalog can't overwrite its data.
    const mixed = item.metadataSource === "mix";
    const primaryKey = (mixed ? item.mixPrimary?.key : item.metadataSource) || "";
    const primaryId = (mixed ? item.mixPrimary?.providerId : item.providerId) || "";
    const hasPrimary = Boolean(primaryKey && primaryId && sources.some(source => source.key === primaryKey));
    // Sources pinned by id (e.g. after merging two library cards) are looked up directly, not by title search.
    // item.sourceIds is the per-game index of every source that has matched before (key -> provider id): known
    // sources are fetched by id and, like the saved source, must answer or the existing merged data is kept.
    const pins = { ...(item.sourceIds || {}), ...(item.mixPins || {}) }; if (hasPrimary) pins[primaryKey] = primaryId;
    // Sync settings: at most N sources per game (linked sources always stay), and sources not ticked for sync are never searched for unlinked games.
    const capped = new Set(), maxSources = settings.background ? Math.max(0, Number(settings.syncMaxSources) || 0) : 0;
    if (maxSources > 0) {
      const linked = sources.filter(source => pins[source.key]), keep = new Set([...linked, ...sources.filter(source => !pins[source.key])].slice(0, Math.max(maxSources, linked.length)).map(source => source.key));
      sources.forEach(source => { if (!keep.has(source.key)) capped.add(source.key); });
      sources = sources.filter(source => keep.has(source.key));
    }
    // A known source that is merely switched off counts as expected too: syncing with it disabled must not strip its data.
    const isKnownSource = key => sources.some(source => source.key === key) || (window.SplitAppSources?.list?.() || []).some(source => source.key === key);
    const expected = new Set(Object.keys(pins).filter(isKnownSource));
    const waiting = new Set([...expected].filter(key => sources.some(source => source.key === key)));
    // Sources that gave a definite answer (matched, or searched and found nothing). A timeout / block is NOT an answer,
    // so that source is retried on the next refresh instead of being recorded as "checked".
    const answered = new Set(), noMatch = new Set(), failures = [];
    const tasks = sources.map(async (source, rank) => {
      const isPrimary = hasPrimary && source.key === primaryKey, order = isPrimary ? -1 : rank;
      let match;
      if (pins[source.key]) match = { providerId: pins[source.key], title: item.title, image: item.image, url: item.url, year: item.year, description: item.description };
      else {
        if (settings.background && Array.isArray(settings.syncOnly) && !settings.syncOnly.includes(source.key)) { answered.add(source.key); throw new Error("No match"); } // not ticked for sync
        // A source that already said "no such game" is not searched again on every refresh (that was most of the wait); Fix match or a forced pull re-checks it.
        const checkedNoMatch = Number(item.mixNoMatch?.[source.key]) > Date.now() - NO_MATCH_TTL && !settings.forceRefresh;
        if (checkedNoMatch) { answered.add(source.key); noMatch.add(source.key); throw new Error("No match"); }
        const rows = await retrying(() => searchSource(title, settings, source.key), settings);
        match = bestMatch(rows, title, item.year);
        answered.add(source.key);
        if (!match) { if (rows.length) noMatch.add(source.key); throw new Error("No match"); } // an empty list may just be a blocked source, so it is not remembered
      }
      const data = await retrying(() => loadDetails(source.key, match.providerId, { ...item, category, metadataSource: source.key, providerId: match.providerId, title: match.title, image: match.image || item.image, url: match.url || item.url, year: match.year || item.year, description: match.description || item.description }, settings), settings);
      const entry = { key: source.key, name: source.name, data, order, providerId: match.providerId };
      completedEntries.push(entry);
      if (typeof onPartial === "function" && [...expected].every(key => completedEntries.some(done => done.key === key))) {
        try { onPartial(merge([...completedEntries].sort((a, b) => a.order - b.order), title, item), entry); } catch (_) {}
      }
      return entry;
    });
    // Don't let one slow or dead source hold the whole game hostage: once any source has
    // answered, give the others a short grace period, then merge what we have. Stragglers
    // keep running and still reach onPartial when they finish.
    const entries = await new Promise(resolve => {
      const ok = []; let pending = tasks.length, timer = 0, finished = false;
      const finish = () => { if (finished) return; finished = true; clearTimeout(timer); resolve(ok.slice().sort((a, b) => a.order - b.order)); };
      const arm = () => { if (!timer && !finished && ok.length && !waiting.size) timer = setTimeout(finish, settings.background ? BACKGROUND_GRACE_MS : SOURCE_GRACE_MS); };
      tasks.forEach((task, n) => task.then(entry => { ok.push(entry); waiting.delete(entry.key); arm(); }, error => { if (error?.message !== "No match") failures.push(`${sources[n].name}: ${error?.message || "failed"}`); waiting.delete(sources[n].key); arm(); }).finally(() => { if (--pending === 0) finish(); }));
    });
    const fail = (message, transient) => Object.assign(new Error(message), { transient });
    if (!entries.length) throw fail(`No enabled source had details for “${title}”${failures.length ? ` (${failures[0]})` : ""}.`, failures.length > 0);
    // Never downgrade: a source that matched this game before must answer again, otherwise keep what is saved.
    const missing = [...expected].filter(key => !entries.some(entry => entry.key === key));
    if (missing.length) throw fail(`Known source${missing.length > 1 ? "s" : ""} (${missing.join(", ")}) did not answer, keeping the existing data.`, true);
    // Background sync merges in the data worker so the page stays responsive.
    const result = await (settings.background && window.SplitAppIDB?.merge ? window.SplitAppIDB.merge(entries, title, item) : merge(entries, title, item));
    result.checkedSources = [...new Set([...answered, ...capped, ...entries.map(entry => entry.key)])].sort();
    // Which game each source actually matched (shown in Fix match), which sources said "no such game", and matches worth a second look.
    result.sourceMeta = Object.fromEntries(entries.map(entry => [entry.key, { title: entry.data?.title || "", year: entry.data?.year || "", url: entry.data?.url || "", image: entry.data?.portraitImage || entry.data?.image || "" }]));
    result.noMatchSources = [...noMatch].filter(key => !entries.some(entry => entry.key === key));
    result.reviewFlags = entries.filter(entry => !item.mixPins?.[entry.key] && entry.data?.title && !sameGameTitle(entry.data.title, title)).map(entry => ({ key: entry.key, title: entry.data.title, providerId: String(entry.providerId ?? "") }));
    return result;
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
