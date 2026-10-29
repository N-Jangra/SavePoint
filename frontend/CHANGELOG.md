# Changelog

All notable changes to SavePoint are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/) (`0.x` while the app is still taking shape).

## [0.1.0] — 2026-10-29

First tracked release of SavePoint: a local-first game library and playtime tracker that runs in a browser and as an Android app (Capacitor, app ID `com.cuemark.savepoint`).

### How the app works

- **Library:** each game has a cover, description, status (Backlog, Playing, On Hold, Dropped, Completed), playtime and goal in hours, and a rating (5 stars or 10 points). Add games by hand or from a metadata source.
- **Screens:** Home (grouped by status, category or year, with search and a filter sheet), Discover, Details, Statistics, Timeline, Explore and Settings, with custom metadata sources.
- **Data:** JSON under `splitapp_savepoint_v1`; on Android games and metadata also live in an encrypted native store, mirrored to an optional shared folder with per-game JSON and image thumbnails, daily TAR backups and JSON export.

### Added

- **Interface:** iOS-style cards, sheets and pills; Light, Dark and other themes with per-theme text contrast; phone bottom bar, tablet icon rail and desktop sidebar; direction-aware transitions and a low-memory mode; deep links for every screen; in-app confirmation sheets; pull to refresh on Details.
- **Details:** tabs (Overview, Ratings, Achievements, Team & series) shown when a game has that data; playtime stepper, status pills and star rating; buy strip, tags, player ratings, facts, system requirements, languages, screenshots, related games; Edit and Delete in the header with Cancel / Save while editing.
- **Metadata:** FreeToGame, Steam + SteamDB, HowLongToBeat (Android only) and RAWG (API key), each loading cast, requirements, tags and prices into one common shape; custom JSON sources added on a guided page with a Test button; Mix fetch (beta) merging every source.
- **Source options:** per-source page for enable, domain, user agent, cookies and API key, with Clear cookies and Reset.
- **Settings:** Animations (speed, easing, transitions, card entrance, sheets, press and hover effects); Date format; Icon style (inside boxes or inline); Image storage (save all, covers only, or online only); Backups & sync; Metadata & Storage; Bottom Menu Icons; Logcat.
- **Discover / Statistics / Timeline:** suggestion rows from Steam, FreeToGame, RAWG and custom sources; *Time to beat*, Week / Month activity chart and ratings; a status timeline with covers.

### Changed

- Fresh installs start on the Light theme with FreeToGame, Steam + SteamDB and HowLongToBeat on (RAWG needs a key).
- Wikidata is no longer a source.
- Dashboard views reduced to List, Compact list, Poster grid, Detailed grid, Compact grid, Large poster grid and Timeline.
- Status, sort, layout and density options use pills and segmented controls; the three-dot menu is a bottom sheet.

### Fixed

- Covers saved in the chosen storage folder now load on start, so they still show offline after the app cache is cleared (previously they only came from the cache or the internet).
- Filter chips applying the wrong value, Discover cards reloading the page, Details overflowing the screen width, a lost Details URL after refresh, HowLongToBeat 403 after consent, Statistics "Left to play" counting, Details header not spanning the page, and Metadata & Storage missing from the Settings index.

### Known limitations

- HowLongToBeat works only in the Android app and can still refuse requests.
- Custom sources accept JSON only; in a PC browser the API must allow cross-origin requests.
- JSON import restores items only, not history or preferences. Exports and folder backups are not encrypted.
- Games previewed from Discover cannot be reopened after a page refresh.
