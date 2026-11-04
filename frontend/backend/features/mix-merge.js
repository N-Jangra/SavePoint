// Pure merge of metadata from several sources into one record. No DOM or network:
// it runs on the page or inside the data worker.
(root => {
  "use strict";
  const isEmpty = value => value == null || value === "" || value === 0 || (Array.isArray(value) && !value.length);
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

  root.SplitAppMixMerge = Object.freeze({ merge });
})(typeof self !== "undefined" ? self : globalThis);
