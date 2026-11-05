# SavePoint metadata sources

The registry in `frontend/backend/features/metadata.js` defines built-in game sources. Provider availability, enabled state, and ordering are managed from **Settings → Metadata Sources**.

| Registry key | Source | Credentials |
|---|---|---|
| `freetogame` | FreeToGame | None |
| `steamdb` | Steam Store search/details with SteamDB links | None |
| `howlongtobeat` | HowLongToBeat search and completion-time details | None; browser preview uses the local proxy, Android can use its consent/session plugin |
| `rawg` | RAWG games catalog | API key from [RAWG](https://rawg.io/apidocs) |
| `igdb` | IGDB games catalog | Twitch Client ID and access token; see [Twitch authentication](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/) |

RAWG and IGDB are disabled on a fresh install until configured. IGDB credentials are both required; access tokens can expire and may need replacement. Never publish API credentials in source control.

## Custom JSON sources

Users can configure a JSON search endpoint from **Settings → Metadata Sources → Add JSON**. The guided editor maps search results and optional detail fields, supports an optional API key/header and suggestions endpoint, and can run a sample search before saving. Custom source definitions are stored in `preferences.customSources` and registered at runtime as `custom:<id>`.

Example mapping:

```json
{
  "id": "catalog-id",
  "name": "My games",
  "searchUrl": "https://api.example.com/games?search={query}&key={apikey}",
  "apiKey": "",
  "apiKeyHeader": "",
  "resultsPath": "data.results",
  "map": {
    "title": "name",
    "id": "id",
    "image": "cover.url",
    "year": "released",
    "description": "summary",
    "rating": "rating",
    "url": "url",
    "subtitle": "genre"
  }
}
```

Field paths support dot notation and array indexes. Custom endpoints are fetched as data; custom code is not executed. In a regular browser, the endpoint must allow CORS. Android requests are not constrained by browser CORS rules.

## Source options and Mix fetch

Per-source settings can override the source domain and configure request headers/cookies where the platform allows them. Browser security prevents JavaScript from setting some restricted headers; the local preview proxy and Android request paths handle supported source-specific headers.

Mix fetch is an experimental combined search. It retains each result's source identity and merges provider detail fields when a matching game is previewed or added. See [metadata analysis](metadata-analysis.md) for request, cache, and failure behavior.


## Source index and fixing matches (0.1.3)

Each saved game keeps `sourceIds` (source key to provider ID) alongside `mixPrimary` (the source it was first saved from) and optional `mixPins` and `mixSkip`. Syncs fetch known sources by ID instead of searching by title. A source that matched before must answer again, otherwise the saved data is kept, so a Mix game never falls back to a single source. A source that is switched off keeps its data. A timeout or block is not recorded as checked and is retried on the next refresh (`mixCheckedSources` lists only sources that gave a definite answer).

On a game's details, **Fix match** shows each source's linked ID, lets you unlink a source (`mixSkip`) or search a source and link the right entry, and **Change cover** stores `customCover`, which syncs never replace. Dragging one Home card onto another merges them into a Mix game using both cards' provider IDs.
