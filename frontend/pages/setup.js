// Quick setup wizard: pick the games you have finished, plan to play, are playing, or dropped.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const STEPS = [
    { status: "Completed", title: "Games you completed", subtitle: "Pick the games you have finished or played before.", shelf: "Trending on Steam" },
    { status: "Backlog", title: "Games you want to play", subtitle: "Add games to your backlog so you never forget them.", shelf: "Trending on Steam" },
    { status: "Playing", title: "Games you are playing", subtitle: "What is on your screen right now?", shelf: "Trending on Steam" },
    { status: "Dropped", title: "Games you dropped", subtitle: "Keep a record of the ones that did not stick.", shelf: "Trending on Steam" }
  ];
  const FAV = [{ status: "favorite", title: "Pick your favorite games", subtitle: "Choose from the games already in your library.", shelf: "Your games" }];
  const stepsFor = state => state?.mode ? FAV : STEPS;
  const tile = (row, index, selected, esc) => `<button type="button" class="setup-tile${selected ? " selected" : ""}" data-setup-toggle="${index}" aria-pressed="${selected}" aria-label="${esc(row.title)}${row.year ? ` (${esc(String(row.year).slice(0, 4))})` : ""}"><span class="setup-poster">${row.image ? `<img src="${esc(row.image)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : `<span class="setup-noimg">${esc(row.title)}</span>`}</span><span class="setup-tile-title">${esc(row.title)}</span><span class="setup-mark" aria-hidden="true"></span></button>`;
  function grid(state, esc) {
    if (state.loading) return `<p class="setup-wait" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><span>Please wait while the sources load data…</span></p><div class="setup-grid" aria-busy="true">${Array.from({ length: 9 }, () => `<span class="setup-tile setup-skeleton"></span>`).join("")}</div>`;
    if (state.error) return `<p class="setup-message">${esc(state.error)}</p>`;
    if (!state.rows.length) return `<p class="setup-message">${state.query ? "No matches found." : state.mode ? "No games in your library yet." : "No suggestions available right now. Try searching instead."}</p>`;
    return `${state.query ? "" : `<h3 class="setup-shelf">${esc(stepsFor(state)[state.step].shelf)}</h3>`}<div class="setup-grid">${state.rows.map((row, index) => tile(row, index, state.selected.has(`${row.source}:${row.providerId}`), esc)).join("")}</div>`;
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
  window.SplitAppSetup = { steps: STEPS, stepsFor, grid, footerLabel };
})();
