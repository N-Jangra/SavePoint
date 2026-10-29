# SavePoint metadata sources

The metadata registry in `frontend/backend/features/metadata.js` is the source of truth for enabled providers and API-key validation. All providers are scoped to the `game` category.

| Registry key | Provider | API key |
|---|---|---|
| `freetogame` | FreeToGame | Not required |
| `steamdb` | Steam Store search/details, with SteamDB links | Not required |
| `howlongtobeat` | HowLongToBeat (Android app only) | Not required |
| `rawg` | RAWG | Required; setup link: [RAWG API docs](https://rawg.io/apidocs) |

## Custom sources

Users can add their own JSON search APIs in **Settings → Metadata → Metadata Sources → Add custom source**. They are stored in `preferences.customSources` and registered at runtime with `SplitAppMetadata.setCustom()`, which gives each a registry key of `custom:<id>`. They appear in the same list, toggles and ordering as built-in sources.

```json
{
  "id": "a1b2c3d4", "name": "My games",
  "searchUrl": "https://api.example.com/games?search={query}&key={apikey}",
  "apiKey": "", "apiKeyHeader": "",
  "resultsPath": "data.results",
  "map": { "title": "name", "id": "id", "image": "cover.url", "year": "released", "description": "summary", "rating": "rating", "url": "url", "subtitle": "genre" },
  "imageTemplate": "https://img.example.com/{id}.jpg",
  "suggestionsUrl": "", "detailUrl": "https://api.example.com/games/{id}", "detailRoot": "data",
  "detailMap": { "genres": "genres", "developers": "developers", "hours": "playtime", "screenshots": "screenshots" }
}
```

Paths use dots and `[index]`. Only `http(s)` URLs are used; nothing from a custom source is executed. In a PC browser the API must send CORS headers; the Android app is not limited by CORS.

Sources are enabled by default unless the user turns them off. Settings can also set source order. Discovery and source-backed Details use the same enabled-source preferences. See [Metadata analysis](metadata-analysis.md) for request methods, returned fields, caching, and errors.


## Per-source options

Settings → Metadata Sources → a source's ⚙ page stores `preferences.sourceOptions[key] = { domain, userAgent, cookies }`. `SplitAppMetadata.resolve` swaps the host when `domain` is set and the request layer adds `User-Agent` / `Cookie` headers for every request to that source's default host; these override built-in headers (including HowLongToBeat's session cookie). The Android app sends them natively; `dev-server.js` forwards `x-source-user-agent` / `x-source-cookie`; a plain browser drops them.
