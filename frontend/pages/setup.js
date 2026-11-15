// Quick setup wizard: pick the games you have finished, plan to play, are playing, or dropped.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const STEPS = [
    { status: "Completed", title: "Games you completed", subtitle: "Pick the games you have finished or played before.", shelf: "Trending on Steam" },
    { status: "Backlog", title: "Games you want to play", subtitle: "Add games to your backlog so you never forget them.", shelf: "Trending on Steam" },
    { status: "Playing", title: "Games you are playing", subtitle: "What is on your screen right now?", shelf: "Trending on Steam" },
    { status: "On Hold", title: "Games you put on hold", subtitle: "Pick games you started but paused for now.", shelf: "Trending on Steam" },
    { status: "Dropped", title: "Games you dropped", subtitle: "Keep a record of the ones that did not stick.", shelf: "Trending on Steam" }
  ];
  const FAV = [{ status: "favorite", title: "Pick your favorite games", subtitle: "Choose from the games already in your library.", shelf: "Your games" }];
  const stepsFor = state => state?.mode ? FAV : STEPS;
  const resolveStatus = (current, requested, completed = "Completed") => current === completed || requested === completed ? completed : requested;
  const normalizeTitle = value => String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[™®©]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const yearOf = value => String(value || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "";
  function samePick(left, right) {
    const leftCategory = left?.category || "game", rightCategory = right?.category || "game";
    if (leftCategory !== rightCategory) return false;
    if (left?.source && right?.source && left.providerId != null && right.providerId != null && left.source === right.source && String(left.providerId) === String(right.providerId)) return true;
    if (normalizeTitle(left?.title) !== normalizeTitle(right?.title)) return false;
    const leftYear = yearOf(left?.year), rightYear = yearOf(right?.year);
    return !leftYear || !rightYear || leftYear === rightYear;
  }
  function mergeSearchResults(resultsBySource) {
    const merged = new Map();
    for (const source of ["howlongtobeat", "steamdb"]) {
      for (const row of resultsBySource.get(source) || []) {
        const key = normalizeTitle(row.title);
        if (!key) continue;
        const existing = merged.get(key);
        if (!existing) merged.set(key, { ...row });
        else {
          if (!existing.image && row.image) existing.image = row.image;
          if (!existing.year && row.year) existing.year = row.year;
        }
      }
    }
    return [...merged.values()];
  }
  const tile = (row, index, selected, locked, esc) => `<button type="button" class="setup-tile${selected && !row.inLibrary ? " selected" : ""}${row.inLibrary ? " is-in-library" : ""}"${row.inLibrary ? " disabled aria-disabled=\"true\"" : ` data-setup-toggle="${index}" aria-pressed="${selected}"`}${locked ? ' data-setup-locked="true"' : ""} aria-label="${esc(row.title)}${row.year ? ` (${esc(String(row.year).slice(0, 4))})` : ""}${row.inLibrary ? ", already in library" : ""}${locked ? ", already selected in another step" : ""}"><span class="setup-poster">${row.image ? `<img src="${esc(row.image)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : `<span class="setup-noimg">${esc(row.title)}</span>`}</span><span class="setup-tile-title">${esc(row.title)}</span>${row.inLibrary ? '<span class="setup-library-indicator" aria-label="Already in library">✓ In library</span>' : ""}<span class="setup-mark" aria-hidden="true"></span></button>`;
  function grid(state, esc) {
    if (state.loading && !state.rows.length) return `<p class="setup-wait" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><span>Please wait while the sources load data…</span></p><div class="setup-grid" aria-busy="true">${Array.from({ length: 9 }, () => `<span class="setup-tile setup-skeleton"></span>`).join("")}</div>`;
    if (state.error) return `<p class="setup-message">${esc(state.error)}</p>`;
    if (!state.rows.length) return `<p class="setup-message">${state.query ? "No matches found." : state.mode ? "No games in your library yet." : "No suggestions available right now. Try searching instead."}</p>`;
    const selected = new Set(state.selected.keys());
    const priorPicks = [], priorKeys = new Set();
    state.picks?.forEach((pick, index) => { if (index !== state.step) pick.forEach((row, key) => { priorPicks.push(row); priorKeys.add(key); }); });
    return `${state.loading ? '<p class="setup-wait setup-wait-more" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><span>More matches are loading…</span></p>' : ""}${state.query ? "" : `<h3 class="setup-shelf">${esc(stepsFor(state)[state.step].shelf)}</h3>`}<div class="setup-grid"${state.loading ? ' aria-busy="true"' : ""}>${state.rows.map((row, index) => { const key = `${row.source}:${row.providerId}`, matchedEarlier = priorKeys.has(key) || priorPicks.some(pick => samePick(row, pick)); return tile(row, index, selected.has(key) || matchedEarlier, matchedEarlier, esc); }).join("")}</div>`;
  }
  function footerLabel(state) {
    const count = state.selected.size, last = state.step === stepsFor(state).length - 1;
    if (state.mode) return count ? `Add ${count} ${count === 1 ? "favorite" : "favorites"}` : "Skip";
    return count ? `${last ? "Finish" : "Next"} · ${count} selected` : last ? "Skip & finish" : "Skip";
  }
  window.SplitAppPages.setup = context => {
    const { setup: state, esc } = context, all = stepsFor(state), step = all[state.step];
    return `<section class="setup-page"><header class="setup-header"><button type="button" class="setup-back" data-setup-back aria-label="Back" ${state.step === 0 ? "hidden" : ""}><i data-lucide="chevron-left" aria-hidden="true"></i></button><span class="setup-step">${state.mode ? "Favorites" : `Step ${state.step + 1} of ${all.length}`}</span><button type="button" class="setup-later" data-setup-skip>Later</button><h1>${esc(step.title)}</h1><p>${esc(step.subtitle)}</p></header><label class="setup-search"><i data-lucide="search" aria-hidden="true"></i><input type="search" data-setup-search value="${esc(state.query)}" placeholder="${state.mode ? "Search your games" : "Search games (HowLongToBeat)"}" autocomplete="off" aria-label="Search games"></label><div id="setup-grid">${grid(state, esc)}</div><footer class="setup-footer"><button type="button" class="setup-next" data-setup-next>${esc(footerLabel(state))}</button></footer></section>`;
  };
  window.SplitAppSetup = { steps: STEPS, stepsFor, grid, footerLabel, resolveStatus, mergeSearchResults, samePick };
})();
