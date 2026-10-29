# SavePoint data schema

SavePoint stores JSON, not a relational database. The browser representation is one object under `splitapp_savepoint_v1`:

```json
{
  "items": [],
  "history": [],
  "preferences": {}
}
```

## Library item

The add/edit flow writes these core fields. Additional source fields are retained when a discovery result is added.

| Field | Meaning |
|---|---|
| `id` | UUID used as the local item identifier. |
| `title` | Required game title. |
| `category` | `game` for every current entry. |
| `status` | One of the configured game statuses: Backlog, Playing, On Hold, Dropped, or Completed. |
| `progress` | Nonnegative playtime value, in hours. |
| `rating` | Numeric rating; the UI uses 1–5 or 1–10 according to the rating preference. Zero means no rating. |
| `goal` | Nonnegative playtime goal, in hours; zero means no goal. |
| `image`, `description` | Artwork reference and game summary. A gallery/camera cover is held as transient `localThumbnailData` in the app state and written as an image file in the selected Android folder; portable JSON omits the base64 data. |
| `createdAt`, `updatedAt` | Unix epoch timestamps in milliseconds. |
| `metadataSource`, `providerId` | Optional registry key and provider ID used for source-backed details. |
| `thumbnailPath`, `thumbnailMime`, `localImageFiles` | Android folder mirror references for the cover and cached image files. Image bytes are kept in adjacent files, not repeated in the portable item JSON. |
| `cachedDetails` | Last provider details (see [metadata analysis](metadata-analysis.md)), including all gallery, series, achievement and team images; their images are turned into thumbnails and stored beside the item. |
| `facts` | Provider-independent summary (play time, price, developers, requirements, names, team) used by Statistics. |
| `localImageData`, `localThumbnailData` | Transient in-memory image data; not written to portable JSON. |
| `url`, `year`, `subtitle`, `fields`, … | Optional provider result/detail fields. Provider results can include additional properties and the app currently preserves them in the item JSON. |

## Activity history

Each activity record has `{ "itemId", "title", "action", "status", "at" }`. The timeline joins `itemId` (or the title) to a saved game to show its cover. `at` is a Unix epoch timestamp in milliseconds. The app prepends records for add, update, progress changes, discovery add, and delete. Deletion history retains the item ID/title even after the corresponding item is gone.

## Preferences

Preferences are a flat object for settings, with nested objects where needed. Important groups include appearance/navigation (`theme`, `font`, `categoryColors`, `navBar`), library display and tracking, backup/storage limits, and metadata (`metadataSources`, `metadataSourceOrder`, `apiKeys`, `customSources`) and display (`showSidebar`, `showScrollbars`, `animationSpeed`, `reduceMotion`). The metadata registry removes source toggles for unknown providers and API keys for providers that do not require a key. Current registered keys are `freetogame`, `steamdb`, `howlongtobeat`, and `rawg`.

## Export and import

Export format:

```json
{
  "app": "SavePoint",
  "version": 1,
  "exportedAt": "ISO-8601 timestamp",
  "items": [],
  "history": [],
  "preferences": {}
}
```

Import accepts either an item array or an object whose `items` property is an array. It validates the title, assigns new IDs and timestamps, normalizes category to the supported `game` category, and skips entries already present with the same category and case-insensitive title. Import currently does not restore the exported history or preferences.

See [database analysis](database-analysis.md) for how this shape is read and written and [storage](storage.md) for browser/native persistence details.
