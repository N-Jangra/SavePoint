# SavePoint app walkthrough

SavePoint is a responsive single-page game tracker. The bottom bar is available across screen sizes; on wider layouts a sidebar can also be shown or hidden from Appearance settings.

## Main pages

- **Home:** browse games grouped by status. Dashboard settings provide sort order, layouts, display density, theme, and optional ratings/progress. Large groups load in batches as you scroll. The top filter narrows the dashboard by status, and the floating plus button opens Add Game.
- **Search:** filter saved library entries by title.
- **Discover:** search enabled online metadata sources. Each result can be opened for source-backed details or added to the library. Searches opened from Explore are scoped to the selected provider.
- **Add Game:** create or edit a game entry with a gallery or camera cover, metadata search across enabled providers, description, status, playtime, rating, and goal. A picked cover is stored as a local image and mirrored to the selected Android folder with the game JSON.
- **Details:** show the saved entry and, when it has a supported source/provider ID and that source is enabled, request provider-specific information. Tapping artwork or screenshots opens the in-app image viewer. For saved entries, edit title, status, progress, and goal inline; rate and delete from the same page. A discovery preview has an Add to library action rather than tracking controls.
- **Explore:** show Timeline, Stats, and enabled metadata sources. Selecting a source opens `#discover?source=<provider-key>`, where search requests go only to that provider.
- **Timeline:** show status changes to Dropped, Completed, On Hold, and Playing. Other saved activity records are not shown as timeline events.
- **Stats:** view library and completion summaries.
- **Settings:** configure appearance, dashboard and navigation, tracking, backups and sync, metadata, storage, and app information/logs. Settings group and individual option icons use the bundled Lucide icon set.

## Metadata settings

Open **Settings → Metadata → Metadata Sources** to enable sources and set their order. RAWG requires an API key, which is entered in this screen and linked to its setup page. The **Metadata Mode** setting can disable online lookup; **Offline Fallback** controls whether stale cached JSON can be used after a failed request. See [metadata analysis](metadata-analysis.md) for provider fields and request behavior.

## Backups

**Settings → Backups & sync → Export List** downloads a JSON file containing items, history, and preferences. Import accepts a JSON array of items or an object with an `items` array; it imports entries and skips duplicates by category and case-insensitive title. It does not restore preferences or history from the file. The shape is described in [Data schema](db-schema.md).
