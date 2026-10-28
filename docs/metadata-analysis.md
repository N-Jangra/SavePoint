# SavePoint metadata analysis

## Request flow

The registry at `frontend/backend/features/metadata.js` lists the five supported game providers and marks RAWG as key-required. Discovery runs each enabled provider search concurrently, collects successful results, de-duplicates by source plus provider ID, and returns at most 36 results. Individual provider failures become warnings if another provider returns results; if every source fails and none returns results, the search fails with the collected errors. The Discover screen renders at most 12 results from that response.

Results carry a `source` and `providerId`; when added to the library they are saved as `metadataSource` and `providerId`. Details routes only to the corresponding registered provider, and only when that provider remains enabled. Manually created items have no provider ID and use their local fields without a remote detail request.

## Provider behavior

| Source | Discovery request and mapped fields | Detail behavior |
|---|---|---|
| Wikidata | Entity search (`wbsearchentities`, up to 15). Maps ID, label, description, and entity URL; search results do not include artwork. | Loads entity labels, description, claims, and sitelinks. Reads image (P18), publication date (P577), genre (P136), platform (P400), and official website (P856) where present. Images are linked through Wikimedia Commons. |
| FreeToGame | Fetches the game catalog and filters title, genre, and developer locally; returns up to 15. Maps thumbnail, short description, release date, genre/developer, and game URL. | Loads game detail including publisher/developer, platform, genre, release date, system requirements, thumbnail, and screenshot gallery. |
| Steam + SteamDB (`steamdb`) | Searches Steam Store (`storesearch`), up to 20. Stores the app ID as `app:<id>`, and maps name, small image, type/price, and SteamDB URL. | Requests Steam app details. Maps description, capsule/header art, screenshots, developer/publisher, genres, release date, platform availability, price, Steam Store link, and SteamDB link. |
| HowLongToBeat | Requests an init token, then posts a game search; maps game ID, title, release year, cover, summary, completion times, and score. | Attempts to read the game page's embedded data first, then falls back to token-based search. Displays main story, main plus extras, completionist time, platforms, game type, and community score. |
| RAWG | Searches the games endpoint (up to 15) with the API key; maps ID, name, release year, background image, rating, RAWG URL, and summary rating text. | Loads game details and attempts a separate screenshot request. Maps description, release date, Metacritic, genres, platforms, developers, publishers, average playtime, website, and artwork. |

Exact returned fields vary by provider and by what that provider has published. Missing values are omitted or shown as empty; the app keeps provider result fields in the saved JSON item.

## Cache and offline behavior

`frontend/backend/features/discover.js` caches successful JSON GET responses in Cache Storage under `splitapp_savepoint_metadata`, with a fixed six-hour freshness window. If the network request fails, a stale cached JSON response is used unless `offlineFallback` is set to `none`. Requests with `key` or `apikey` query parameters are not cached. This excludes RAWG requests because its API key is sent in the query string. HowLongToBeat's POST search and HTML text requests also bypass this JSON GET cache.

The metadata settings include refresh interval, retry limit, sync frequency, and worker count. In the current request implementation, cache freshness is fixed at six hours; source queries run concurrently with `Promise.allSettled`, and these preferences do not alter that freshness window or add a retry loop/background sync. The active behavior controls are metadata mode, enabled-source/order preferences, API keys, and stale-cache fallback.

## Local preview proxy

When served from `localhost` or `127.0.0.1`, browser requests go through `/proxy`. `dev-server.js` accepts HTTPS URLs for a fixed host allowlist: Wikidata, Steam Store, HowLongToBeat, FreeToGame, and RAWG. POST is accepted only for HowLongToBeat's `/api/search/site` endpoint. In the Android app and other non-local origins, the frontend requests providers directly through `fetch` (Capacitor HTTP is enabled in app configuration).

The development proxy is only part of the local preview server; it is not a production metadata backend. For storage of provider settings and cached responses, see [Storage](storage.md).

