"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

function load(files, extra = {}) {
  const window = { ...extra };
  const context = vm.createContext({ window, Date, Map, Set, WeakMap, Object, Array, String, Number, Math, Intl, JSON, RegExp, console, setTimeout, clearTimeout, TextDecoderStream, DecompressionStream, TransformStream, Uint8Array, Error });
  for (const file of files) vm.runInContext(read(file), context, { filename: file });
  return window;
}

test("0.1.10 changelog, docs and version metadata agree", () => {
  assert.equal(JSON.parse(read("package.json")).version, "0.1.10");
  assert.match(read("frontend/app-config.js"), /"version": "0\.1\.10"/);
  assert.match(read("android/app/build.gradle"), /versionName "0\.1\.10"/);
  assert.match(read("android/app/build.gradle"), /versionCode 110/);
  assert.match(read("CHANGELOG.md"), /## \[0\.1\.10\] — 2026-11-17/);
  assert.match(read("README.md"), /\| Version \| `0\.1\.10` \|/);
  assert.match(read("docs/README.md"), /SavePoint 0\.1\.10/);
  assert.match(read("docs/storage.md"), /Transfers: progress, notifications and images \(0\.1\.10\)/);
});

test("reading a backup reports bytes read against the file size", async () => {
  const window = load(["frontend/components/backup-stream.js"]);
  const text = JSON.stringify({ app: "SavePoint", items: Array.from({ length: 40 }, (_, i) => ({ id: i, title: `Game ${i}` })), history: [], preferences: {} });
  const bytes = new TextEncoder().encode(text);
  const file = { size: bytes.length, slice: () => ({ arrayBuffer: async () => bytes.slice(0, 4).buffer }), stream: () => new ReadableStream({ pull(controller) { controller.enqueue(bytes.slice(0, 64)); controller.enqueue(bytes.slice(64)); controller.close(); } }) };
  const seen = [];
  const data = await window.SplitAppBackupStream.parseFile(file, { onBytes: (done, total) => seen.push([done, total]) });
  assert.equal(data.items.length, 40);
  assert.ok(seen.length >= 2);
  assert.equal(seen.at(-1)[0], bytes.length);
  assert.ok(seen.every(([done, total]) => total === bytes.length && done <= total));
  assert.ok(seen.every((entry, index) => index === 0 || entry[0] >= seen[index - 1][0]), "progress never goes backwards");
});

test("achievements no longer include Platform hopper or the Genre loyalist family", () => {
  const achievements = load(["frontend/pages/achievements.js"]).SplitAppAchievements;
  const rows = achievements.entries([]);
  assert.equal(rows.some(row => row.family === "platform-three" || row.family === "genre-loyalist"), false);
  assert.equal(rows.some(row => /Favourite flavour|Genre devotee|Genre master/.test(row.title)), false);
  assert.ok(rows.some(row => row.family === "genre-atlas"), "other discovery badges remain");
  for (const row of rows) assert.ok(fs.existsSync(path.join(root, "frontend", row.asset)), `${row.asset} exists`);
  assert.ok(!fs.existsSync(path.join(root, "frontend/icons/achievement-badges/genre-loyalist-t1.svg")));
});

test("a badge detail page shares from a top-bar icon, not a bottom text button", () => {
  const window = load(["frontend/pages/achievements.js"]);
  const html = window.SplitAppPages.achievements({ items: [], esc, achievementId: "a-first-game-t1", roles: {} });
  assert.match(html, /class="ach-share-icon" data-share-badge="first-game-t1"/);
  assert.doesNotMatch(html, /Share badge image<\/button>/);
});

test("the sync page offers Clear updated, Clear failed and Clear all", () => {
  const window = load(["frontend/pages/sync.js"]);
  const job = { finished: true, paused: false, entries: [{ id: "1", title: "A", status: "done" }, { id: "2", title: "B", status: "failed", error: "x" }] };
  const html = window.SplitAppPages.sync({ syncJob: job, syncCounts: () => ({ total: 2, done: 1, failed: 1, completed: 2, syncing: 0, percent: 100 }), esc, reviewItems: [] });
  assert.match(html, /data-sync-clear-status="done">Clear updated \(1\)/);
  assert.match(html, /data-sync-clear-status="failed">Clear failed \(1\)/);
  assert.match(html, /data-sync-clear>Clear all/);
});

test("clearing sync rows by status keeps the rest and finishes an idle job", () => {
  const app = read("frontend/app.js");
  assert.match(app, /function clearSyncEntries\(status\)/);
  assert.match(app, /syncJob\.entries = syncJob\.entries\.filter\(entry => entry\.status !== status\)/);
  assert.match(app, /entry\.status === "queued" \|\| entry\.status === "syncing"\)\) syncJob\.finished = true/);
});

test("the import review is simple: no game preview list and no restore notes", () => {
  const page = read("frontend/pages/import-preview.js");
  assert.doesNotMatch(page, /Games to add/);
  assert.doesNotMatch(page, /After restoring/);
  assert.doesNotMatch(page, /ratings/);
  assert.match(page, /data-continue-import/);
  assert.match(page, /import-read-bar/);
});

test("import progress advances while saving and while caching images", () => {
  const app = read("frontend/app.js");
  assert.match(app, /const reportImport = \(fraction, message\)/);
  assert.match(app, /reportImport\(saveShare \+ \(1 - saveShare\) \* imageDone \/ imageJobs\.length/);
  assert.match(app, /async function mapPool\(list, limit, worker\)/);
});

test("a floating transfer button reopens a running import or export", () => {
  const app = read("frontend/app.js");
  assert.match(app, /function setTransfer\(kind, percent = 0, label = ""\)/);
  assert.match(app, /goto\("import-preview"\)/);
  assert.match(app, /setTransfer\("export"/);
  assert.match(app, /setTransfer\(null\)/);
  assert.match(read("frontend/styles/ui-polish.css"), /\.transfer-fab\{bottom:calc\(158px/);
});

test("the notification is cancelled with the app, can expire and has import wording", () => {
  const java = read("android/app/src/main/java/com/cuemark/savepoint/ShareIntentPlugin.java");
  assert.match(java, /protected void handleOnDestroy\(\)/);
  assert.match(java, /public void load\(\)/);
  assert.match(java, /setTimeoutAfter\(EXPORT_PROGRESS_TIMEOUT_MS\)/);
  assert.match(java, /Importing backup/);
  assert.match(java, /Import complete/);
});

test("library posters use the same per-status progress colours as the profile", () => {
  const css = read("frontend/styles/savepoint-ui.css");
  for (const status of ["backlog", "playing", "on-hold", "dropped", "upcoming", "completed"]) assert.match(css, new RegExp(`\\.library-grid \\.demo-poster-progress\\[data-status="${status}"\\] i`));
  assert.doesNotMatch(css, /\.library-grid \.demo-poster-progress i \{[^}]*background:var\(--d-gold\)/);
  assert.match(read("frontend/styles/ui-polish.css"), /demo-poster-progress\[data-status="upcoming"\] i/);
});

test("the game details top bar is transparent", () => {
  const css = read("frontend/styles/savepoint-ui.css");
  assert.match(css, /html body\[data-page="details"\] \.demo-cinema-page \.demo-detail-heading \{[^}]*background: transparent !important[^}]*backdrop-filter: none !important/);
});

test("Steam trailers fall back to HLS and render as tap-to-play thumbnails", () => {
  const controller = read("frontend/backend/features/show-detail-controller.js");
  assert.match(controller, /m\.hls_h264/);
  assert.match(controller, /application\/vnd\.apple\.mpegurl/);
  const details = read("frontend/pages/details.js");
  assert.match(details, /data-video-play/);
  assert.match(details, /Can't play here · Open the video/);
  assert.doesNotMatch(details, /<video controls playsinline webkit-playsinline preload="metadata"/);
  const css = read("frontend/styles/details.css");
  assert.match(css, /\.detail-video-card \{[^}]*border:0;[^}]*background:transparent/);
});

test("the HLS player ships locally and restores playlist URLs under Capacitor", () => {
  assert.ok(fs.existsSync(path.join(root, "frontend/vendor/hls.min.js")));
  assert.ok(fs.statSync(path.join(root, "frontend/vendor/hls.min.js")).size > 200000, "full hls.js build (alternate audio support)");
  const app = read("frontend/app.js");
  assert.match(app, /vendor\/hls\.min\.js/);
  assert.match(app, /class UrlKeepingLoader extends BaseLoader/);
  assert.match(app, /if \(response\) response\.url = context\.url/);
  assert.match(app, /You're offline\. The trailer link is saved with this game\./);
});

test("Change cover shows on-device copies and works offline", () => {
  const app = read("frontend/app.js");
  assert.match(app, /function coverCandidates\(item, local = \{\}\)/);
  assert.match(app, /loadItemImages\?\.\(item\)/);
  assert.match(app, /return navigator\.onLine \? rows : rows\.filter\(row => row\.src !== row\.url\)/);
  assert.match(app, /No saved pictures for this game yet/);
});

test("fast scrolling and load more stay ahead of the viewport", () => {
  const app = read("frontend/app.js");
  assert.match(app, /const buffer = viewport \* 2\.5/);
  assert.match(app, /const lead = Math\.max\(2, Math\.ceil\(viewport \/ metrics\.row\)\)/);
  assert.match(app, /rootMargin: "0px 0px 1500px 0px"/);
});

test("identical list renders are skipped but virtual grids always redraw", () => {
  const app = read("frontend/app.js");
  assert.match(app, /STABLE_RENDER_PAGES = new Set\(\["dashboard", "library", "games", "profile", "favorites"\]\)/);
  assert.match(app, /!content\.querySelector\("\[data-virtual-grid\]"\)/);
});

test("exports package a game's images concurrently", () => {
  const backend = read("frontend/backend/app.js");
  assert.match(backend, /await Promise\.all\(Object\.entries\(loaded \|\| \{\}\)\.map\(async \(\[path, source\]\)/);
});

test("grouping All games by status orders Upcoming, Playing, On Hold, Completed, Dropped, Backlog", () => {
  const window = load(["frontend/pages/profile.js", "frontend/pages/games.js", "frontend/pages/library.js"]);
  const game = (id, status) => ({ id: String(id), title: `${status} game`, status, category: "game", platform: "PC", progress: 0, goal: 10, createdAt: id, updatedAt: id });
  const statuses = ["Backlog", "Dropped", "Completed", "On Hold", "Playing", "Upcoming", "Wishlist"];
  const html = window.SplitAppPages.library({ items: statuses.map((status, index) => game(index + 1, status)), esc, libraryState: { view: "grid" }, libraryStatus: "all", libraryStatusGroups: true });
  const order = [...html.matchAll(/library-status-group"><h3>([^<]+?) <span>/g)].map(match => match[1]);
  assert.deepEqual(order, ["Upcoming", "Playing", "On Hold", "Wishlist", "Completed", "Dropped", "Backlog"]);
});
