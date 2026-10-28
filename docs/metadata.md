# SavePoint metadata sources

The metadata registry in `frontend/backend/features/metadata.js` is the source of truth for enabled providers and API-key validation. All providers are scoped to the `game` category.

| Registry key | Provider | API key |
|---|---|---|
| `wikidata` | Wikidata | Not required |
| `freetogame` | FreeToGame | Not required |
| `steamdb` | Steam Store search/details, with SteamDB links | Not required |
| `howlongtobeat` | HowLongToBeat | Not required |
| `rawg` | RAWG | Required; setup link: [RAWG API docs](https://rawg.io/apidocs) |

Sources are enabled by default unless the user turns them off. Settings can also set source order. Discovery and source-backed Details use the same enabled-source preferences. See [Metadata analysis](metadata-analysis.md) for request methods, returned fields, caching, and errors.

