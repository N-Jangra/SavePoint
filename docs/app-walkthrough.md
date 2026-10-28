# SavePoint app walkthrough

SavePoint is a responsive, local-first game tracker. It is a single-page app that runs in a browser and, packaged with Capacitor, as an Android app. Every route is a hash URL, so each screen can be opened or refreshed directly.

## Screen sizes

| Width | Navigation | Layout |
|---|---|---|
| Phone (under 768px) | Bottom bar | One column; sheets slide up from the bottom. |
| Tablet (768–1079px) | Icon-only sidebar rail on the left | Wider content, 2-column game lists. |
| Desktop (1080px and up) | Sidebar with icons and labels | 2–3 column lists, wider Discover/Statistics grids; sheets open as centred windows. |

The sidebar can be turned off in **Settings → Appearance → Show sidebar**; the bottom bar is then used at every size. **Show scrollbars** (also in Appearance, off by default) controls scrollbars everywhere.

## Opening animation and motion

A launch screen (controller icon, name, "Loading your collection", pulsing dots) shows until the first page is drawn, for at least 1.2 s scaled by **Animation speed**. Pages slide in from the right when navigating forward and from the left when going back; sheets rise from the bottom (or pop in on wide screens); buttons have a press effect. Animations use only position and opacity. They are skipped by **Reduce motion** or Animation speed *Off*. On devices that report 2 GB of memory or less, 2 or fewer CPU cores, or data-saver mode, the app switches to a low-memory mode: no blur, no card shadows, solid headers, shorter animations.

## Navigation and back behaviour

- Every route is a URL: `#dashboard`, `#discover?source=<key>`, `#details?id=<item id>`, `#settings/<group>`, `#settings/custom-source?id=<id>`, `#statistics`, `#timeline`, `#add`.
- Opening a sheet or dialog adds a history entry. The browser back button or the Android back button closes the open sheet first without leaving the page; tapping the dimmed area outside a sheet also closes it.
- Android back then steps back through pages, and only exits the app from Home.
- Refreshing a game's details page (`#details?id=…`) reopens that game. Details opened from Discover (not saved yet) cannot be restored after a refresh.

## Main pages

- **Home:** games grouped by status. Under the search box a row of status chips (All, Playing, Backlog, Completed, On Hold, Dropped) shows counts and filters the list. The filter button opens a sheet with sort, status, layout, group-by, theme, density and display switches. Each card has a three-dot button that opens an action sheet: Mark as Playing, Mark as Completed, View Full Details, Remove. The floating plus button opens Add Game.
- **Discover:** when nothing is searched it shows suggestion rows from the enabled sources: Steam (top sellers, new, on sale, coming soon), FreeToGame (popular), RAWG (trending, critically acclaimed, upcoming — needs a key) and any custom source that has a suggestions URL. Searching replaces the rows with results; each card opens details or adds the game. Opened from Explore, search is limited to one source.
- **Add Game:** create or edit a game: metadata auto-fill search, gallery or camera cover, title, description, status, playtime and goal steppers, star rating.
- **Details:** hero with cover and blurred backdrop, status and age-rating badges, a Buy strip, playtime card with −1h/+1h/+5h buttons, status pills and star rating (changes apply immediately), then provider data: tags, player-rating bar, where to buy, overview, facts table, links, screenshots, related games (carousels), achievements and team (collapsible). Sections shown depend on the provider.
- **Explore:** Timeline, Statistics and the enabled metadata sources.
- **Timeline:** status changes to Dropped, Completed, On Hold and Playing, grouped by month, each with the game's cover and a small status icon; filter by week, month, month/year or title.
- **Statistics:** completion rate, status cards (tap to open Home filtered), **Time to beat** (hours logged, whole-library hours, hours left to play, library price, top five longest games, weeks left at one hour a day), status breakdown, 7-day activity and top ratings.
- **Settings:** see below.

## Settings

The Settings index lists **Personalize** (Appearance, Dashboard, Tracking), **Your library** (Backups & sync, Metadata, Metadata & Storage and a standalone **Storage** page with live entry count and size) and **More** (**App Info** and **Logcat**, each its own page).

- **Appearance:** theme, text size, motion, fonts, main colour, category colours, bottom-bar style/labels/background/layout/icons/corners, Show sidebar, Show scrollbars. *Bottom bar icons* lists each destination with a sideways carousel of icons.
- **Storage:** estimated library size, cache usage, cache clearing, and a red "Delete saved data" card (clear tracked data, factory reset). Back returns to the page you came from (Settings or Backups & sync).
- **App Info:** app icon, version, platform, library size, enabled sources and short feature notes.
- **Logcat:** error/warning summary with a Clear button and a list of diagnostics.

### Metadata Sources and custom sources

**Settings → Metadata → Metadata Sources** lists built-in and custom sources. Enable, disable and reorder them there; RAWG needs an API key.

**Custom sources:** tap *Add custom source* to open a guided page with three steps — *Connect* (name, search URL with `{query}` and `{apikey}`, optional key and header), *Read the results* (path to the list and the fields for title, id, cover, year, description, rating, link, subtitle) and *More details* (optional suggestions URL, details URL and details field mapping). **Run test** shows the first matches before you save. Saved sources join search, Discover suggestions and details like the built-in ones, and open again from the list for editing or deleting. See [metadata](metadata.md).

## Providers in the app

Wikidata, FreeToGame, Steam + SteamDB, HowLongToBeat, RAWG and custom sources. HowLongToBeat only works in the Android app: it blocks browsers, and the app reuses the session created when you review its consent screen in an in-app window (see [metadata analysis](metadata-analysis.md)).

## Backups

**Settings → Backups & sync → Export List** downloads JSON containing items, history and preferences. Import accepts an array of items or an object with an `items` array, skips duplicates by title, and does not restore preferences or history. The shape is described in [Data schema](db-schema.md).
