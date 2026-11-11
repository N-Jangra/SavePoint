# SavePoint app walkthrough

SavePoint is a responsive, local-first game tracker. It is a single-page app whose screens are hash routes, so a route can be opened or refreshed directly. The browser preview and Capacitor Android app share the `frontend/` UI.

## Responsive navigation

| Viewport | Navigation |
|---|---|
| Phone | Configurable bottom bar |
| Tablet | Sidebar rail or bottom bar, according to display settings |
| Desktop | Labeled sidebar, or bottom bar when the sidebar is disabled |

The bottom bar can be configured for visible destinations, ordering, alignment, labels, colors, background, and corner style. Home and Settings remain fixed destinations. Main-page headers remain pinned while content scrolls, and bottom navigation stays fixed at the screen edge; Android WebView edge stretch is disabled to keep the bars steady during overscroll. Android system back and browser history follow the in-app route stack; open sheets/dialogs close before navigating away.

## Main screens

- **Home (`#dashboard`):** search and filter the library, change sorting/grouping/layout, and open each game's action menu for details or library actions. Games can be grouped by status, category, release, or not grouped.
- **Discover (`#discover`):** search one provider or all enabled sources, browse source suggestions, open a game's details preview, or add it to the library. Saved entries show their library state.
- **Mix fetch (`#mix`):** experimental combined search across enabled sources. Results retain provider references; adding a result merges available provider metadata into one library record.
- **Details (`#details?id=…`):** review and edit tracking status, rating, playtime and goal, plus cached/provider details such as artwork, screenshots, tags, links, requirements, and achievements when supplied.
- **Add Game (`#add`):** create or edit a game manually, or search enabled metadata providers to autofill its fields.
- **Sharing:** the Share button on each Home group opens an Images | PDF popup (themed image pages with per-page and page-count controls, or one PDF list of every game). The Share button in a game's details top bar builds a PDF or image of that game from its saved metadata. Saving writes to Downloads; sharing uses the Android share sheet.
- **Timeline (`#timeline`):** browse status-change activity, with date and game filters.
- **Statistics (`#statistics`):** collection overview with dedicated playtime, library, activity, and ratings views.
- **Explore (`#explore`):** entry point for metadata providers, Mix fetch, Timeline, and Statistics.
- **Settings (`#settings`):** configure appearance, navigation, dashboard/tracking behavior, backups, metadata sources, and diagnostics.

## Metadata and local data

Built-in sources are FreeToGame, Steam + SteamDB, HowLongToBeat, RAWG, and IGDB. RAWG requires an API key; IGDB requires Twitch Client ID and access token. Custom JSON sources can be configured in Metadata Sources. Browser HowLongToBeat searches use the local preview proxy; Android can use its provider consent/session integration. See [metadata sources](metadata.md) and [metadata analysis](metadata-analysis.md).

The app stores library items, activity history, and preferences locally. Android can mirror data and artwork to a user-selected folder and can use native encrypted item storage. The localStorage mirror and folder JSON exports are not encrypted. See [storage](storage.md).

## Backups and imports

Settings provides export and restore flows. JSON exports can include library items, history, and preferences (ratings and reviews can be left out with a toggle); names-only TXT and CSV exports list just titles so they can be re-imported and synced from sources later. Import accepts `.json`, `.txt` and `.csv`, restores history for added games and fills blank fields of games already in the library. Folder backups may include a database tree and artwork. Treat exports and folder backups as sensitive because they may contain API credentials and are plaintext. The exact persisted fields are documented in [the data schema](db-schema.md).


## Library tools (0.1.3)

- **Select games:** tap the select button on Home (or hold a card and release in place), tick games, then use Status, the heart, Delete, All or Done in the bar at the bottom.
- **Merge:** hold a card, drag it onto another and confirm to merge both into one Mix game; progress shows on the Sync page.
- **Undo:** removing, bulk actions, merges and imports show an Undo toast for a few seconds; an automatic backup runs before bulk changes.
- **Fix match / Change cover:** on a game's details page, link or unlink a source or search a source for the right entry, and pick a different cover.
- **Sync page:** shows progress, failed games (Retry / Ignore on their own row; failed lookups get one automatic second pass first) and **Check these matches**: games whose matched title differs from yours, each with Fix match or Looks right. Pull-to-refresh on Home syncs what Settings → Metadata Sync says (default: games that need it); pull again within 20 seconds to re-check everything.
- **Import List:** near-duplicates are listed under "Looks like duplicates" so you can skip or keep them.
- **Time to beat:** the details page shows HowLongToBeat main / extras / completionist hours; tap one to set your goal (an automatic goal updates until you choose your own).
- **Library history:** Settings → Library history lists adds, removals, merges, imports and bulk edits, and flags games that went missing without a recorded removal.
- **Covers in Screenshots:** covers from all matched sources are saved in the Screenshots gallery as well as offered in Change cover.
- **History and logs:** Logcat and Library history search through everything saved in `savepoint-db/`; clear them from their pages or Settings → Storage.

## Metadata Sync settings

Settings → **Metadata Sync** controls syncing: Run buttons (needs it / no data / failed / every game), what pull-to-refresh syncs, refresh interval, sources per game, which sources to look up, parallel games, pause between games, lookup timeout, retries, wait before retry, the automatic second pass and pausing in the background. Sources already linked to a game are always refreshed by ID.

## Library history and Logcat

Both pages have a search box with a filter button beside it; the button opens a Date range popup (From / To, quick ranges, Clear, Apply). The saved file is merged with this device's recent entries and re-read each time the page opens.

The Sync page's Back button returns to the page it was opened from: Home or a game when opened from the floating sync button, Settings → Metadata Sync when opened from there.

## Navigation (ScreenMark layout)

- **Games** (`#games`): Ongoing (Playing) and Backlog (backlog + upcoming) tabs, List / Posters / Cards view, "+" to add playtime (Ongoing) or move a backlog game to Ongoing, Browse all games.
- **Explore** (`#discover`, alias `#explore`): search and per-source browsing with catalog shelves.
- **Profile** (`#profile`): cover, photo (`#profile-cover` to edit), three-dot menu (Timeline, Sources, Settings, About), Add manually, Stats rail, and collection links in this order: **All games**, **Completed games**, **Favorites**, **On Hold**, **Dropped**. All games includes every status. The status links open lists limited to that status; Favorites (`#favorites`) stays separate. Empty Completed, On Hold and Dropped collections show an Add games card; populated collections show their games without that empty-state card.
- **All games and status collections** (`#library`): search and choose Posters, Large, or List view. Filters cover sorting, status (All games only), platform, and saved game tags/category values. There is no favorites-only filter because Favorites has its own collection page. On Hold, Dropped, and Completed links preserve their status when opened or restored from navigation.
- **Game details Back:** when one saved game's detail page opens another saved game's details, Back returns to the previous game first. Back from the first detail page returns to the collection that opened it.
- **Statistics** (`#statistics`): one overview board (time spent playing, total hours, games completed, top genres, studios / platforms, biggest play sessions, games by status, average rating).
- **Details** (`#details?id=…`): ScreenMark's title layout; progress console on the left of tablets and above the tabs on phones.
