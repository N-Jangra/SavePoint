# SavePoint

SavePoint is a local-first game library and playtime tracker. It runs as a browser single-page app and as a Capacitor Android app. The only library category is `game`.

## Features

- Track a game's status, playtime, rating, goal, artwork, and description.
- Search the local library and discover games through five metadata providers.
- Open source-backed detail pages for supported discovery results.
- Review Dropped, Completed, On Hold, and Playing status changes in the timeline, and view collection statistics.
- Export the library to JSON and import entries from a JSON backup.
- Use Android encrypted item and metadata storage alongside a browser-compatible localStorage mirror.

See [docs/README.md](docs/README.md) for the full documentation index, including the [database analysis](docs/database-analysis.md), [metadata analysis](docs/metadata-analysis.md), [schema](docs/db-schema.md), [walkthrough](docs/app-walkthrough.md), [requirements](docs/requirements.md), and [storage details](docs/storage.md).

## Run locally

From this directory, install dependencies and start the preview server:

```sh
npm install
npm run serve
```

Open the loopback URL printed by the server. The browser preview uses `localStorage`; Android packages the `frontend/` directory configured as Capacitor's `webDir`. Run `npm run cap:sync` after source changes before building or opening the Android app.

## Project layout

- `frontend/index.html` — SPA shell and ordered script/style entry point.
- `frontend/app.js` — routing, app state, persistence calls, interactions, and import/export.
- `frontend/pages/` and `frontend/components/` — screen renderers and shared UI.
- `frontend/backend/` — app storage bridge and metadata discovery/detail modules.
- `dev-server.js` — local static server and allowlisted HTTPS metadata proxy.
- `android/` — Capacitor Android project and native plugins.
- `docs/` — app-specific technical documentation.

## Identity

- npm package: `savepoint`
- Capacitor app ID: `com.cuemark.savepoint`
- Android application ID: `com.cuemark.savepoint`
- Browser storage key: `splitapp_savepoint_v1`
