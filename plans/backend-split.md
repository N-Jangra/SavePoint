# Backend and metadata module scope

SavePoint keeps its app-specific storage and metadata code under `frontend/backend/`. Capacitor packages the configured `frontend/` web directory, so this is the one maintained copy of these browser-side modules. Native Android code remains under `android/app/src/main/java/com/cuemark/savepoint/`.

## Module responsibilities

- `app.js` exposes the app's storage key and loads/saves items, activity history, and preferences.
- `features/metadata.js` is the provider registry and filters source/API-key preferences to registered providers.
- `features/sources.js` adapts the registry for Settings.
- `features/discover.js` performs provider searches and normalizes discovery results.
- `features/show-detail-controller.js` loads provider-specific details for a saved result.
- `features/show-detail.js` exposes the detail controller to the rest of the frontend.

The registry is the source of truth for built-in and runtime custom metadata providers. The local preview server's HTTPS proxy separately validates allowed hostnames and restricts POST requests to HowLongToBeat search and IGDB game queries. It supports browser preview only and is not a production backend. For provider behavior, see [metadata analysis](../docs/metadata-analysis.md); for state persistence, see [storage](../docs/storage.md).

