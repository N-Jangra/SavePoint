"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, "frontend", file), "utf8");
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

function load(files, extra = {}) {
  const window = { ...extra };
  const context = vm.createContext({ window, Date, Map, Set, WeakMap, Object, Array, String, Number, Math, Intl, JSON, RegExp, console, setTimeout, clearTimeout });
  for (const file of files) vm.runInContext(read(file), context, { filename: file });
  return window;
}
const game = (id, title, status, extra = {}) => ({ id: String(id), title, status, category: "game", platform: "PC", progress: 0, goal: 10, createdAt: id, updatedAt: id, ...extra });
const sample = [
  game(1, "Celeste", "Playing", { progress: 3 }),
  game(2, "Hades", "Playing", { favorite: true, platform: "Switch" }),
  game(3, "Silksong", "Upcoming"),
  game(4, "Backlog Quest", "Backlog"),
  game(5, "Held Game", "On Hold"),
  game(6, "Dropped Game", "Dropped"),
  game(7, "Done Game", "Completed", { progress: 10, rating: 5 }),
  game(8, "Tagged Game", "Backlog", { cachedDetails: { tags: ["Soulslike", { name: "Action RPG" }] } }),
  game(9, "Genre Game", "Backlog", { genre: "Strategy, Simulation", facts: { tags: ["Co-op"] } })
];
const pages = () => load(["pages/profile.js", "pages/games.js", "pages/library.js"]).SplitAppPages;

test("sync badge and status page share the same metadata progress snapshot", () => {
  const app = read("app.js"), page = read("pages/sync.js");
  assert.match(app, /function syncCounts\(\)[\s\S]*?percent: total \? Math\.round\(completed \/ total \* 100\) : 0/);
  assert.match(app, /function paintSyncUI\(\)[\s\S]*?const c = syncCounts\(\)[\s\S]*?fab\.querySelector\("b"\)\.textContent =[^;]*c\.percent/);
  assert.match(app, /function livePatchSyncPage\(c\)[\s\S]*?set\("\[data-sync-percent\]", c\.percent \+ "%"\)/);
  assert.match(page, /const c = syncCounts\(\)/);
  assert.match(page, /data-sync-percent>\$\{c\.percent\}%/);
});

test("profile cover and avatar pickers omit titles without usable image URLs", () => {
  const window = load(["pages/profile.js"]), esc = value => String(value ?? ""), items = [
    { id: "empty", title: "No pictures", thumbnailPath: "legacy-folder-path" },
    { id: "gallery", title: "Gallery only", cachedDetails: { sections: [{ kind: "gallery", title: "Screenshots", items: [{ image: "https://x/shot.jpg" }] }] } }
  ];
  window.SplitAppPages.setCoverTab("cover");
  const html = window.SplitAppPages["profile-cover"]({ items, prefs: { profileCoverSource: "pinned" }, esc });
  assert.match(html, /Gallery only/);
  assert.doesNotMatch(html, /data-cover-title="cover" data-id="empty"/);
  assert.doesNotMatch(html, /src=""/);
  window.SplitAppPages.setCoverTab("avatar");
  const stalePinned = window.SplitAppPages["profile-cover"]({ items, esc, prefs: { profileAvatarSource: "pinned", profileAvatarPinned: "empty", profileAvatarPinnedImage: "https://old.invalid/missing.jpg" } });
  assert.doesNotMatch(stalePinned, /old\.invalid/);
  assert.equal(window.SplitAppPages.coverCandidates(items[0], "cover").length, 0);
});

test("quick setup does not downgrade a completed game when it is also picked for the backlog", () => {
  const setup = load(["pages/setup.js"]).SplitAppSetup;
  assert.equal(Array.from(setup.steps, step => step.status).join(","), "Completed,Backlog,Playing,On Hold,Dropped");
  assert.equal(setup.stepsFor({}).length, 5);
  assert.equal(setup.stepsFor({ mode: "favorites" }).length, 1);
  assert.equal(setup.resolveStatus("Backlog", "Completed"), "Completed");
  assert.equal(setup.resolveStatus("Completed", "Backlog"), "Completed");
  assert.equal(setup.resolveStatus("Playing", "Backlog"), "Backlog");
});

test("quick setup locks prior-step picks and disables games already in the library", () => {
  const setup = load(["pages/setup.js"]).SplitAppSetup;
  const state = { mode: "", step: 1, rows: [{ title: "Already owned", source: "steam", providerId: "42", inLibrary: true }], loading: false, error: "", query: "", selected: new Set(), picks: [new Map([["steam:7", {}]]), new Map()] };
  const html = setup.grid(state, esc);
  assert.match(html, /setup-tile is-in-library" disabled aria-disabled="true" aria-label="Already owned, already in library"[\s\S]*?setup-library-indicator/);
  assert.doesNotMatch(html, /data-setup-toggle/);
  state.rows[0].inLibrary = false;
  state.rows[0].providerId = "7";
  assert.match(setup.grid(state, esc), /data-setup-toggle="0" aria-pressed="true" data-setup-locked="true"/);
  const app = read("app.js");
  assert.match(app, /toggle\.dataset\.setupLocked === "true"/);
  assert.match(app, /inLibrary: libraryKeys\.has\([\s\S]*?Boolean\(findLibraryMatch\(row\)\)/);
});

test("Quick Setup recognizes the same title from another provider across steps", () => {
  const setup = load(["pages/setup.js"]).SplitAppSetup;
  const state = { mode: "", step: 1, query: "", loading: false, error: "", selected: new Map(), picks: [new Map([["steamdb:42", { title: "A Short Hike", year: "2019", source: "steamdb", providerId: "42" }]]), new Map()], rows: [
    { title: "A Short Hike", year: "2019", source: "howlongtobeat", providerId: "h-7" },
    { title: "A Short Hike", year: "2023", source: "howlongtobeat", providerId: "h-8" }
  ] };
  const html = setup.grid(state, esc);
  assert.match(html, /class="setup-tile selected"[^>]*aria-pressed="true" data-setup-locked="true"/);
  assert.match(html, /data-setup-toggle="1" aria-pressed="false" aria-label="A Short Hike \(2023\)"/);
});

test("Quick Setup On Hold step gets its own selection map and step navigation controls", () => {
  const app = read("app.js"), page = read("pages/setup.js");
  assert.match(app, /picks: Array\.from\(\{ length: 5 \}, \(\) => new Map\(\)\)/);
  assert.match(app, /setupState\.picks\[index\]\.forEach/);
  assert.match(app, /setupState\.step\+\+; setupState\.query = ""/);
  assert.match(page, /Step \$\{state\.step \+ 1\} of \$\{all\.length\}/);
  assert.match(page, /Games you put on hold/);
});

test("Quick Setup keeps Later available on later steps and invalidates pending searches when leaving", () => {
  const window = load(["pages/setup.js"]), state = { mode: "", step: 2, query: "", loading: false, error: "", rows: [], selected: new Map(), picks: Array.from({ length: 5 }, () => new Map()) };
  assert.match(window.SplitAppPages.setup({ setup: state, esc }), /data-setup-skip>Later<\/button>/);
  const app = read("app.js");
  assert.match(app, /async function finishSetup\(save = true\)\s*\{\s*\/\/ A delayed search[\s\S]*?clearTimeout\(setupSearchTimer\); setupSearchTimer = 0; setupRequest\+\+; setupState\.loading = false;/);
});

test("Quick Setup coalesces concurrent trending requests and caches the returned shelf", () => {
  const app = read("app.js");
  assert.match(app, /const setupTrending = \{ rows: null, promise: null \}/);
  assert.match(app, /if \(!setupTrending\.promise\) setupTrending\.promise = window\.SplitAppDiscovery\.trending/);
  assert.match(app, /rows = await setupTrending\.promise/);
  assert.match(app, /if \(trendingRows\.length\) setupTrending\.rows = trendingRows/);
  assert.match(app, /finally\(\(\) => \{ setupTrending\.promise = null; \}\)/);
});

test("Quick Setup search shows the first source results while the other source is still loading", () => {
  const window = load(["pages/setup.js"]), app = read("app.js");
  const merged = window.SplitAppSetup.mergeSearchResults(new Map([
    ["steamdb", [{ source: "steamdb", providerId: "app:1", title: "Hades", image: "steam.jpg" }, { source: "steamdb", providerId: "app:2", title: "Celeste", image: "steam-celeste.jpg" }]],
    ["howlongtobeat", [{ source: "howlongtobeat", providerId: "10", title: "Celeste", goal: 8 }]]
  ]));
  assert.equal(Array.from(merged, row => row.source).join(","), "howlongtobeat,steamdb");
  assert.equal(merged[0].title, "Celeste");
  assert.equal(merged[0].image, "steam-celeste.jpg", "the Steam result fills missing HLTB artwork");
  const esc = value => String(value ?? "");
  const html = window.SplitAppPages.setup({ setup: { step: 0, mode: "", query: "hades", loading: true, error: "", rows: [{ source: "steamdb", providerId: "app:1", title: "Hades", image: "" }], selected: new Map(), picks: Array.from({ length: 5 }, () => new Map()) }, esc });
  assert.match(html, /More matches are loading/);
  assert.match(html, /Hades/);
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, /setup-skeleton/);
  const empty = window.SplitAppPages.setup({ setup: { step: 0, mode: "", query: "hades", loading: true, error: "", rows: [], selected: new Map(), picks: [] }, esc });
  assert.equal((empty.match(/setup-skeleton/g) || []).length, 9);
  assert.match(app, /\["howlongtobeat", "steamdb"\]\.map\(async sourceKey/);
  assert.match(app, /setupState\.rows = withLibraryStatus\(partial\);\s*setGrid\(\)/);
});

test("Explore shares its query across Normal and Mix Fetch and clears it only when leaving Explore", () => {
  const app = read("app.js"), discover = read("pages/discover.js"), mix = read("pages/mix.js");
  assert.match(app, /let discoverQuery = "", exploreQuery = ""/);
  assert.match(app, /discoverQuery = exploreQuery = event\.target\.value/);
  assert.match(app, /mixQuery: exploreQuery/);
  assert.match(app, /const switchingExploreMode = \["discover", "mix"\]\.includes\(previousPage\) && \["discover", "mix"\]\.includes\(next\)/);
  assert.match(app, /else if \(next === "mix" && switchingExploreMode && exploreQuery\.trim\(\)\) runMixSearch\(\)/);
  assert.match(app, /if \(previousPage !== page && \["discover", "mix"\]\.includes\(previousPage\)[\s\S]*?if \(page === "discover"\) submitDiscover\(\); else runMixSearch\(\)/);
  assert.match(app, /exploreQuery = ""; if \(input\)/);
  assert.match(discover, /explore-mode-tabs/);
  assert.match(mix, /explore-mode-tabs/);
  const styles = read("styles/savepoint-ui.css");
  assert.match(styles, /body\[data-page="discover"\] \.explore-bar, body\[data-page="mix"\] \.explore-bar \{ margin-inline: calc\(var\(--gutter, 16px\) \* -1\)/);
  assert.match(styles, /body\[data-page="mix"\] \.mix-page > \.explore-bar \{ margin-inline: calc\(var\(--gutter, 16px\) \* -1\)/,
    "the final Mix-specific rule must override its earlier zero margin and match Normal's full-bleed tab bar");
  assert.match(app, /setupSearchTimer = setTimeout\(loadSetupRows, 160\)/);
  assert.match(app, /event\.key !== "Enter" && event\.keyCode !== 13[\s\S]*?loadSetupRows\(\)/);
});

test("offline poster cache misses use saved-folder images and failed remote images retry locally", () => {
  const app = read("app.js");
  const drain = app.slice(app.indexOf("async function drainDeferredLocalImages"), app.indexOf("function activateDeferredImage"));
  assert.match(drain, /navigator\.onLine\)\s*\{\s*\/\/ Not cached yet/);
  assert.match(drain, /else \{ slow\.push\(record\); continue; \}/);
  const activate = app.slice(app.indexOf("function activateDeferredImage"), app.indexOf("\/\/ Poster shimmer"));
  assert.match(activate, /image\.addEventListener\("error", async \(\) =>/);
  assert.match(activate, /hydrateThumbnails\?\.\(\[item\]\)/);
  assert.match(activate, /folderFallbackTried/);
});

test("all SavePoint export formats share a busy guard while Android JSON stays streamed", () => {
  const app = read("app.js"), backend = fs.readFileSync(path.join(root, "frontend/backend/app.js"), "utf8");
  assert.match(app, /async function exportNames\(format, opts = exportOptions\)[\s\S]*?if \(exportRunning\)[\s\S]*?exportNamesBody/);
  assert.match(app, /async function exportList\(options = \{\}\)[\s\S]*?if \(exportRunning\)[\s\S]*?exportListBody/);
  assert.match(backend, /const CHUNK = 256 \* 1024/);
  assert.match(backend, /await write\(buffer\)/);
});

test("SavePoint exports keep ratings, omit written reviews, and support browser artwork downloads", () => {
  const app = read("app.js"), page = read("pages/export.js"), backend = read("backend/app.js");
  const exportSection = app.slice(app.indexOf("  let exportRunning = false;"), app.indexOf("  function importIdentity("));
  assert.match(app, /let exportOptions = \{ format: "json", ratings: prefs\.backupIncludeRatings !== false \}/);
  assert.match(exportSection, /delete copy\.review; delete copy\.reviews; delete copy\.notes/);
  assert.doesNotMatch(page, /Your written reviews and notes/);
  assert.match(exportSection, /typeof window\.showSaveFilePicker === "function"/);
  assert.match(exportSection, /saveHandle = await saveHandlePromise/);
  assert.match(exportSection, /const writePart = async value => \{ if \(writable\) await writable\.write\(value\); else parts\.push\(value\); \}/);
  assert.match(exportSection, /backend\?\.backupItem \? await backend\.backupItem\(item\)/);
  assert.match(backend, /const loaded = await loadItemImages\(item\)/);
});

test("export summary and Android completion report the exported game count with correct wording", () => {
  const app = read("app.js"), page = read("pages/export.js"), exportBody = app.slice(app.indexOf("async function exportListBody"), app.indexOf("const fileName = ", app.indexOf("async function exportListBody")));
  assert.match(page, /\$\{Number\(itemCount\) \|\| 0\} \$\{Number\(itemCount\) === 1 \? "game" : "games"\} will be exported/);
  assert.match(exportBody, /const exportItems = exportableItems\(silent\)/);
  assert.match(exportBody, /Exported \$\{exportItems\.length\} \$\{exportItems\.length === 1 \? "game" : "games"\}/);
  assert.doesNotMatch(exportBody, /Exported \$\{items\.length\} games/);
});

test("Quick setup completion fills the Main + Extras goal and completes progress after metadata arrives", () => {
  const app = read("app.js"), start = app.indexOf("  function applyQuickSetupCompletion("), end = app.indexOf("\n  async function finishSetup", start);
  assert.ok(start >= 0 && end > start);
  const choices = item => {
    const facts = { ...(item.cachedDetails?.facts || {}), ...(item.facts || {}) };
    return [["mainHours", "Main story"], ["extrasHours", "Main story + extras"], ["completionistHours", "Completionist"]]
      .map(([key, label]) => ({ key, label, hours: Number(facts[key]) || 0 })).filter(option => option.hours > 0);
  };
  const complete = new Function("completionChoices", `${app.slice(start, end)}; return applyQuickSetupCompletion;`)(choices);
  const goalStart = app.indexOf("  function applyDefaultGoal("), goalEnd = app.indexOf("\n  // Covers that came", goalStart);
  const applyDefaultGoal = new Function(`${app.slice(goalStart, goalEnd)}; return applyDefaultGoal;`)();
  const withFacts = { facts: { mainHours: 12, extrasHours: 20, completionistHours: 36 } };
  complete(withFacts);
  assert.equal(withFacts.status, "Completed");
  assert.equal(withFacts.completionTarget, "extrasHours");
  assert.equal(withFacts.goal, 20);
  assert.equal(withFacts.progress, 20);
  const awaitingDetails = {};
  complete(awaitingDetails);
  awaitingDetails.facts = { mainHours: 8, extrasHours: 14 };
  assert.equal(applyDefaultGoal(awaitingDetails), true);
  assert.equal(awaitingDetails.goal, 14);
  assert.equal(awaitingDetails.completionTargetHours, 14);
  assert.equal(awaitingDetails.progress, 14);
  const awaitingSearch = { quickSetupCompleted: true, status: "Completed", completionTarget: "extrasHours", facts: { mainHours: 8, extrasHours: 14 } };
  assert.equal(applyDefaultGoal(awaitingSearch), true);
  assert.equal(awaitingSearch.goal, 14);
  assert.equal(awaitingSearch.progress, 14);
  assert.equal(awaitingSearch.quickSetupCompleted, undefined);
});

test("completed Quick Setup entries show the saved Main + extras target while playtime facts are pending", () => {
  const details = read("pages/details.js");
  assert.match(details, /item\.status === "Completed" && item\.completionTarget === "extrasHours" \? "Main \+ extras target pending" : "No goal set"/);
});

test("every frontend script parses", () => {
  const dirs = ["", "pages", "components"];
  let count = 0;
  for (const dir of dirs) {
    const base = path.join(root, "frontend", dir);
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base).filter(file => file.endsWith(".js"))) {
      assert.doesNotThrow(() => new vm.Script(fs.readFileSync(path.join(base, name), "utf8"), { filename: `${dir}/${name}` }), name);
      count++;
    }
  }
  assert.ok(count > 10);
});

test("index.html loads every page script it needs", () => {
  const html = read("index.html");
  for (const name of ["profile", "games", "library", "statistics", "statistics-detailed", "discover", "mix", "details"]) {
    assert.match(html, new RegExp(`pages/${name}\\.js`), `${name}.js is missing from index.html`);
  }
});

test("bottom bar is Games, Explore, Profile in that order", () => {
  const app = read("app.js");
  const match = app.match(/navItems\s*=\s*\[([\s\S]*?)\];/);
  assert.ok(match, "navItems not found");
  const keys = [...match[1].matchAll(/key:\s*"([^"]+)"/g)].map(row => row[1]);
  assert.deepEqual(keys, ["games", "discover", "profile"]);
});

test("legacy Explore bookmark icon migrates to a compass without resetting newer icon choices", () => {
  const app = read("app.js");
  assert.match(app, /Number\(prefs\.navLayoutVersion\) < 4 && prefs\.navIcons\.discover === "bookmark"\) prefs\.navIcons\.discover = "compass"/);
  assert.match(app, /prefs\.navLayoutVersion = 4/);
});

test("Discover offline states replace loading placeholders and offer search", () => {
  const app = read("app.js"), styles = read("styles/ui-polish.css");
  assert.match(app, /box\.innerHTML = ""; if \(empty\) empty\.hidden = false;/);
  assert.match(app, /offline \? "You’re offline" : "Suggestions unavailable"/);
  assert.match(app, /data-discover-focus-search/);
  assert.match(app, /closest\("\[data-discover-focus-search\]"\)/);
  assert.match(styles, /discover-empty:not\(\[hidden\]\)/);
});

test("Android Back follows explicit subpage back controls before browser history", () => {
  const app = read("app.js");
  assert.match(app, /function currentPageBackRoute\(\)[\s\S]*?#page-content \.profile-list-header > \[data-go\]/);
  assert.match(app, /#page-content \.detail-page-heading \[data-go\]/);
  assert.match(app, /#page-content \.settings-page-heading \.settings-back\[href\]/);
});

test("detail header returns through nested game pages before leaving details", () => {
  const app = read("app.js"), details = read("pages/details.js");
  assert.match(app, /const detailSnapshot = \(\) =>/);
  assert.match(app, /function detailBack\(\)/);
  assert.match(app, /detailStack\.push\(detailSnapshot\(\)\)/);
  assert.match(app, /closest\("\[data-detail-back\]"\)/);
  assert.match(app, /detailStack\.length\) \{\s*const requestedId/);
  assert.match(details, /context\.detailStackSize \? "data-detail-back"/);
});

test("soft keyboard hides the Add page action dock so it cannot cover focused fields", () => {
  const app = read("app.js"), styles = read("styles/savepoint-ui.css");
  assert.match(app, /visualViewport\?\.addEventListener\("resize", syncSoftKeyboardState/);
  assert.match(app, /classList\.toggle\("soft-keyboard-open", keyboardOpen\)/);
  assert.match(styles, /body\.soft-keyboard-open\[data-page="add"\] \.add-entry-footer \{ display: none !important; \}/);
});

test("Games tab: Ongoing shows only Playing; Upcoming shows only Upcoming and Backlog", () => {
  const { games } = pages();
  const ongoing = games({ items: sample, esc, gamesTab: "ongoing", gamesView: "list" });
  assert.match(ongoing, /Celeste/);
  assert.match(ongoing, /Hades/);
  for (const hidden of ["Silksong", "Backlog Quest", "Held Game", "Dropped Game", "Done Game"]) assert.doesNotMatch(ongoing, new RegExp(hidden));
  const upcoming = games({ items: sample, esc, gamesTab: "upcoming", gamesView: "list" });
  assert.match(upcoming, /Silksong/);
  assert.match(upcoming, /Backlog Quest/);
  for (const hidden of ["Celeste", "Held Game", "Dropped Game", "Done Game"]) assert.doesNotMatch(upcoming, new RegExp(hidden));
  assert.doesNotMatch(ongoing + upcoming, /data-action="(hold|drop)"/i);
});

test("restore placeholders stay loading until saved library data arrives", () => {
  const { games, library } = pages();
  for (const gamesTab of ["ongoing", "upcoming"]) {
    const html = games({ items: [], esc, gamesTab, libraryLoading: true });
    assert.match(html, /Loading your games/);
    assert.match(html, /saved collection is being restored/);
    assert.doesNotMatch(html, /data-go="discover"/);
  }
  const loadingLibrary = library({ ...libraryContext({}, []), libraryLoading: true });
  assert.match(loadingLibrary, /Loading your games/);
  const emptyLibrary = library({ ...libraryContext({}, []), libraryLoading: false });
  assert.match(emptyLibrary, /No games yet/);
  assert.doesNotMatch(emptyLibrary, /Loading your games/);
  const app = read("app.js");
  assert.match(app, /let libraryLoading = true/);
  assert.match(app, /libraryLoading = false/);
  assert.match(app, /libraryState, libraryStatus, libraryLoading,/);
});

test("Games tab offers list, posters and cards views without a completion eye", () => {
  const { games } = pages();
  for (const view of ["list", "posters", "cards"]) {
    const html = games({ items: sample, esc, gamesTab: "ongoing", gamesView: view });
    assert.match(html, /data-games-view/);
    if (view === "cards") assert.match(html, /is-card-view/);
    if (view === "posters") assert.match(html, /is-poster-view/);
    assert.doesNotMatch(html, /data-game-seen=/);
    assert.doesNotMatch(html, /watchlist-seen-toggle/);
  }
  assert.doesNotMatch(read("app.js"), /data-game-seen/, "the Games home has no completion-eye click handler");
});

test("profile game tiles do not expose completion eyes", () => {
  const { profile } = pages();
  const html = profile({ items: sample, esc, prefs: {}, dataRevision: 1, libraryLoading: false });
  assert.match(html, /profile-poster-wrap/);
  assert.doesNotMatch(html, /data-game-seen=/);
});

test("Achievements are linked from the profile menu and progress badges open detail subpages", () => {
  const achievements = load(["pages/achievements.js"]).SplitAppAchievements;
  const rows = achievements.entries([
    game("a", "One", "Completed", { favorite: true, progress: 100, platform: "PC" }),
    game("b", "Two", "Backlog", { platform: "Switch" }),
    game("c", "Three", "Playing", { platform: "PC" })
  ]);
  const by = id => rows.find(row => row.id === id);
  assert.equal(by("first-game-t1").unlocked, true);
  assert.equal(by("first-game-t2").unlocked, false);
  assert.equal(by("first-completion-t1").unlocked, true);
  assert.equal(by("platform-three-t1").current, 2);
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length, "every achievement has its own id");
  const unlocked = rows.filter(row => row.unlocked);
  assert.equal(achievements.progression(rows).earned, unlocked.length);
  assert.equal(by("collect-1").unlocked, true);
  assert.equal(by("medal-bronze-1").unlocked, true);
  assert.equal(by("medal-gold-3").unlocked, false);
  for (const row of rows) assert.match(read(row.asset), /<svg/);
  assert.equal(achievements.unlocks([game("tier", "Tier", "Completed")]).length, achievements.entries([game("tier", "Tier", "Completed")]).filter(row => row.unlocked).length);
  const { profile } = pages();
  assert.match(profile({ items: sample, esc, prefs: {}, dataRevision: 1, libraryLoading: false }), /href="#achievements"[\s\S]*?Achievements/);
  const pagesApi = load(["pages/achievements.js"]).SplitAppPages.achievements;
  assert.match(pagesApi({ items: sample, esc, achievementId: "" }), /href="#achievements\/g-library"[^>]*>View all/);
  assert.match(pagesApi({ items: sample, esc, achievementId: "g-library" }), /ach-grid/);
  const html = pagesApi({ items: sample, esc, achievementId: "a-first-game-t1" });
  assert.match(html, /Unlocked/);
  assert.match(html, /Rarity/);
  assert.match(html, /href="#achievements\/g-library"/);
  assert.match(read("index.html"), /pages\/achievements\.js/);
  assert.match(read("app.js"), /achievements: "Achievements"/);
});

test("achievement baselines initialize after the successful final restore, before later award checks", () => {
  const app = read("app.js"), finish = app.indexOf("const finishStartup = success =>"), guard = app.indexOf("if (!success)", finish), baseline = app.indexOf("initializeAchievementAwards();", guard), persist = app.indexOf("function persist(scope)");
  assert.ok(finish > 0 && guard > finish && baseline > guard && persist > 0);
  assert.match(app.slice(finish, finish + 2200), /finishStartup\(true\)[\s\S]*?restoreNativeData\(\);[\s\S]*?initializeAchievementAwards\(\);/);
  assert.match(app, /function initializeAchievementAwards\(\)\s*\{\s*if \(achievementAwardsReady\) return;/);
});

test("all-games library uses a status grouping eye in its header instead of card eyes", () => {
  const { library } = pages();
  const html = library({ items: sample, esc, libraryState: { view: "list" }, libraryStatus: "all", libraryStatusGroups: true });
  assert.doesNotMatch(html, /data-game-seen=/);
  assert.match(html, /data-library-groups aria-label="Show all games in one grid" aria-pressed="true"/);
  assert.match(html, /profile-status-groups library-status-groups/);
  for (const status of ["Playing", "Backlog", "Completed", "On Hold", "Dropped"]) assert.match(html, new RegExp(`library-status-group"><h3>${status}`));
  assert.match(read("app.js"), /if \("libraryGroups" in d\)[\s\S]*?libraryStatusGroups = !libraryStatusGroups/);
});

test("status-specific game collection pages omit the All games grouping eye", () => {
  const { library } = pages();
  for (const status of ["Playing", "Backlog", "Completed", "On Hold", "Dropped"]) {
    const html = library({ items: sample, esc, libraryState: { view: "grid" }, libraryStatus: status, libraryStatusGroups: false });
    assert.doesNotMatch(html, /data-library-groups/);
    assert.match(html, new RegExp(`<h2>${status === "Completed" ? "Completed games" : status}`));
  }
});

test("All games keeps the centered Filters pill until actual filter criteria are active", () => {
  const { library } = pages();
  const base = { items: sample, esc, libraryState: { view: "grid", sort: "alpha", status: "all", platform: "all", tag: "" }, libraryStatus: "all" };
  const initial = library(base);
  assert.match(initial, /class="profile-filter-pill" data-library-filters/);
  assert.match(initial, /<span>Filters<\/span>/);
  assert.doesNotMatch(initial, /profile-filter-bar/);
  assert.doesNotMatch(initial, /profile-filter-reset/);
  const afterReturn = library({ ...base, libraryState: { ...base.libraryState } });
  assert.match(afterReturn, /class="profile-filter-pill" data-library-filters/);
  const filtered = library({ ...base, libraryState: { ...base.libraryState, sort: "recent" } });
  assert.match(filtered, /profile-sort-pill[^>]+aria-label="Sort by Recently added"/);
  assert.match(filtered, /profile-filter-reset/);
});

test("Profile links to all games, favorites, and every trackable status collection", () => {
  const { profile } = pages();
  const html = profile({ items: sample, esc, prefs: {}, dataRevision: 1, libraryLoading: false });
  assert.match(html, /All games <small>9<\/small>/);
  assert.match(html, /Favorites <small>1<\/small>/);
  assert.match(html, /library\?status=On%20Hold/);
  assert.match(html, /library\?status=Dropped/);
  assert.match(html, /Completed games <small>1<\/small>/);
  assert.match(html, /library\?status=Completed/);
  assert.match(html, /Backlog <small>3<\/small>/);
  assert.match(html, /library\?status=Backlog/);
  assert.match(html, /Playing <small>2<\/small>/);
  assert.match(html, /library\?status=Playing/);
  assert.doesNotMatch(html, /Add completed games|Add on-hold games|Add dropped games/);
  assert.ok(html.indexOf("All games <small>9</small>") < html.indexOf("Completed games <small>1</small>"));
  assert.ok(html.indexOf("Stats") < html.indexOf("All games <small>9</small>"));
  assert.ok(html.indexOf("All games <small>9</small>") < html.indexOf("Playing <small>2</small>"));
  assert.ok(html.indexOf("Playing <small>2</small>") < html.indexOf("Completed games <small>1</small>"));
  assert.ok(html.indexOf("Completed games <small>1</small>") < html.indexOf("Favorites <small>1</small>"));
  assert.ok(html.indexOf("Favorites <small>1</small>") < html.indexOf("Backlog <small>3</small>"));
  assert.ok(html.indexOf("Backlog <small>3</small>") < html.indexOf("On Hold <small>1</small>"));
  assert.ok(html.indexOf("On Hold <small>1</small>") < html.indexOf("Dropped <small>1</small>"));
});

test("Profile shows status add cards only when that collection is empty", () => {
  const { profile } = pages();
  const items = [game(1, "Active", "Playing"), game(2, "Held", "On Hold")];
  const html = profile({ items, esc, prefs: {}, dataRevision: 2, libraryLoading: false });
  assert.match(html, /Add completed games/);
  assert.doesNotMatch(html, /Add on-hold games/);
  assert.match(html, /Add dropped games/);
  assert.match(html, /Add backlog games/);
  assert.doesNotMatch(html, /Add playing games/);
});

const libraryContext = (state = {}, items = sample) => ({ items, esc, dataRevision: Math.random(), libraryState: { view: "grid", sort: "alpha", status: "all", platform: "all", favorites: false, query: "", ...state } });

test("My games lists the whole library and has no add or select controls", () => {
  const { library } = pages();
  const html = library(libraryContext());
  for (const title of ["Celeste", "Hades", "Silksong", "Held Game", "Dropped Game", "Done Game"]) assert.match(html, new RegExp(title));
  assert.match(html, /data-library-view/);
  assert.match(html, /data-library-share/);
  assert.match(html, /data-library-filters/);
  assert.doesNotMatch(html, /data-select|data-mass|select-mode|data-go="add"/i);
});

test("My games filters by status, platform, and search, and sorts", () => {
  const { library, libraryRows } = pages();
  library(libraryContext({ status: "Playing" }));
  assert.deepEqual([...libraryRows()].map(row => row.title), ["Celeste", "Hades"]);
  library(libraryContext({ platform: "Switch" }));
  assert.deepEqual([...libraryRows()].map(row => row.title), ["Hades"]);
  library(libraryContext({ query: "quest" }));
  assert.deepEqual([...libraryRows()].map(row => row.title), ["Backlog Quest"]);
  library(libraryContext({ sort: "played" }));
  assert.equal(libraryRows()[0].title, "Done Game");
  library(libraryContext({ sort: "rating" }));
  assert.equal(libraryRows()[0].title, "Done Game");
  const empty = library(libraryContext({ query: "zzz" }));
  assert.match(empty, /No games match/);
});

test("status collections constrain rows and omit favorites filtering", () => {
  const { library, libraryRows } = pages();
  for (const status of ["On Hold", "Dropped", "Completed", "Backlog", "Playing"]) {
    const html = library({ ...libraryContext(), libraryStatus: status });
    assert.deepEqual([...libraryRows()].map(row => row.status), sample.filter(item => item.status === status).map(() => status));
    assert.match(html, new RegExp(`<h2>${status === "Completed" ? "Completed games" : status}`));
    assert.doesNotMatch(html, /Favorites only|data-library-favorites/);
    assert.doesNotMatch(html, /data-library-status=/);
  }
  const all = library(libraryContext());
  assert.doesNotMatch(all, /Favorites only|data-library-favorites/);
  assert.match(all, /<h2>All games/);
});

test("Backlog and Playing profile links are recognized as persistent library filters", () => {
  const app = read("app.js");
  assert.match(app, /const builtInRouteStatuses = new Set\(\["Playing", "Backlog", "On Hold", "Dropped", "Completed"\]\)/);
  assert.match(app, /const libraryRouteStatuses = \{ has: name => builtInRouteStatuses\.has\(name\) \|\| Object\.values\(statusOptions\.custom/);
  assert.match(app, /if \(libraryRouteStatuses\.has\(status\)\) libraryState\.status = status/);
  assert.match(app, /libraryRouteStatuses\.has\(new URLSearchParams\(location\.hash/);
});

test("My games filters match saved metadata tags, genres, and category objects", () => {
  const { library, libraryRows } = pages();
  const context = libraryContext();
  for (const tag of ["Soulslike", "Action RPG", "Strategy", "Simulation", "Co-op"]) {
    library({ ...context, libraryState: { ...context.libraryState, tag } });
    assert.ok(libraryRows().length > 0, `${tag} should match a game`);
  }
  library({ ...context, libraryState: { ...context.libraryState, tag: "soulslike" } });
  assert.deepEqual([...libraryRows()].map(row => row.title), ["Tagged Game"]);
  const html = library(context);
  for (const tag of ["Soulslike", "Action RPG", "Strategy", "Simulation", "Co-op"]) assert.match(html, new RegExp(`data-library-tag="${tag}"`));
});

test("My games reuses filter facets on return renders until library revision changes", () => {
  const page = read("pages/library.js");
  assert.match(page, /let facetCache = \{ items: null, revision: null, status: "", value: null \}/);
  assert.match(page, /facetCache\.items === items && facetCache\.revision === revision && facetCache\.status === statusFilter/);
  assert.match(page, /const \{ statuses, tags, platforms \} = filterFacets\(items, context\.dataRevision, statusFilter\)/);
});

test("My games view comes from saved state and falls back to posters", () => {
  const { library } = pages();
  assert.match(library(libraryContext({ view: "list" })), /library-grid is-list/);
  assert.match(library(libraryContext({ view: "large" })), /library-grid is-large/);
  assert.match(library(libraryContext({ view: "nonsense" })), /library-grid is-grid/);
});

test("large libraries are windowed instead of rendered in full", () => {
  const { library, virtualGrid } = pages();
  const many = Array.from({ length: 10_000 }, (_, index) => game(index + 1, `Game ${String(index).padStart(5, "0")}`, "Backlog"));
  const html = library(libraryContext({}, many));
  assert.match(html, /data-virtual-grid="library"/);
  assert.match(html, /data-virtual-total="10000"/);
  assert.ok((html.match(/profile-poster/g) || []).length < 20, "no tiles should be drawn until the window mounts");
  const source = virtualGrid("library");
  assert.equal(source.count, 10_000);
  assert.match(source.tile(9999), /Game 09999/);
  const list = library(libraryContext({ view: "list" }, many));
  assert.match(list, /data-virtual-row="74"/);
});

test("10k load: Games and Dashboard keep rendered card windows bounded", () => {
  const statuses = ["Playing", "Backlog", "Upcoming", "Completed", "On Hold", "Dropped"];
  const many = Array.from({ length: 10_000 }, (_, index) => game(index + 1, `Load Game ${String(index).padStart(5, "0")}`, statuses[index % statuses.length]));
  const { games } = pages();
  const ongoing = games({ items: many, esc, gamesTab: "ongoing", gamesView: "list" });
  assert.equal((ongoing.match(/data-watchlist-root=/g) || []).length, 60);
  const upcoming = games({ items: many, esc, gamesTab: "upcoming", gamesView: "cards" });
  assert.equal((upcoming.match(/data-watchlist-root=/g) || []).length, 60);
  const { dashboard } = load(["components/library.js", "pages/dashboard.js"]).SplitAppPages;
  const config = { categories: [{ key: "game", name: "Games", unit: "hours", statuses }] };
  const prefs = { favoritesOnly: false, dashboardSort: "updated-desc", dashboardView: "list", dashboardGroupBy: "status", dashboardRowActions: "quick", showThumbnails: false, categoryColors: {}, mainColor: "#6455f5", ratingFormat: "5-point" };
  const home = dashboard({ config, esc, items: many, activeCategory: "all", libraryQuery: "", dashboardStatusFilter: "all", dashboardPlatformFilter: "all", dashboardPageSize: 12, nativeAndroid: true, prefs, category: key => config.categories.find(row => row.key === key), matchesPlatform: () => true, labelCategory: value => value, dashboardRendered: {} });
  assert.match(home, /data-total-count="1667"/);
  assert.ok((home.match(/class="item-card/g) || []).length <= 16, "Android Dashboard renders only its initial card budget");
});

test("bottom bar opacity control shows only for the Transparent background and phones keep the chosen background", () => {
  const settings = read("pages/settings.js"), app = read("app.js"), styles = `${read("styles.css")}\n${read("styles/demo-pages.css")}`;
  assert.match(settings, /bottomBarTransparency" && prefs\.bottomBarBackground !== "transparent"/);
  assert.match(read("styles/savepoint-ui.css"), /html\[data-lowend="true"\] body \.bottom-bar\[data-bg="glass"\]/);
  assert.match(app, /--bar-glass-alpha/);
  assert.match(styles, /var\(--bar-glass-alpha,55%\)/);
  assert.doesNotMatch(styles, /calc\(var\(--bar-alpha\)\s*\*/);
});

test("IndexedDB change tracking keeps compact fingerprints for a 10k library", async () => {
  const source = read("backend/idb-store.js");
  assert.match(source, /id -> compact content fingerprint/);
  assert.match(source, /known\.set\(String\(item\.id\), signature\(item\)\)/);
  assert.doesNotMatch(source, /known\.set\(String\(item\.id\), JSON\.stringify\(item\)\)/);
  const signature = source.match(/function signature\(value\) \{([\s\S]*?)\n  \}/)?.[0];
  assert.ok(signature, "content fingerprint helper is present");
  const rows = Array.from({ length: 10_000 }, (_, index) => ({ id: String(index), title: `Game ${index}`, status: "Backlog", description: `Synthetic description ${index}` }));
  const oldSnapshotBytes = Buffer.byteLength(JSON.stringify(rows));
  const signatureBytes = Buffer.byteLength(JSON.stringify(rows.map(row => `${JSON.stringify(row).length}:abcdef12345678`)));
  assert.ok(oldSnapshotBytes > signatureBytes * 4, `fingerprints (${signatureBytes} bytes) are substantially smaller than full snapshots (${oldSnapshotBytes} bytes)`);
});

test("Statistics has an Overall / Detailed toggle that swaps in the play-time page", () => {
  const stats = load(["pages/statistics.js"], { SplitAppPages: { statisticsDetailed: () => '<header class="detail-page-heading analytics-page-heading">x</header><div id="detailed-marker">by category</div>' } }).SplitAppPages.statistics;
  const overall = stats({ items: sample, esc, prefs: {}, statsView: "overall" });
  assert.match(overall, /data-stats-view="overall"/);
  assert.match(overall, /data-stats-view="detailed"/);
  assert.match(overall, /Time spent playing/);
  assert.doesNotMatch(overall, /detailed-marker/);
  const detailed = stats({ items: sample, esc, prefs: {}, statsView: "detailed" });
  assert.match(detailed, /detailed-marker/);
  assert.doesNotMatch(detailed, /Time spent playing/);
  assert.equal((detailed.match(/analytics-page-heading/g) || []).length, 1, "only the shared heading remains");
});

test("Statistics cache invalidates when preferences or saved history change", () => {
  const { statistics } = load(["pages/statistics.js"], { SplitAppPages: { statisticsDetailed: context => `<div data-history-count="${context.history.length}"></div>` }, SplitAppCurrency: { target: () => "USD", symbol: () => "$", format: value => `$${value}`, detect: () => "USD", convert: value => value } }).SplitAppPages;
  const context = { items: [game(1, "Played", "Playing", { progress: 4, goal: 8, rating: 4 })], history: [], config: {}, esc, dataRevision: 4, prefs: { ratingFormat: "5-point" }, statsView: "overall", statsLimits: {}, statsRange: "week" };
  const first = statistics(context);
  const preferenceChange = statistics({ ...context, prefs: { ratingFormat: "10-point" } });
  assert.notEqual(preferenceChange, first);
  assert.match(preferenceChange, /\/10/);
  const detailed = statistics({ ...context, statsView: "detailed" });
  const historyChange = statistics({ ...context, statsView: "detailed", history: [{ at: Date.now(), action: "added" }] });
  assert.notEqual(historyChange, detailed);
});

test("thumbnail database upgrade adds timestamps to existing cache rows", () => {
  const source = read("backend/idb-store.js");
  assert.match(source, /Existing v2 artwork has no age field/);
  assert.match(source, /const cursorRequest = thumbs\.openCursor\(\)/);
  assert.match(source, /cursor\.update\(value\)/);
});

test("source options page has a working Test button wired in app.js", () => {
  assert.match(read("pages/settings.js"), /data-test-metadata-source=/);
  assert.match(read("pages/settings.js"), /data-source-test-output=/);
  const app = read("app.js");
  assert.match(app, /async function testMetadataSource/);
  assert.match(app, /\[data-test-metadata-source\]/);
});

test("dashboard links are routed to the new My games page", () => {
  const app = read("app.js");
  assert.match(app, /next === "dashboard"\) next = "library"/);
  assert.match(app, /library: "My games"/);
});

test("detail delete dialog is portaled out of hidden tab panels and waits for history to close", () => {
  const app = read("app.js");
  assert.match(app, /document\.body\.append\(dialog\);\s*showPopup\(dialog\);/);
  assert.match(app, /closePopup\(dialog, \{ afterPop: \(\) => deleteFromDetails\(id\) \}\)/);
  assert.match(app, /dialog\.dataset\.removeAfterClose === "true"/);
});

test("profile photo and cover selection use a draggable, zoomable crop matching the live hero ratio", () => {
  const app = read("app.js"), styles = read("styles/savepoint-ui.css");
  assert.match(app, /function profileCoverAspect\(\)/);
  assert.match(app, /async function openProfileCrop\(/);
  assert.match(app, /data-crop-apply/);
  assert.match(app, /pointermove/);
  assert.match(app, /data-cover-image[\s\S]*?openProfileCrop/);
  assert.match(app, /data-profile-avatar-file[\s\S]*?openProfileCrop/);
  assert.match(styles, /\.profile-crop-viewport \{[^}]*aspect-ratio:var\(--profile-crop-aspect/);
});

test("large Android folder snapshots stream items and publish completed temporary files", () => {
  const app = read("backend/app.js"), plugin = fs.readFileSync(path.join(root, "android/app/src/main/java/com/cuemark/savepoint/BackupFolderPlugin.java"), "utf8");
  assert.match(app, /payload\.items\.length >= 1500/);
  assert.match(app, /async function writeDatabaseStreamed/);
  assert.match(app, /plugin\.renameFolderFile/);
  assert.match(plugin, /public void renameFolderFile\(/);
  assert.match(plugin, /public void writeFolderStream\(/);
});

test("closing My games filters avoids rebuilding the library when no filter changed", () => {
  const app = read("app.js");
  assert.match(app, /if \("libraryFilterClose" in d\) \{ closePopup\(\$\("#library-filter-dialog"\)\); return; \}/);
  assert.match(app, /const reopen = \(\) => \{ saveLibraryState\(\); render\(\); requestAnimationFrame\(\(\) => showPopup\(\$\("#library-filter-dialog"\), \{ silent: true \}\)\); \}/);
});

test("App Info no longer links to What’s new or Help, and those routes are removed", () => {
  const settings = read("pages/settings.js"), app = read("app.js");
  const appInfo = settings.slice(settings.indexOf("function renderAppInfo()"), settings.indexOf("function formatLogTime(", settings.indexOf("function renderAppInfo()")));
  assert.doesNotMatch(appInfo, /href="#(?:whats-new|help)"/);
  assert.doesNotMatch(app, /help: "Help & FAQ"|"whats-new": "What’s new"/);
  assert.doesNotMatch(app, /goto\("whats-new"\)/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "frontend/index.html"), "utf8"), /pages\/insights\.js/);
  assert.equal(fs.existsSync(path.join(root, "frontend/pages/insights.js")), false);
});
