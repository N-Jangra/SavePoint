# SavePoint

SavePoint is a local-first game library and playtime tracker. It runs as a browser single-page app and as a Capacitor Android app. The current library category is `game`.

## What it does

- Track game status, playtime, goals, ratings, artwork, and provider metadata.
- Search and organize a personal library, review activity in Timeline, and explore collection and playtime statistics.
- Discover games through FreeToGame, Steam + SteamDB, HowLongToBeat, RAWG, IGDB, and user-configured JSON sources.
- Use Mix fetch (experimental) to search enabled sources together and merge metadata when previewing or saving a game.
- Save provider details and artwork for faster repeat opens and offline use, with Android folder backup and JSON export/import options.

See [the documentation index](docs/README.md) and [release notes](CHANGELOG.md).

## Run the browser preview

Requires Node.js 18 or newer and npm. From this directory:

```sh
npm install
npm run serve
```

Open the loopback URL printed by the server. Browser library data uses `localStorage`. The preview server also provides a restricted HTTPS proxy for supported metadata providers; opening `frontend/index.html` directly with `file://` can prevent cross-origin requests from working.

## Build Android

Install dependencies, synchronize the Capacitor project, then build:

```sh
npm install
npm run cap:sync
cd android
./gradlew assembleDebug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. See [requirements](docs/requirements.md) for toolchain details and release builds.

## Project map

- `frontend/index.html` — SPA shell and ordered styles/scripts.
- `frontend/app.js` — routing, app state, interactions, and UI persistence.
- `frontend/pages/` and `frontend/components/` — screen renderers and shared components.
- `frontend/backend/` — storage bridge and metadata registry/search/detail/mix features.
- `frontend/styles/` — base, responsive, theme, and page styles.
- `dev-server.js` — local static preview server and allowlisted metadata proxy.
- `android/` — Capacitor Android project and native storage/backup plugins.
- `docs/` — product and technical documentation.

## App identity

- npm package: `savepoint`
- Capacitor / Android application ID: `com.cuemark.savepoint`
- Browser storage key: `splitapp_savepoint_v1`
- Capacitor web directory: `frontend/`

The app is implemented with HTML, CSS, and vanilla JavaScript; it does not use React or JSX.
