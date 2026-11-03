# Changelog

Notable SavePoint changes are recorded here. The project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/) (`0.x` while the app is evolving).

## [0.1.0] — 2026-11-04

### Added

- IGDB game search and details using a Twitch Client ID and access token.
- Browser-preview HowLongToBeat search and detail requests through the local allowlisted proxy, alongside the Android consent/session flow.
- Mix fetch for combined source search and merged metadata when a result is saved.
- More detailed playtime, activity, ratings, and library statistics pages.
- Touch drag-and-drop ordering for bottom-bar destinations and source priorities.
- Pull-to-refresh on library, Discover, Timeline, Statistics, and source views.

### Changed

- Updated responsive layouts for tablet views, including dashboard, details, and statistics pages.
- Refined navigation history so browser and Android system back follow the in-app route stack and dismiss open sheets first.
- Saved discovery additions with source identity, merged provider metadata, and cached artwork for faster reopening and offline access.
- Fresh-install appearance defaults: Light theme, inline icons, icon-color navigation, icon-only labels, solid background, sharp corners, and Home/Discover/Explore/Settings destinations.
- Updated Settings, source configuration, filter sheets, details actions, and collection cards for clearer mobile and tablet use.

### Fixed

- Home game action menus, including View details and status/color actions.
- Details navigation during metadata loading, source-options back navigation, and deletion returning to the library.
- Missing separators between grouped dashboard game rows.
- Bottom-bar placement and excess page spacing across scrollable screens and settings subpages.
- Discover cards accurately reflecting games already in the library.

### Notes

- HowLongToBeat can still reject requests or require renewed consent/session data.
- Custom sources provide JSON only. A browser endpoint must allow CORS unless requests pass through a supported local preview proxy.
- JSON import currently imports items only; it does not restore history or preferences. JSON and folder backups are plaintext unless separately protected.
- Opening the app with `file://` can block browser metadata requests; use `npm run serve` for browser preview.

Initial tracked version of SavePoint, a local-first game library and playtime tracker for browsers and Android (Capacitor application ID `com.cuemark.savepoint`). Version 0.1.0 includes game status/playtime/rating tracking, Home, Discover, Details, Add Game, Timeline, Statistics, Explore, and Settings; browser localStorage, Android storage and folder backups; provider-based metadata; responsive layouts; and the additions, changes, and fixes listed above.
