# Changelog

All notable changes to SavePoint are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/) (`0.x` while the app is still taking shape).

## [0.1.0] — 2026-10-29

First tracked release of SavePoint: a local-first game library and playtime tracker that runs in a browser and as an Android app (Capacitor, app ID `com.cuemark.savepoint`).

### How the app works

- **Library:** every game has a title, cover, description, status (Backlog, Playing, On Hold, Dropped, Completed), playtime in hours, playtime goal and rating (5 stars or 10 points). Games are added by hand or from a metadata source and edited from the Details page.
- **Home:** games grouped by status (or category, release year, or ungrouped), with live search, status chips with counts, a filter sheet (sort, status, layout, group-by, theme, density, thumbnails/ratings/progress), a three-dot action sheet on each card, and a floating add button.
- **Discover:** suggestion rows (Steam, FreeToGame, RAWG, custom sources) when empty; search across all enabled sources or one source; details preview and one-tap add.
- **Details:** source-backed page with cover, backdrop, status/age badges, buy strip, playtime stepper, status and rating controls, tags, player ratings, store links, facts table, screenshots, related games, achievements and team.
- **Statistics, Timeline, Explore:** completion rate and status cards, *Time to beat* (hours logged, library length, hours left, library price), activity chart and ratings; a status-change timeline with covers; a hub for both and for source search.
- **Settings:** appearance, dashboard, tracking, backups & sync, metadata, metadata & storage, a standalone Storage page, App Info and Logcat, plus custom metadata sources.
- **Data:** state is stored as JSON under `splitapp_savepoint_v1`. On Android items and metadata are also stored in an encrypted native store, mirrored to an optional shared folder with per-game JSON and image thumbnails, with daily TAR backups and JSON export/import.

### Added

#### Interface and layout
- iOS-style visual design: grouped cards, frosted headers, pill filters, bottom sheets, violet accent, Light and Dark themes (other themes keep their own colours).
- Multi-screen layout: phone bottom bar; tablet icon rail; desktop sidebar; wider grids; sheets become centred windows on wide screens; optional sidebar switch.
- Redesigned Home, Details, Add/Edit, filter sheet, Timeline, Statistics, Logcat, App Info, Storage, Metadata Sources, Bottom Menu Icons and Settings index pages.
- Details: −1h/+1h/+5h playtime buttons, status pills, animated star rating, buy strip, tags, rating bar, where-to-buy, carousels, collapsible achievements and team.
- Add page: auto-fill metadata search card, cover/title/description card, status pills, playtime and goal steppers, star picker.
- Timeline entries show the game's cover with a status icon.
- Statistics *Time to beat* panel and **Fetch details for N games** for games never opened.
- Discover suggestion rows with loading placeholders.
- Bottom Menu Icons page with per-destination icon carousels (CueMark style).
- Settings: Show scrollbars and Show sidebar toggles; Storage, App Info and Logcat reachable directly from the Settings index.

#### Custom sources
- **Custom metadata sources:** add any JSON search API on a guided three-step page (Connect, Read the results, More details) with a Test button. Custom sources join search, Discover suggestions and details, can be reordered and switched off, and are stored with preferences.

#### Metadata and data
- Providers: Wikidata, FreeToGame, Steam + SteamDB, HowLongToBeat (Android only), RAWG (API key).
- Rich detail loaders for every provider with a common detail shape (`schemaVersion: 2`).
- `facts` summary saved on each game (play time, price, developers, requirements, names, team) and merged across providers; all detail images saved as thumbnails.
- HowLongToBeat in the Android app reuses the session from the in-app consent window; the browser shows a clear "Android app only" message.
- Discover suggestions from Steam, FreeToGame, RAWG and custom sources.

#### Navigation and motion
- Launch screen modelled on CueMark's (icon, name, dots) honouring Animation speed and Reduce motion.
- Direction-aware page transitions, sheet and dialog animations, press feedback, short staggered card entrance, animated progress bars.
- Low-memory mode (≤2 GB, ≤2 cores or data saver): no blur or shadows, solid headers, shorter animations; off-screen groups skip layout.
- Deep links for every screen, including `#details?id=<item id>` and `#settings/custom-source?id=<id>`.
- Back button (browser and Android) closes an open sheet first, then goes back; tapping outside a sheet closes it; Android back leaves the app only from Home.

### Changed
- Fresh installs now start with the Light theme, scrollbars hidden, a Home / Discover / Explore / Settings bottom bar with home, bookmark, compass and gear icons, and FreeToGame, Steam + SteamDB and HowLongToBeat enabled (Wikidata and RAWG off until turned on).
- Home cards show the rating and the status pill in one row.
- Back on settings subpages (Storage, Metadata Sources, and the others) returns to the page you came from, including Explore.
- Status, sort, layout, group-by, theme and density options now use button pills and segmented controls instead of dropdowns.
- Three-dot menu is now a bottom action sheet instead of an inline dropdown.
- App Info and Logcat moved out of their own group to "More" on the Settings index; the Storage page is a standalone link; its Back returns to wherever you came from.
- "Background Encrypted Backups" removed from Metadata & Storage.
- Page shells share one side gutter at every width; viewport scrollbar follows the Show scrollbars setting.
- Page changes no longer use smooth scrolling.
- Version set to 0.1.0 (app config, npm package, Android `versionName`).

### Fixed
- Filter and status chips applying the wrong value after a re-render (form state restore overwrote radio values).
- Taps on Discover cards reloading the page and wiping results; returning from Details keeps the last search.
- Details page overflowing the screen width (grid items now shrink; galleries scroll inside their card).
- Rating stars needing a page revisit to update.
- Details URL lost on refresh ("That entry is no longer in your library").
- Show sidebar setting hidden on screens narrower than 1080px.
- Add page search button text unreadable on the purple button.
- HowLongToBeat 403 after consent (session and User-Agent now shared with the app's requests), and 403 on opening its details.
- Sheets and Settings page overlays: double scrollbars and clipped three-dot menus.

### Known limitations
- HowLongToBeat works only in the Android app and can still refuse requests; sources that block apps cannot be added as custom sources.
- Custom sources accept JSON only; in a PC browser the API must allow cross-origin requests.
- JSON import restores items only, not history or preferences. Exports, folder databases and TAR backups are not encrypted.
- Games previewed from Discover cannot be reopened after a page refresh.
- Light and Dark themes use the new violet palette; the other themes keep their own colours.

