# Changelog

Notable SavePoint changes are recorded here. The project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/) (`0.x` while the app is evolving).

## [0.1.4] — 2026-11-09

### Changed

- New look and navigation modelled on ScreenMark: the bottom bar (and tablet sidebar) has three tabs — **Games**, **Explore** and **Profile** — and the page styles come from ScreenMark's page system (`styles/demo-pages.css`, tokens follow your accent colour).
- **Games** is the home tab with **Ongoing** (Playing) and **Upcoming** tabs in list or poster view, a round "+" to log playtime on each card, and "Browse all games".
- **Explore** is the former Discover page with ScreenMark's shelves, catalog cards and loading placeholders that match the layout of results (one shelf per source, or a single grid for one source). `#explore` links open it.
- **Profile** has a cover and photo, a three-dot menu (Timeline, Stats, Mix fetch, Sources, Settings, About), Add manually, a Stats rail, a Games shelf (opens the full list, formerly the Collection page, now titled My games with a back button) and a Favorites shelf.
- Profile collections appear in this order: **All games**, **Completed games**, **Favorites**, **On Hold**, and **Dropped**. Status collections contain only games with that status; All games includes every status. Empty status collections remain available as links.
- Empty Completed, On Hold and Dropped collections show an **Add games** card; the card appears only while that collection has no matching games.
- **Edit profile** (pencil on the photo): choose your own photo or a cover from your games, with random / newest picks, per-filter pools and change intervals, or pick one specific game and picture (cover, screenshot or background).
- **Favorites** page: a poster grid with hearts; with none yet it lists every game so you can tap hearts to pick.
- **Explore** has no top bar (its own search sits at the top) and its status line ("14 results found… 1 source failed") is a calm one-line message instead of a boxed banner. **Games** tabs no longer show counts.
- **Statistics** is ScreenMark's overview board for games: time spent playing, total hours, games completed, top genres, top studios or platforms, biggest play sessions, games by status and average rating. The Library breakdown and Activity pages were removed.
- **Details** uses ScreenMark's title page: header buttons over a hero band with the cover, source tag, rating / status badges and genres; a progress console (hours played, goal, quick −1h / +1h / +5h) with compact Fix match / Change cover buttons; and tabs for Overview, Details, Media, Ratings, Achievements and Team & series.
- **My games** (the full list) and the other pages share ScreenMark's top bar, surfaces and fonts, and the new pages fade and rise in with a short stagger (off with Reduce motion).
- Main-page headers stay pinned while content scrolls and the bottom navigation remains fixed at the screen edge. Android WebView edge stretch is disabled so overscroll does not pull either bar out of position.
- Default theme follows the system (dark uses AMOLED black, like ScreenMark).
- Bottom bar order is **Games**, **Explore**, **Profile**.
- **Games** has a view button (list, posters, cards). **Ongoing** shows only games you are playing; **Upcoming** shows upcoming and backlog games. Hold and Drop no longer appear there.
- **Statistics** has an **Overall / Detailed** toggle; Detailed is the earlier play-time page with the per-category breakdown.
- **Explore** has a **Normal / Mix fetch** toggle at the top. Mix fetch combines sources and saves the merged details to your library; Normal adds games manually.
- **My games** (`#library`, formerly `#dashboard`) is rebuilt like ScreenMark's collection page: search, a view button (posters, large, list) that remembers your choice, Filters (sort, status, platform, tags), and Share. All games and status collections omit a favorites-only filter because Favorites has its own page. Add and multi-select moved out (Add is on Profile). Large libraries are windowed so thousands of games scroll smoothly. `#dashboard` links open it.
- Tag filters use each game's saved tags and category values. The Favorites page remains the only collection filtered by favorite state.
- Details: Tracking & rating (status, rating, tags) and the Add manually page were redesigned and re-spaced.
- Metadata sources and Source options pages were tidied, and **Source options** has a **Test** button that runs a sample search with the saved key and domain.
- Games: long backlogs show 60 games at a time with a "Show more" button.
- Backups of 2 MB or more are restored from a stream, one game at a time, with a fallback to the whole-file path.
- Source health: a source that fails three times in a row is paused (2 minutes, growing to 15); the Test button bypasses the pause.
- Grid posters stored in the app database are shrunk to a 420 px WebP (new covers only).
- Poster URL cache now matches ScreenMark: O(1) lookups, bounded (about 900, posters on screen kept) and released when the app closes; My games search caches lower-cased titles.
- Android backups from the app are gzip-compressed (`.json.gz`, streamed so large libraries stay out of memory) and carry each game's source and ID.
- Details: Languages is gone; Tracking, Tags and Links sit flat (no boxes); Statistics Detailed drops the game-by-game list.
- Games: the second tab is **Backlog** (backlog and upcoming games); a + on a backlog game moves it to Ongoing. Profile menu drops Stats and Mix fetch (Explore has Mix fetch). Timeline and Metadata Sources lose their intro text; Custom sources empty card redone; Tracking and My rating are separate sections and Tags look like Links; Detailed stats use calmer colours and larger type; Android root text is larger.
- Tests: `npm test` runs `tests/` (page renderers, filters, windowing, navigation, statistics toggle, profile collections, and syntax checks).
- The floating sync progress control announces its updated status to assistive technology as titles finish syncing.
- Discover source pages return to All sources correctly. Starting another search or leaving Discover cancels queued/browser requests and ignores late native responses; repeated renders reuse active suggestions work instead of queuing duplicate catalog calls.
- **Quick setup** (`#setup`): a four-step first-run wizard (games completed, games to play, games playing, games dropped). Trending tiles come from Steam + SteamDB and the search box queries HowLongToBeat; picks are added with the matching status and queued for background sync. It opens on a fresh install (after choosing the storage folder on Android), from the Profile menu, and as a favourites picker on an empty **Favorites** page (tiles and search come from your own library; it returns until at least one favourite is chosen).
- **Explore** tabs (Normal / Mix fetch) span the full width like the Games tabs; the search row is 50 px with an icon-only search button and a grid / list toggle that always shows an icon. **Mix fetch** uses the same search row and results as Normal (poster grid with a corner add badge, or list rows); its intro card was removed. Tapping a game's name or year in Explore opens its details, not just the poster.
- **Games**: pull down to refresh and sync games that need it; the Backlog tab shows an **Upcoming** heading above the **Backlog** group.
- **My games** status pages (`#library?status=…`) show the floating Filters pill (a status from the link is not treated as an applied filter); Reset is a styled button; list pages use a fade-only transition so fixed controls stay in place.
- **Statistics** opens on Overall; the games-count badge is gone from the top bar and Detailed's status cards show a time bar plus game-count and value pills.
- **Details**: the Share button is removed; Tracking, My rating and Tags sit flat (no boxes) and Tracking drops its heading; Screenshots is a borderless, sideways-scrolling row; the hero image is no longer blurred on phones; the Buy on Steam row is stacked with a compact button.
- **Settings**: new **Memory** page (poster images kept in memory: Automatic 900, Low 400, Minimum 150, Large 1,500); Fonts, Icon style, Category colors, Bottom bar layout, Bottom bar corners and the Dashboard settings page were removed (bottom bar corners are always sharp); Tracking moved into the Personalize section; Bottom bar transparency appears only for the Transparent background and Bottom bar background / transparency now work on phones; the default source order is HowLongToBeat, Steam + SteamDB, IGDB, RAWG, FreeToGame; source options pages drop their helper text; decorative header icons were removed from Settings pages and Metadata Sources.
- Back on Timeline, Metadata Sources and App Info returns to Profile; App Info is no longer listed on the Settings page.
- Light themes use the chosen accent colour as-is, and settings toggles use the same markup as ScreenMark.

### Fixed

- Backups (`version: 2`) record each game's source and source id (`backupRef` plus a top-level `index`); CSV exports add Source, SourceID and ID columns and the CSV importer reads them back.
- Browser JSON exports are gzip-compressed (`.json.gz`) and the importer opens `.json`, `.json.gz`, `.csv` and `.txt`; TXT/CSV files with a UTF-8 BOM are read correctly.
- Restore matches a game already in the library by source + source id before falling back to title and year, so renamed or re-spelled games are not duplicated.
- Cancelling a Discover search no longer adds a provider failure or pauses a healthy source; v2 thumbnail rows receive timestamps during the IndexedDB upgrade so cache trimming can remove them; Statistics refreshes when its displayed preferences or history change.
- Regression tests now cover streamed backup parsing across chunk boundaries, cancelled-source health, thumbnail-index migration and Statistics cache invalidation.
- Browser backups use the same per-game packaging as the Android export (no temporary `blob:` image links, source reference included). Restore detects gzip from the file's first bytes rather than its name and reports empty or damaged compressed files clearly.

## [0.1.3] — 2026-11-06

### Added

- Home multi-select: a select button (or hold a card and release in place) lets you tick several games, then change status, favorite or delete them in one go.
- Undo toasts for removing games, bulk actions, merges and imports, plus an automatic backup before bulk changes (follows "Backup before destructive actions").
- Drag one Home card onto another (long-press first) to merge two games into one Mix game that fetches from both sources; progress shows on the Sync page.
- Fix match on a game's details: see each source's linked ID, unlink a source, or search any source and pick the right entry.
- Change cover on a game's details: choose from Steam portrait art, source images and screenshots; the choice survives syncs.
- Sync page: Retry and Ignore buttons for each failed game.
- Import List shows near-duplicates (edition names, missing years) under "Looks like duplicates" so you can skip or keep them; imports can be undone.
- Per-game source index (which source matched under which ID): later syncs fetch by ID, a Mix game never shrinks back to one source, and a source switched off keeps its saved data.
- Games added from Discover, Mix fetch or by hand now run through the Sync page with progress.

- Game details: a **Time to beat** card (main story, main + extras, completionist from HowLongToBeat). Tap one to use it as your goal; games with no goal get their main-story hours automatically and keep following later updates until you pick your own.
- Settings → **Library history** records adds, removals, merges, imports, bulk edits and undos, and flags games that disappeared without a recorded reason.
- Covers from every source (not only the one used as the cover) are now saved into the Screenshots gallery.
- Logcat and Library history are saved in your storage folder (`savepoint-db/logcat.json` and `savepoint-db/library-history.json`) with no 200/400 cap, so older entries stay searchable; both pages have a search box with From / To date filters and Storage has "Clear logcat" and "Clear library history" buttons.

### Changed

- The Sync page's Back button returns to where it was opened from (the page under the floating button, or Settings → Metadata Sync).
- App Info lists metadata sync, Fix match, Library history and Backups, and shows games in library, library size and sources enabled.

- Settings → **Metadata Sync** (new page): run a sync for exactly the games you pick (needs it / no data / failed / every game), choose what pull-to-refresh syncs, refresh interval, sources per game, which sources to look up, parallel games, pause between games, lookup timeout, retries and wait before retry, automatic second pass, and pause in background. Open sync status links to the Sync page.

- Sync: failed games get one automatic second pass after a short cool-down; HowLongToBeat/Steam lookups are throttled per source (with a quiet retry), so a full re-check no longer fails in bulk. Sources that already said "no such game" are not searched again on every refresh (a forced pull or manual retry re-checks them). Saved source ids are never removed by a re-sync.
- Sync page: new "Check these matches" list for games whose matched title differs from yours (Fix match or "Looks right"); Retry / Ignore buttons are laid out on their own row; failed rows keep their buttons while syncing; the page scrolls again on phones; the games list can show more than 60.
- Fix match shows the name of the game each source is linked to, and every result has a View popup (cover, year, description, source page) to confirm before using it.
- Statistics → Play time lists the games that have no play time by name and shows which one is being looked up.
- Details top bar: edit, favourite, share and delete buttons are the same size.
- Game details use a nested back stack: opening another saved game's details from a details page returns to the previous game first; Back from the first details page returns to the originating collection.
- Library history merges the saved file with this device's recent entries and re-reads it each time the page opens.

- Selected cards in select mode have a rounded frame.
- The date filters on Logcat and Library history are laid out as two equal fields with a full-width Clear dates button.
- Pull-to-refresh on Home syncs only games that need it (never fetched, a newly enabled source not yet tried, older than the refresh interval, or a failed lookup); pull again within 20 seconds to re-check everything.
- A game saved from HowLongToBeat (or any source) stays led by that source; Steam can no longer overwrite it when a sync runs.
- Mix and "All sources" search wait longer for HowLongToBeat and merge the same game from Steam and HowLongToBeat into one row; exact title matches are listed first.
- Steam covers use the portrait library art when the game has it instead of the cropped wide banner.
- Going Back from a Settings sub-page returns to the position you left instead of the top.
- The floating sync button hides on the Add page and disappears shortly after a sync finishes.
- Explore no longer has a search box for the three metadata sources.
- Select mode, the Fix match dialog, the details Fix match / Change cover buttons and the Settings search focus ring were tidied.

### Fixed

- Sync page not scrolling on phones; Retry / Ignore buttons squeezed; failed rows losing their buttons during a live sync.
- Pull-to-recheck failing in bulk (timeouts and rate limits); a game fixed with Fix match during a sync no longer appears twice or loses the new match; facts from the old match no longer linger after Fix match / Unlink.
- Details top-bar buttons different sizes; Fix match / Change cover moved into their own card above Playtime & Goal.
- Library history and Logcat could loop re-reading an unreadable file and hid recent entries; date filters now live in a popup opened from a button beside search.
- Option popups for the new sync settings had identical dots; each choice has its own icon.

- Home share dialog error "PER_PAGE is not defined".
- Games added a moment after a sync finished could stay on "Waiting" forever.
- Control matched "Control Resonant" because titles only had to contain each other; matching now requires the same title or a real edition subtitle.
- A source that timed out or was blocked is retried on the next refresh instead of being recorded as already checked.

## [0.1.2] — 2026-11-05

### Added

- **Upcoming** status for games you are waiting on: its own pill with a count on Home, a Home filter option, a "Mark as Upcoming" action, timeline support and its own colour.
- Rotate button in the screenshot viewer: turn any screenshot or thumbnail to landscape inside the viewer only (the rest of the app is not rotated).
- Statistics → Play time redesigned: a summary card (logged time, time left and saved, library value, status bar, pace), a By status list (Completed avg length; Playing to finish; On Hold and Backlog time needed; Dropped time saved; money for each), a card to find missing play times, and a paginated game-by-game breakdown. Metrics are memoized so the page scrolls smoothly.
- Statistics: Library breakdown, Ratings and Activity lists are paginated (10 per page).
- Statistics → Ratings: a Clear all button that removes every rating (with a confirmation).
- Settings → Backups → Export opens an Export page: pick JSON, TXT or CSV, then tick what to include (names always, ratings, reviews). Import List also accepts `.txt` and `.csv` lists (a CSV `Rating` column is read), which are then synced from your sources.
- Home sharing: every group header (for example Playing) has a labelled **Share** button. Its popup has an **Images | PDF** switch. Images: pages that look like the Home list (cover, name, developer · genres, rating, status, hours and a progress bar) in your theme colours, with "Games per page" and "Pages to share" steppers, a paged preview, and Save / Share for the current page or for all chosen pages ("Share all" sends them together). Every page has the group header. Covers and finished pages are cached in IndexedDB, so reopening is fast.
- Home PDF: a real text PDF (not pictures of pages) listing every game in the group in one continuous list: number, cover (or a letter tile when there is none), name, tags, rating and hours, in your theme colours, with Save (to Downloads) and Share.
- Game details: a Share button in the top bar shares that game as a PDF (2–3 A4 pages) or one long image, with checkboxes for details & stats, time to beat, overview, system requirements, tags & languages and all screenshots. It uses the saved metadata (developer, publisher, release date, price, scores, DLC, achievements, HowLongToBeat times and counts, requirements, tags, languages) and has Save and Share.
- Explore has a fixed, shaded top bar like Home; Home and Explore, Details and Settings sub-page headers are translucent and blurred.
- Metadata sync pauses while the app is in the background and resumes when you return (Settings → Metadata → Pause Sync In Background).
- Statistics sub-pages use an icon (following Icon style) instead of a text badge.
- Status chip rows on Add and Details fade at the scrolling edge, show a swipe hint on Add, and start scrolled to the selected status.
- Add Game: the Status chips scroll sideways in one row like the Home pills.

### Changed

- Home: tapping a card's image, name or anywhere on the card opens its details, and Discover cards open details from the image or card too, not just from the name or Details button.
- Home ⋮ menu order is now Edit entry, View Full Details, Add/Remove favorites, the Mark as options, then Remove from Collection; the heart is filled once a game is a favorite.
- Rating Format: switching between 5 stars and 10 points rescales saved ratings (4/5 becomes 8/10 and back) instead of reading old stars as points.
- Restoring a backup keeps each game's saved sources (single or mix) and only fetches details for games that have none; games already in the library get blank ratings, favorites, progress and source details filled in from the backup.
- Logcat times are shown in the device's own time zone with seconds, newest first.
- Progress and Goal accept decimals (for example 62.4), and the quick progress step can be below 1.
- Removed the Games / Sources / Library data tiles from App Info, and the extra helper texts on Discover.
- Home status pills hug their content, the gap between the pills and the first group is smaller, and their order is Playing, Completed, Backlog, Upcoming, On Hold, Dropped, All. The Timeline filter order is This week, This month, All time.
- Quick Rate lists only Completed, Dropped and On Hold games that have no score.
- Home search bar uses the same box as Discover; the Discover header no longer shows the source count or tagline; Back from Metadata Sources returns to Explore or Discover when it was opened from there.
- The ⋮ menu has a solid sheet, centred options and a fixed colour per action that stays distinct with any Main color or theme.
- Every Android device now uses the lighter visual effects (no card entrance animations or layered blur), images far off screen are the only ones unloaded, and sticky bars sit on their own layer, so scrolling is smoother on fast phones.
- A game from a single source now keeps trying to become Mix: new games wait longer for slow sources such as HowLongToBeat, opening details retries in the background (at most every 6 hours), and pull-to-refresh or the refresh button always checks every source.
- Settings → Backups & sync is reordered: storage folder, Export/Import/Restore Preview, Backup schedule, then Include Ratings & Reviews (the default for the Export page checkboxes).
- The Play on Steam / Buy on Steam button no longer shows an underline and fits narrow screens.

### Fixed

- Android launch no longer fetches the whole encrypted library over the native bridge when the database already has it; that call blocked saving, sharing and exporting for about a minute after every start.
- Saving or sharing a share image now shows its result inside the popup; large images no longer stall Android saves (images are kept under about 235 KB and Capacitor payload logging is off).
- Names exports write through the native side so the file is complete even if Android discards the page while Save As is open.
- Discover → Details → "In library · Open" opened "That entry is no longer in your library"; it now opens the saved game.
- Discover showed "+ Add" again for a game that was already added once its details were enriched; matching now uses the source id and original title.
- Discover search could fall back to blank/suggestions after a re-render or on Android keyboards whose Enter key is not reported as Enter; the search now survives re-renders and fires once.
- Home thumbnails stayed blank after searching or filtering until the filter was cleared and the app refreshed.
- Metadata Sync page could not be scrolled while syncing (it rebuilt the list twice a second) and its header was inset instead of full width.
- Backups: ratings, favorites and source identity are no longer lost when restoring over an existing or re-synced library.
- Names lists (.txt / .csv) and old backups without a status import with the default status, so those games appear under a Home group; games already saved without a status are repaired on launch.

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
- Export List now opens Android's Save as screen and streams the file in small chunks, so large libraries export without crashing; Backup Before Destructive Actions saves quietly into the backup folder.
- Device artwork cache in IndexedDB: covers load from the device first, then online straight away, and the saved folder only fills the cache in the background.
- Currency display now offers 32 currencies, each with its symbol, and an editable exchange rate for the selected currency; prices in Statistics and game details convert between any pair.
- Redesigned App Info page (hero, stat tiles, grouped lists) that follows the Icon style setting.
- Redesigned Home filter sheet with flat sections and wrapping chips.
- Favorites: a heart in the details top bar, a Favorite option in the ⋮ menu, a Favorites filter pill with a count on Home, and a ♥ on favorite cards.
- Statistics → Ratings: rated games are grouped by score (closed by default) and a "Games without a score" list lets you rate games with outline stars, with "Show more" buttons.
- Installed version: App Info shows the version of the installed app instead of a fixed string.

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
- Startup shows the library straight from IndexedDB; the folder and encrypted-store sync runs in the background, and launches no longer re-parse the encrypted copy, rewrite the folder snapshot or re-save every game when nothing changed.
- Folder mirroring, cover caching and the Storage page's cache measurement yield to taps and scrolling, pause while the app is hidden, and stop when you leave the page.
- Storage and Settings pages use a sampled size estimate instead of serialising the whole library; cache sizes are remembered and re-measured only when a cache changes.
- Database folder check no longer lists every game folder when a database file already exists.
- Background metadata sync waits longer for slower sources so imports merge Steam, HowLongToBeat and other enabled sources.
- Edit entry from the three-dot menu opens the game's details page in edit mode.
- Settings → Backups: Folder Sync Delay and Restore Preview now take effect.
- Removed Settings → Tracking's USD-only exchange row in favour of the per-currency rate.
- Importing a list now also writes history (from the backup, or from each game's status) and keeps the backup's own dates, so imported games appear on Timeline and Statistics → Activity.
- Mix fetch has the standard sub-page header and no longer shows the sources panel or the large title block.
- Statistics action buttons (Open full timeline, Find play times) are full-width and easier to tap.
- Launches no longer parse the encrypted copy of the library, rewrite the folder snapshot or re-save every game when nothing changed.

### Fixed

- Home list no longer jumps back to the first batch of cards, or loses your scroll position, when metadata finishes loading, when you pull to refresh, or when the page re-renders. Loaded batches are remembered per group.
- Import progress card is vertically centered on mobile.
- Metadata Sync page layout on small screens, including clipped status labels.
- Home platform filter no longer hides games without platform data or leaves the selected platform unhighlighted; Steam games count as PC.
- Edit entry and View Details from the three-dot menu no longer fail intermittently.
- Add Game no longer opens pre-filled from the last edited game, and its search results collapse once a match is used.
- Discover and Metadata Sync headers sit flush under the status bar.
- Export no longer force-closes the app on large libraries.
- Platform pills in the filter sheet no longer show a pill inside a pill.
- Home grid views (Detailed, Compact, Poster) loaded wide artwork only after slow folder reads; images now show straight away, and Compact is denser.
- Statistics pages did not update when tapping "Show more" or opening a section until something else changed.
- Metadata Sync header sits flush under the status bar.

### Removed

- Settings that did nothing: Backup Password Reminder, Maximum Backup Size, Validate Backup Location, Metadata Retry Limit, Metadata Sync Frequency, Automatic Thumbnail Cleanup, Thumbnail Quality, Storage Warning Limit and Backup Storage Limit.
- Intro lines on the App Info, Logcat and Storage pages.

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
