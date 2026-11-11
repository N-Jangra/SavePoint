# SavePoint

SavePoint is a local-first game library and playtime tracker for web and Android. Organize the games you own or want to play, record progress and ratings, discover titles from multiple catalogs, and review your collection through activity and statistics.

> SavePoint is built with HTML, CSS, and vanilla JavaScript. The Android app packages the same `frontend/` app using Capacitor.

## Features

| Area | What you can do |
|---|---|
| Library | Add games manually or from a metadata source; search, sort, and filter by status, platform, and tags. All Games includes every status; On Hold, Dropped, and Completed have status-specific collections. |
| Game tracking | Set Backlog, Upcoming, Playing, On Hold, Dropped, or Completed; log playtime, set a goal, and rate games. |
| Game details | View and cache provider descriptions, portrait covers, screenshots, tags, links, requirements, playtime estimates, and other available details. Steam trailers play inline in the details page. |
| Discover | Browse suggestions and search a single catalog or enabled sources together; add games directly to the library. |
| Mix fetch | Experimental combined search that merges matching metadata from enabled sources into one saved game. A per-game source index keeps every matched source, so syncs never shrink a Mix game. |
| Library tools | Multi-select on Home, undo toasts, drag-to-merge, Fix match, Change cover, import duplicate detection, and per-game Retry/Ignore, a match review list and a Settings → Metadata Sync page on the Sync page. |
| Timeline and statistics | Review status changes by day on the Timeline, and explore a Statistics overview with Play time (split by status: time spent, time saved on dropped games, time left on playing and on-hold games, and money per status), Library breakdown, Activity and Ratings sub-pages (grouped ratings and quick rate). |
| Sharing | Share a Home group as themed images (choose games per page and how many pages) or as a PDF list, and share any game's details page as a PDF or image with its saved metadata and screenshots; every share can be saved to Downloads or sent through Android's share sheet. |
| Profile collections | Open All Games, Completed, Favorites, On Hold, or Dropped games, in that order. Favorites has its own page; other collection filters do not include a favorites-only option. Empty status collections offer an Add games card. |
| Settings | Customize appearance and navigation; configure metadata sources, storage, backups, tracking, and diagnostics. |
| Performance | Load library batches and defer off-screen artwork until it approaches the viewport, keeping large image-heavy collections responsive. |
| Offline use | Keep library data locally and cache provider details/artwork where the selected platform and storage settings allow. Video trailers stream when played and are not copied into the library folder. |

## Metadata sources

Built-in source availability and priority are managed in **Settings → Metadata Sources**.

| Source | Data | Setup |
|---|---|---|
| FreeToGame | Free-to-play catalog, descriptions, screenshots, platform and requirements where available. | No key required. |
| Steam + SteamDB | Steam search and game details, store links, price, artwork, screenshots, categories and requirements. | No key required. |
| HowLongToBeat | Main story, main plus extras, completionist estimates and community details. | Browser preview uses the local proxy; Android can use the provider consent/session integration. |
| RAWG | Game catalog, ratings, artwork, screenshots, genres, platforms, achievements and related titles. | Configure a personal API key in Settings. [RAWG API](https://rawg.io/apidocs) |
| IGDB | Game catalog, ratings, covers, screenshots, genres, platforms, modes, credits and website links. | Configure a Twitch Client ID and access token in source options. [Twitch authentication](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/) |
| Custom JSON | Search and optional detail fields from a user-configured JSON endpoint. | Configure field mappings in **Settings → Metadata Sources → Add JSON**. |

Provider data varies by game and source. RAWG and IGDB are disabled until configured. Keep API credentials private; they are stored with app preferences and may be included in exports.

### Artwork and video behavior

When Mix fetch has a HowLongToBeat match, its portrait cover is preferred for the game's portrait cover slot. Other source artwork remains available as a fallback, and landscape artwork is kept for wide hero backgrounds. Steam trailers use the browser's inline video player and stream from Steam when played (`preload="none"`); SavePoint stores the trailer URL with cached details but does not save the video file in the library folder.

## Screens and routes

| Screen | Route | Purpose |
|---|---|---|
| Home / Collection | `#dashboard` | Search and manage saved games. |
| Discover | `#discover` | Browse suggestions and search providers. |
| Explore | `#explore` | Open source catalogs, Mix fetch, Timeline, and Statistics. |
| Mix fetch | `#mix` | Search enabled providers together. |
| Timeline | `#timeline` | Review game status-change activity. |
| Statistics | `#statistics` | Collection overview and statistics subpages. |
| Settings | `#settings` | Configure app behavior, sources, and storage. |
| Add game | `#add` | Create or edit a library entry. |
| Game details | `#details?id=<entry-id>` | View and update a saved game or metadata preview. |

Navigation adapts to phone, tablet, and desktop widths. On phones it uses the configurable bottom bar; wider layouts can use a sidebar. Main-page headers stay pinned during scrolling and bottom navigation stays fixed. The route is part of the URL hash, so screens can be linked or refreshed.

## Data and storage

SavePoint keeps the library on the user's device. Games live in **IndexedDB** (`savepoint_library`, one record per game, written by a data worker) with a device artwork cache; a small startup mirror (preferences and history) stays under `splitapp_savepoint_v1` in `localStorage`; metadata responses can also use browser Cache Storage. Android adds native storage and optional folder-based database/artwork backups. Native encrypted records, the browser mirror, and folder JSON are separate storage layers; **folder and exported JSON/TAR backups are plaintext** unless protected separately.

The core state has three parts:

| Part | Contents |
|---|---|
| `items` | Game identity, status, playtime, goals, rating, source identifiers, cached details and image references. |
| `history` | Activity records used by the Timeline and recent-activity views. |
| `preferences` | Appearance, navigation, tracking, metadata source settings, credentials, and backup options. |

Import accepts `.json` backups (history is restored for added games, blank fields of existing games are filled in) and `.txt`/`.csv` names lists; it does not restore preferences. Manual exports can leave out ratings and reviews. Save backups before moving or resetting app data. See [storage documentation](docs/storage.md) and [data schema](docs/db-schema.md).

## Run the browser preview

### Requirements

- Node.js 18 or newer
- npm
- Network access for live provider searches

From the repository's `SavePoint/` directory:

```sh
npm install
npm run serve
```

Open the loopback URL printed by the server. Use this server for browser metadata searches: opening `frontend/index.html` directly with `file://` can block cross-origin requests. `dev-server.js` serves the frontend and provides a restricted proxy for supported providers; it is a development tool, not a production metadata backend.

## Build Android

Requirements: JDK 17, Android SDK/platform tools, and the project-managed Gradle wrapper. After installing npm dependencies:

```sh
npm run cap:sync
cd android
./gradlew assembleDebug
```

The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`. For a signed release, run `python3 compile_apk.py` (add `--version 0.1.4` to set the version, or `--debug` for a debug APK); it writes `dist/savepoint-<version>-release.apk` and signs it when `android/keystore.properties` exists. More details: [requirements and build instructions](docs/requirements.md).

The current 0.1.4 release APK is packaged as `dist/savepoint-0.1.4-release.apk` after a signed release build.

## Repository layout

```text
SavePoint/
├── android/                         # Capacitor Android project and native plugins
│   └── app/src/main/java/com/cuemark/savepoint/
├── docs/                            # Product and technical documentation
├── frontend/
│   ├── backend/                      # Storage and metadata service modules
│   │   └── features/                 # Providers, search, details, sources, Mix fetch
│   ├── components/                   # Shared UI components
│   ├── icons/                        # App and interface icon assets
│   ├── pages/                        # Dashboard, Discover, Details, Settings, etc.
│   ├── static/                       # Static supporting pages/assets
│   ├── styles/                       # Base, responsive, theme, and page styles
│   ├── app.js                        # Routing, app state, interactions, persistence
│   └── index.html                    # SPA shell and frontend entry point
├── plans/                            # Engineering notes
├── dev-server.js                     # Local preview server and metadata proxy
├── capacitor.config.json             # Capacitor app identity and web directory
├── package.json                      # Scripts and Capacitor dependencies
└── README.md
```

### Important frontend modules

| Path | Responsibility |
|---|---|
| `frontend/app.js` | Hash routing, shared state, user actions, settings, import/export. |
| `frontend/backend/app.js` | Browser and Android storage bridge. |
| `frontend/backend/features/metadata.js` | Built-in provider registry and preference normalization. |
| `frontend/backend/features/discover.js` | Provider searches, suggestions, request cache, and result mapping. |
| `frontend/backend/features/show-detail-controller.js` | Provider-specific details loaders. |
| `frontend/backend/features/mix.js` | Matching and merging data across enabled providers. |
| `frontend/pages/` | Screen rendering modules. |
| `dev-server.js` | Local static hosting and restricted provider proxy. |

## App identity

| Property | Value |
|---|---|
| Package | `savepoint` |
| Version | `0.1.4` |
| Capacitor / Android application ID | `com.cuemark.savepoint` |
| Capacitor web directory | `frontend/` |
| Browser state key | `splitapp_savepoint_v1` |

## Documentation

- [App walkthrough](docs/app-walkthrough.md)
- [Metadata sources and credentials](docs/metadata.md)
- [Metadata request and cache behavior](docs/metadata-analysis.md)
- [Storage and backups](docs/storage.md)
- [Data schema](docs/db-schema.md)
- [Database analysis](docs/database-analysis.md)
- [Requirements and builds](docs/requirements.md)
- [Changelog](CHANGELOG.md)
