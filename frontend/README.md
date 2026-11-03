# SavePoint frontend structure

`index.html` is the app shell. SavePoint is a single-page app: `app.js` owns routing and application state, and each page module renders into `#page-content`.

## Main files

- `app-config.js` — app identity, game category, statuses, units, and labels.
- `app.js` — routing, library state, event handling, settings, and JSON import/export.
- `components/library.js` — reusable library cards and category controls.
- `pages/` — Dashboard, Search, Discover, Details, Add, Timeline, Statistics, and Settings renderers.
- `backend/app.js` — app-specific state load/save bridge, including optional Capacitor encrypted storage.
- `backend/features/metadata.js` — five-provider registry and preference normalization.
- `backend/features/sources.js` — frontend helpers for source settings.
- `backend/features/discover.js` — provider search, JSON request cache, and result normalization.
- `backend/features/show-detail-controller.js` — provider detail loaders, including IGDB and browser-capable HowLongToBeat request flow.
- `backend/features/mix.js` — cross-source result matching and detail merging for Mix fetch.
- `backend/features/show-detail.js` — page-facing detail service wrapper.
- `styles.css`, `styles/cuemark-legacy.css`, `styles/details.css` — shared, theme, and details presentation.

Scripts are loaded in `index.html`; keep provider and page modules before `app.js`, which initializes the app after those globals are available. The `frontend/backend/` folder is the maintained source and the Capacitor `webDir`; there is no separate generated backend copy. The project uses vanilla JavaScript rather than a JSX framework or compilation step.

## Run and package

From the app root, use `npm run serve` for a browser preview. Browser state is stored in localStorage. The preview server hosts the UI and a restricted provider proxy; avoid direct `file://` navigation for metadata search. For Android, run `npm run cap:sync` after source changes, then build the Android project. See [Android requirements](../docs/requirements.md) and [storage behavior](../docs/storage.md).

