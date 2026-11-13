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

test("Games tab offers list, posters and cards views", () => {
  const { games } = pages();
  for (const view of ["list", "posters", "cards"]) {
    const html = games({ items: sample, esc, gamesTab: "ongoing", gamesView: view });
    assert.match(html, /data-games-view/);
    if (view === "cards") assert.match(html, /is-card-view/);
    if (view === "posters") assert.match(html, /is-poster-view/);
  }
});

test("Profile links to all games, favorites, on-hold, dropped, and completed collections", () => {
  const { profile } = pages();
  const html = profile({ items: sample, esc, prefs: {}, dataRevision: 1, libraryLoading: false });
  assert.match(html, /All games <small>9<\/small>/);
  assert.match(html, /Favorites <small>1<\/small>/);
  assert.match(html, /library\?status=On%20Hold/);
  assert.match(html, /library\?status=Dropped/);
  assert.match(html, /Completed games <small>1<\/small>/);
  assert.match(html, /library\?status=Completed/);
  assert.doesNotMatch(html, /Add completed games|Add on-hold games|Add dropped games/);
  assert.ok(html.indexOf("All games <small>9</small>") < html.indexOf("Completed games <small>1</small>"));
  assert.ok(html.indexOf("Completed games <small>1</small>") < html.indexOf("Favorites <small>1</small>"));
  assert.ok(html.indexOf("Favorites <small>1</small>") < html.indexOf("On Hold <small>1</small>"));
  assert.ok(html.indexOf("On Hold <small>1</small>") < html.indexOf("Dropped <small>1</small>"));
});

test("Profile shows status add cards only when that collection is empty", () => {
  const { profile } = pages();
  const items = [game(1, "Active", "Playing"), game(2, "Held", "On Hold")];
  const html = profile({ items, esc, prefs: {}, dataRevision: 2, libraryLoading: false });
  assert.match(html, /Add completed games/);
  assert.doesNotMatch(html, /Add on-hold games/);
  assert.match(html, /Add dropped games/);
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
  for (const status of ["On Hold", "Dropped", "Completed"]) {
    const html = library({ ...libraryContext(), libraryStatus: status });
    assert.deepEqual([...libraryRows()].map(row => row.status), [status]);
    assert.match(html, new RegExp(`<h2>${status === "Completed" ? "Completed games" : status}`));
    assert.doesNotMatch(html, /Favorites only|data-library-favorites/);
    assert.doesNotMatch(html, /data-library-status=/);
  }
  const all = library(libraryContext());
  assert.doesNotMatch(all, /Favorites only|data-library-favorites/);
  assert.match(all, /<h2>All games/);
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
