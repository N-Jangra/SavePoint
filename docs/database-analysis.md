# SavePoint database analysis

## Data model

The app uses a document-style JSON model rather than SQL tables. One state object contains an ordered `items` array, an ordered `history` array, and a `preferences` object. A game entry is the aggregate used by the UI: its identity, tracking state, source metadata, and optional provider fields live together. Activity history is a separate append-at-front log and keeps a snapshot of the item's ID and title so delete events remain readable.

See [Data schema](db-schema.md) for field definitions and examples.

## Read/write path

1. `frontend/app.js` starts from the `splitapp_savepoint_v1` localStorage value.
2. `frontend/backend/app.js` exposes `load()` and `save()`. In a browser it uses that localStorage value. On Android, the storage bridge can restore folder data and native encrypted records when available, with the browser mirror retained as a compatibility/fallback copy.
3. App changes call `persist()`, which passes all three arrays/object to the storage bridge.
4. The bridge writes the browser mirror and, on Android, updates native item/metadata storage and any configured folder database and per-game records.

The localStorage key and native record key prefix are app-specific. The app currently has one category (`game`), but items still carry `category` so the schema and UI can filter consistently.

## Integrity and behavior

- IDs are UUIDs when created in the app. Native records use the ID as their key; saves delete native item keys that were removed from the in-memory collection.
- The UI uses millisecond epoch timestamps for item and activity dates.
- Imported entries get new IDs/timestamps and duplicates are skipped based on category plus lowercased title, not provider ID.
- Preferences are normalized at startup; metadata preferences are restricted to the registered source keys.
- The Android bridge catches plugin read errors and falls back to the mirror available in memory. It does not make browser localStorage encrypted.
- Exported data includes preferences as well as library/history, so an export can contain configured API keys. Store exported backups accordingly.

## Analysis limits

This is a local document/JSON store, not a relational database. It has no account-based cross-device sync service. The export format has a version field, but imports currently consume only `items`; they do not restore history/preferences. The browser mirror is written even on Android, which matters for the security interpretation described in [Storage](storage.md).
