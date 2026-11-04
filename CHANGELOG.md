# Changelog

Notable SavePoint changes are recorded here. The project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/) (`0.x` while the app is evolving).

## [0.1.1] — 2026-11-04

### Added

- Background metadata sync after importing a list: games are added to the library first, then their details are fetched in the background.
- Floating progress pie with percentage that opens a Metadata Sync page showing what is syncing, what finished, and what failed, with a Retry failed action.
- Pause and resume for metadata sync from the sync page and from the Android progress notification.
- Android progress notification (percentage and "done / total") while metadata syncs.
- Pull-to-refresh on the Home library now syncs every game that has no saved metadata yet.
- IndexedDB library store with one record per game and indexes on status, category, updated and created dates. Existing libraries move over automatically on first launch.
- Data worker: library diffing, IndexedDB writes and (during background sync) merging of multi-source metadata run off the UI thread, with an automatic in-thread fallback where workers are unavailable.
- Adaptive sync concurrency based on CPU cores, device memory, network type, data saver and tab visibility, never above the existing Metadata workers setting.
- Priority network queue: your own requests (opening a game, searching) go ahead of background sync requests on the same source.

### Changed

- Saving, editing, rating, progress changes, adding and deleting a game now write only that game (plus preferences/history). Preference changes no longer rewrite any games. Bursts of changes are batched into a single write.
- Android folder snapshots are batched (up to 8 seconds, or immediately when the app is backgrounded or a game is deleted); per-game data is saved to the encrypted store right away.
- localStorage now holds only the small startup mirror (preferences and history), removing the 5 MB library size limit.
- Mix fetch no longer waits on a slow or unreachable source: once one source answers, the others get a short grace period before results are merged. Repeated source lookups are cached for the session (a manual refresh bypasses the cache), and background syncs skip unseen intermediate merges.
- Home sorting reuses one collator, and status counts no longer sort games just to count them.
- Timeline and Statistics reduce repeated date formatting, timestamp parsing and full-library scans with shared formatters and lookup maps.
- Android artwork loading caches the saved-games folder listing instead of re-listing it for every batch.
- The splash screen now waits for the saved library to load (up to 1.5 seconds).
- Background sync runs in idle time and yields to pending taps and scrolls.
- Long Home lists skip rendering of off-screen cards (`content-visibility`) and empty cards far from the viewport, rebuilding them before they scroll back, so DOM size and memory stay flat (about 2,000 elements with 5,000 games after scrolling through 850 cards).
- Smoother animations on Android and low-end devices: a three-tier performance mode (low / mid / high, with Android WebViews treated as mid unless the device has 6+ GB and 6+ cores) swaps heavy page, sheet and progress transitions for short fades, removes backdrop blur from dialog scrims, and drops decorative motion on the weakest tier. Taps no longer wait for the double-tap delay, and sheets no longer scroll the page behind them.
- The floating sync pie pulses with a compositor-only ring instead of animating a box-shadow; `transition: all` rules were narrowed to the properties that actually change.
- Sync progress is painted at most once per frame, the sync page re-renders at most twice a second, and the native notification is updated at most once a second (plus immediately on pause, resume and finish).
- Statistics page: activity is counted in one pass over history instead of one scan per day, results are reused until the library, history, range or related preferences change, and long statistics lists skip layout for off-screen rows.
- Game lookups by id use an O(1) position index that is re-validated on every hit, replacing repeated full-library scans on edit, sync and detail paths.
- Changed Dashboard status filters to match Discover source chips, stay in one horizontally scrollable row, and retain readable selected-state text and counts.
- Made page top bars use square corners for a consistent edge-to-edge layout.
- Matched Statistics subpage title sizing and placement to Settings headers so titles fit between the back control and right badge.
- Simplified the Import List preview by removing its repeated section heading while keeping the file summary and confirmation steps.
- Updated the import preview top bar to match other subpages.

### Fixed

- Home list no longer jumps back to the first batch of cards, or loses your scroll position, when metadata finishes loading, when you pull to refresh, or when the page re-renders. Loaded batches are remembered per group.
- Import progress card is vertically centered on mobile.
- Metadata Sync page layout on small screens, including clipped status labels.

## [0.1.0] — 2026-11-04

### Added

- IGDB game search and details using a Twitch Client ID and access token.
- Browser-preview HowLongToBeat search and detail requests through the local allowlisted proxy, alongside the Android consent/session flow.
- Mix fetch for combined source search and merged metadata when a result is saved.
- More detailed playtime, activity, ratings, and library statistics pages.
- Touch drag-and-drop ordering for bottom-bar destinations and source priorities.
- Pull-to-refresh on library, Discover, Timeline, Statistics, and source views.
- Inline Steam trailer playback on game detail pages; trailer streams load only when played and their links remain in saved metadata.

### Changed

- Updated responsive layouts for tablet views, including dashboard, details, and statistics pages.
- Refined navigation history so browser and Android system back follow the in-app route stack and dismiss open sheets first.
- Saved discovery additions with source identity, merged provider metadata, and cached artwork for faster reopening and offline access.
- Preferred HowLongToBeat portrait covers for Mix fetch results and detail pages, while keeping landscape artwork for wide backgrounds.
- Deferred off-screen artwork and paged large library lists to reduce rendering and storage work while scrolling.
- Limited blocking touch handlers to active pull-to-refresh and drag gestures to keep regular Android scrolling responsive.
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
