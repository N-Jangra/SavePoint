# SavePoint app walkthrough

SavePoint is a responsive, local-first game tracker. It is a single-page app whose screens are hash routes, so a route can be opened or refreshed directly. The browser preview and Capacitor Android app share the `frontend/` UI.

## Responsive navigation

| Viewport | Navigation |
|---|---|
| Phone | Configurable bottom bar |
| Tablet | Sidebar rail or bottom bar, according to display settings |
| Desktop | Labeled sidebar, or bottom bar when the sidebar is disabled |

The bottom bar can be configured for visible destinations, ordering, alignment, labels, colors, background, and corner style. Home and Settings remain fixed destinations. Android system back and browser history follow the in-app route stack; open sheets/dialogs close before navigating away.

## Main screens

- **Home (`#dashboard`):** search and filter the library, change sorting/grouping/layout, and open each game's action menu for details or library actions. Games can be grouped by status, category, release, or not grouped.
- **Discover (`#discover`):** search one provider or all enabled sources, browse source suggestions, open a game's details preview, or add it to the library. Saved entries show their library state.
- **Mix fetch (`#mix`):** experimental combined search across enabled sources. Results retain provider references; adding a result merges available provider metadata into one library record.
- **Details (`#details?id=…`):** review and edit tracking status, rating, playtime and goal, plus cached/provider details such as artwork, screenshots, tags, links, requirements, and achievements when supplied.
- **Add Game (`#add`):** create or edit a game manually, or search enabled metadata providers to autofill its fields.
- **Timeline (`#timeline`):** browse status-change activity, with date and game filters.
- **Statistics (`#statistics`):** collection overview with dedicated playtime, library, activity, and ratings views.
- **Explore (`#explore`):** entry point for metadata providers, Mix fetch, Timeline, and Statistics.
- **Settings (`#settings`):** configure appearance, navigation, dashboard/tracking behavior, backups, metadata sources, and diagnostics.

## Metadata and local data

Built-in sources are FreeToGame, Steam + SteamDB, HowLongToBeat, RAWG, and IGDB. RAWG requires an API key; IGDB requires Twitch Client ID and access token. Custom JSON sources can be configured in Metadata Sources. Browser HowLongToBeat searches use the local preview proxy; Android can use its provider consent/session integration. See [metadata sources](metadata.md) and [metadata analysis](metadata-analysis.md).

The app stores library items, activity history, and preferences locally. Android can mirror data and artwork to a user-selected folder and can use native encrypted item storage. The localStorage mirror and folder JSON exports are not encrypted. See [storage](storage.md).

## Backups and imports

Settings provides export and restore flows. JSON exports can include library items, history, and preferences (ratings and reviews can be left out with a toggle); names-only TXT and CSV exports list just titles so they can be re-imported and synced from sources later. Import accepts `.json`, `.txt` and `.csv`, restores history for added games and fills blank fields of games already in the library. Folder backups may include a database tree and artwork. Treat exports and folder backups as sensitive because they may contain API credentials and are plaintext. The exact persisted fields are documented in [the data schema](db-schema.md).
