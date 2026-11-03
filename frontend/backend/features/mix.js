// Experimental "Mix fetch": search every enabled source as one plain list, then fetch and merge details from all of them.
(() => {
  const metadata = window.SplitAppMetadata;
  const discovery = window.SplitAppDiscovery;
  const controller = window.SplitAppDetailController;
  const category = "game";
  const norm = title => String(title || "").toLowerCase().replace(/[™®©]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/^the /, "").trim();
  const isEmpty = value => value == null || value === "" || value === 0 || (Array.isArray(value) && !value.length);
  const withTimeout = (promise, ms = 25000) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))]);

  // One plain list: the same game from several sources becomes one row with a chip per source.
  async function search(query, settings = {}) {
    const results = await discovery.search(query, category, settings);
    const groups = new Map();
    for (const row of results) {
      const key = norm(row.title); if (!key) continue;
      if (!groups.has(key)) groups.set(key, { key, title: row.title, year: row.year || "", image: row.image || "", sources: [] });
      const group = groups.get(key);
      if (!group.year && row.year) group.year = row.year;
      if (row.image && (row.source === "howlongtobeat" || !group.image)) group.image = row.image;
      if (!group.sources.includes(row.source)) group.sources.push(row.source);
    }
    return [...groups.values()].slice(0, 40);
  }

  const bestMatch = (rows, title) => {
    const target = norm(title);
    return rows.find(row => norm(row.title) === target) || rows.find(row => { const name = norm(row.title); return name.includes(target) || target.includes(name); }) || null;
  };

  const LIST_LABELS = /^(genres?|platforms?|developers?|publishers?|tags|also known as|languages)$/i;
  const toList = value => Array.isArray(value) ? value.map(String).filter(Boolean) : String(value ?? "").split(/,\s*/).map(part => part.trim()).filter(Boolean);
  const unique = (list, keyOf) => { const seen = new Set(); return list.filter(entry => { const key = keyOf(entry); if (!key || seen.has(key)) return false; seen.add(key); return true; }); };

  function merge(entries, title, trackedItem = {}) {
    const parts = entries.map(entry => entry.data);
    const first = pick => parts.map(pick).find(value => !isEmpty(value)) ?? "";
    const fields = new Map();
    for (const part of parts) for (const row of part.fields || []) {
      if (isEmpty(row.value)) continue;
      const label = String(row.label).trim(), key = label.toLowerCase();
      if (!fields.has(key)) fields.set(key, { label, value: row.value });
      else if (LIST_LABELS.test(label)) fields.get(key).value = unique([...toList(fields.get(key).value), ...toList(row.value)], item => item.toLowerCase());
    }
    fields.set("sources", { label: "Merged from", value: entries.map(entry => entry.name) });
    const sections = new Map();
    for (const part of parts) for (const section of part.sections || []) {
      const key = `${section.kind}:${section.title}`;
      if (!sections.has(key)) sections.set(key, { ...section, items: [] });
      sections.get(key).items.push(...section.items);
    }
    const facts = {};
    for (const part of parts) for (const [key, value] of Object.entries(part.facts || {})) if (isEmpty(facts[key]) && !isEmpty(value)) facts[key] = value;
    const description = parts.map(part => part.description || "").sort((a, b) => b.length - a.length)[0] || "";
    // HLTB's game image is portrait-oriented, so let it lead artwork selection
    // whenever a mixed result has one. Other providers remain fallbacks.
    const hltbPortrait = entries.find(entry => entry.key === "howlongtobeat" && entry.data?.portraitImage)?.data.portraitImage;
    const portraitImage = hltbPortrait || parts.map(part => part.portraitImage).find(value => !isEmpty(value)) || first(part => part.image);
    return {
      source: "mix", mixSources: entries.map(entry => entry.name), title: first(part => part.title) || title, description,
      image: portraitImage, portraitImage, landscapeImage: first(part => part.landscapeImage),
      year: first(part => part.year), rating: Number(first(part => part.rating)) || 0,
      goal: Number(trackedItem.goal) || Number(trackedItem.completionTargetHours) || Number(first(part => part.goal)) || 0,
      progress: Number(trackedItem.progress) || 0,
      url: first(part => part.url),
      fields: [...fields.values()],
      links: unique(parts.flatMap(part => part.links || []), link => link.url),
      sections: [...sections.values()].map(section => ({ ...section, items: unique(section.items, item => item.image || item.url || item.title).slice(0, 24) })).filter(section => section.items.length),
      purchase: first(part => part.purchase) || null,
      requirements: first(part => part.requirements?.minimum?.length || part.requirements?.recommended?.length ? part.requirements : null) || null,
      languages: first(part => part.languages?.length ? part.languages : null) || [],
      tags: unique(parts.flatMap(part => part.tags || []), tag => tag.toLowerCase()).slice(0, 24),
      badge: first(part => part.badge), ratingBreakdown: first(part => part.ratingBreakdown) || [], ratingCount: Number(first(part => part.ratingCount)) || 0,
      stores: unique(parts.flatMap(part => part.stores || []), store => store.name),
      facts: { ...facts, source: "mix", sources: entries.map(entry => entry.key), fetchedAt: Date.now() },
      schemaVersion: 2, fetchedAt: Date.now()
    };
  }

  // Fetch details from every enabled source that knows this game, then merge.
  async function load(item, settings = {}) {
    const title = item.title;
    if (!title) throw new Error("This game has no title to look up.");
    const sources = metadata.available(category, settings);
    if (!sources.length) throw new Error("Enable at least one metadata source first.");
    const settled = await Promise.allSettled(sources.map(async source => {
      const rows = await withTimeout(discovery.searchSource(title, category, settings, source.key));
      const match = bestMatch(rows, title);
      if (!match) throw new Error("No match");
      const data = await withTimeout(controller.load({ ...item, category, metadataSource: source.key, providerId: match.providerId, title: match.title, image: match.image || item.image, url: match.url || item.url, year: match.year || item.year, description: match.description || item.description }, settings));
      return { key: source.key, name: source.name, data };
    }));
    const entries = settled.filter(result => result.status === "fulfilled").map(result => result.value);
    if (!entries.length) throw new Error(`No enabled source had details for “${title}”.`);
    return merge(entries, title, item);
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
