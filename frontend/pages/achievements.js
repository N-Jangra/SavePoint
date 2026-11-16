// Achievements are computed from the local library and work offline.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  const BADGES = [
    ["first-game", "First save", "Start your collection with a game you love.", m => m.games, "games", [[1, "New save", 50], [10, "Regular", 100], [50, "Legend", 250]]],
    ["collector-10", "Shelf builder", "Make room for more great games.", m => m.games, "games", [[10, "Curator", 100], [25, "Archivist", 175], [100, "Vault keeper", 300]]],
    ["first-completion", "Credits rolled", "See your first adventure through.", m => m.completed, "games", [[1, "Rookie closer", 75], [10, "Finisher", 175], [50, "Legendary run", 300]]],
    ["favorite-five", "Player's choice", "Collect the games you keep coming back to.", m => m.favorites, "favorites", [[1, "First pick", 50], [5, "Curator", 125], [25, "Hall of fame", 250]]],
    ["playtime-100", "Time well played", "Your hours tell a story.", m => Math.floor(m.hours), "hours", [[10, "Warm-up", 50], [100, "Dedicated", 150], [500, "All-timer", 300]]],
    ["backlog-10", "Quest queue", "Build a backlog full of adventures worth starting.", m => m.backlog, "backlog games", [[1, "First in line", 50], [10, "Quest keeper", 125], [50, "Epic catalogue", 275]]],
    ["active-run", "In the action", "Keep a few adventures moving at once.", m => m.playing, "playing games", [[1, "Press start", 50], [5, "Multi-runner", 125], [20, "Play-all champion", 275]]],
    ["pause-menu", "Strategic pause", "Make space for the games waiting in the wings.", m => m.onHold, "games on hold", [[1, "Breather", 50], [5, "Tactician", 125], [20, "Master planner", 275]]],
    ["fresh-start", "New game plus", "Give a dropped game another chance.", m => m.dropped, "dropped games", [[1, "Second look", 50], [5, "Comeback crew", 125], [20, "Never say game over", 275]]],
    ["goal-setter", "The long game", "Set a playtime target for the road ahead.", m => m.goals, "game goals", [[1, "First milestone", 50], [10, "Route planner", 125], [50, "Campaign architect", 275]]],
    ["genre-atlas", "Genre atlas", "Explore games across different kinds of worlds.", m => m.genres, "genres and tags", [[3, "Curious", 50], [8, "Well travelled", 125], [15, "Genre cartographer", 275]]],
    ["art-gallery", "Art gallery", "Give your library a little visual flair.", m => m.art, "games with artwork", [[1, "First frame", 50], [10, "Gallery curator", 125], [50, "The full collection", 275]]],
    ["star-player", "Star player", "Rate the games that made an impression.", m => m.rated, "rated games", [[1, "First rating", 50], [10, "Sharp-eyed critic", 125], [50, "Hall of fame critic", 275]]],
    ["status-tour", "Every kind of run", "Make use of every corner of your library.", m => m.statuses, "statuses used", [[2, "On the board", 50], [4, "Full roster", 125], [6, "Complete player", 275]]],
    ["hype-train", "Hype train", "Keep upcoming releases on your radar.", m => m.upcoming, "upcoming games", [[1, "On the radar", 50], [5, "Hype builder", 125], [20, "Release-day ready", 275]]],
    ["long-haul", "Long haul", "Sink serious time into a single game.", m => Math.floor(m.longest), "hours in one game", [[20, "Deep dive", 75], [60, "Marathoner", 175], [150, "Endless quest", 325]]],
    ["goal-crusher", "Goal crusher", "Reach the playtime goals you set.", m => m.goalsMet, "goals reached", [[1, "On target", 75], [5, "Sharpshooter", 175], [25, "Never miss", 325]]],
    ["completionist", "Completionist", "Finish a big share of your library.", m => m.games >= 10 ? Math.floor(m.completed / m.games * 100) : 0, "% finished (10+ games)", [[25, "Quarter clear", 75], [50, "Halfway hero", 175], [75, "True completionist", 325]]],
    ["loved-finished", "Loved and finished", "Complete the games you marked as favourites.", m => m.favoriteDone, "favourites finished", [[1, "Worth it", 75], [5, "Heart of gold", 175], [20, "Cherished classics", 300]]],
    ["play-logger", "Play logger", "Track hours so your history stays honest.", m => m.logged, "games with hours logged", [[1, "First log", 50], [10, "Dedicated tracker", 125], [50, "Archivist of hours", 275]]],
    ["game-vault", "Game vault", "Grow a library worth getting lost in.", m => m.games, "games saved", [[50, "Stacked shelf", 100], [150, "Vault keeper", 200], [400, "Endless library", 350]]],
    ["hour-hoarder", "Hour hoarder", "Rack up serious total playtime.", m => Math.floor(m.hours), "total hours", [[1000, "Thousand club", 150], [2500, "Time lord", 250], [5000, "Beyond the clock", 400]]],
    ["retro-revival", "Retro revival", "Keep the classics in rotation.", m => m.retro, "pre-2005 games", [[1, "Old school", 50], [5, "Cartridge keeper", 125], [20, "Arcade historian", 275]]],
    ["fresh-release", "Fresh release", "Stay current with recent launches.", m => m.recent, "recent games", [[1, "Day one", 50], [5, "Trend chaser", 125], [20, "Launch regular", 275]]],
    ["era-hopper", "Era hopper", "Play across the decades of gaming.", m => m.decades, "decades", [[2, "Two eras", 50], [4, "Time hopper", 125], [6, "All eras", 275]]],
    ["clean-slate", "Clean slate", "Hold a growing library with an empty backlog.", m => m.backlog === 0 ? m.games : 0, "games, zero backlog", [[5, "Nothing waiting", 75], [25, "Caught up", 175], [100, "Backlog banished", 325]]],
    ["critic-chair", "Critic's chair", "Keep rating what you play.", m => m.rated, "rated games", [[100, "Regular voice", 100], [250, "Trusted critic", 200], [500, "Legendary reviewer", 350]]],
    ["favorite-vault", "Favourite vault", "Grow a shelf of all-time favourites.", m => m.favorites, "favourites", [[50, "Treasure shelf", 100], [100, "Vault of legends", 200], [200, "Hall of heroes", 350]]],
    ["endgame", "Endgame", "Roll credits on a huge number of games.", m => m.completed, "games completed", [[150, "Veteran", 150], [300, "Elite finisher", 250], [500, "Endgame legend", 400]]],
    ["quest-log", "Quest log", "Keep many adventures active or queued at once.", m => m.backlog + m.playing + m.onHold, "active quests", [[10, "Busy log", 75], [30, "Packed journal", 175], [100, "Epic campaign", 325]]],
    ["cover-wall", "Cover wall", "Fill your library with artwork.", m => m.art, "games with artwork", [[100, "Gallery wall", 150], [250, "Museum floor", 250], [500, "Grand exhibition", 400]]],
    ["genre-cartographer", "Genre cartographer", "Map out every corner of gaming.", m => m.genres, "genres and tags", [[25, "Wide taste", 150], [50, "World mapper", 250], [100, "Atlas complete", 400]]],
    ["never-ending", "Never-ending", "Push a single game past the hundreds of hours.", m => Math.floor(m.longest), "hours in one game", [[200, "Hooked", 150], [500, "Lifestyle game", 250], [1000, "Second home", 400]]],
    ["juggler", "Juggler", "Keep many games in rotation at once.", m => m.playing, "playing now", [[10, "Plate spinner", 150], [25, "Rotation master", 250], [50, "Circus act", 400]]],
    ["grand-planner", "Grand planner", "Set playtime goals across the library.", m => m.goals, "games with goals", [[100, "Planner", 150], [250, "Strategist", 250], [500, "Master of plans", 400]]],
    ["completion-100", "Credits master", "See a hundred adventures through to the end.", m => m.completed, "completed games", [[10, "Closer", 75], [50, "Final boss", 175], [100, "Credits master", 325]]]
  ];
  const metrics = items => {
    const games = items.filter(item => item.category === "game");
    const isDone = item => String(item.status || "").toLowerCase() === "completed";
    const countStatus = name => games.filter(item => String(item.status || "").toLocaleLowerCase() === name.toLocaleLowerCase()).length;
    const labels = value => (Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,;|]/) : []).map(row => String(row?.name || row?.label || row || "").trim()).filter(Boolean);
    const genres = new Set(games.flatMap(item => [...labels(item.genre), ...labels(item.genres), ...labels(item.tags), ...labels(item.categories), ...labels(item.cachedDetails?.genres), ...labels(item.cachedDetails?.tags)]).map(value => value.toLocaleLowerCase()));
    const yearOf = item => Number(String(item.year || item.releaseDate || item.cachedDetails?.year || "").match(/(?:19|20)\d{2}/)?.[0]) || 0, thisYear = new Date().getFullYear();
    const genreCounts = new Map(); games.forEach(item => new Set([...labels(item.genre), ...labels(item.genres), ...labels(item.tags), ...labels(item.cachedDetails?.genres)].map(v => v.toLocaleLowerCase())).forEach(g => genreCounts.set(g, (genreCounts.get(g) || 0) + 1)));
    return { retro: games.filter(item => yearOf(item) && yearOf(item) < 2005).length, recent: games.filter(item => yearOf(item) >= thisYear - 1).length, decades: new Set(games.map(item => Math.floor(yearOf(item) / 10)).filter(Boolean)).size, topGenre: Math.max(0, ...genreCounts.values()), upcoming: countStatus("Upcoming"), longest: games.reduce((max, item) => Math.max(max, Number(item.progress) || 0), 0),
      goalsMet: games.filter(item => Math.max(0, Number(item.goal) || Number(item.completionTargetHours) || 0) > 0 && Number(item.progress) >= Math.max(Number(item.goal) || 0, Number(item.completionTargetHours) || 0)).length,
      favoriteDone: games.filter(item => item.favorite && isDone(item)).length, logged: games.filter(item => Number(item.progress) > 0).length,
      games: games.length, completed: games.filter(item => String(item.status || "").toLowerCase() === "completed").length,
      favorites: games.filter(item => item.favorite).length,
      hours: games.reduce((sum, item) => sum + Math.max(0, Number(item.progress) || 0), 0),
      backlog: countStatus("Backlog"), playing: countStatus("Playing"), onHold: countStatus("On Hold"), dropped: countStatus("Dropped"),
      goals: games.filter(item => Math.max(0, Number(item.goal) || 0, Number(item.completionTargetHours) || 0) > 0).length,
      genres: genres.size,
      art: games.filter(item => item.customCover || item.localThumbnailData || item.localPortraitData || item.image || item.cachedDetails?.portraitImage).length,
      rated: games.filter(item => Number(item.rating) > 0 || Number(item.facts?.rating) > 0).length,
      statuses: new Set(games.map(item => String(item.status || "").trim().toLocaleLowerCase()).filter(Boolean)).size };
  };
  // ---- Flat achievements: every rank of every badge is its own achievement, grouped into categories. ----
  const GROUPS = [
    ["library", "Library", "Grow a collection worth getting lost in.", ["first-game", "collector-10", "game-vault", "status-tour", "art-gallery", "cover-wall"]],
    ["playtime", "Playtime", "Hours logged, goals set and marathons survived.", ["playtime-100", "long-haul", "never-ending", "hour-hoarder", "play-logger", "goal-setter", "goal-crusher", "grand-planner"]],
    ["finishing", "Finishing", "See your adventures through to the credits.", ["first-completion", "completionist", "completion-100", "endgame", "loved-finished"]],
    ["queue", "Backlog & Queue", "Keep the quest log moving.", ["backlog-10", "active-run", "pause-menu", "fresh-start", "quest-log", "juggler", "clean-slate"]],
    ["taste", "Favourites & Ratings", "Rate what you play and keep the best close.", ["favorite-five", "star-player", "critic-chair", "favorite-vault"]],
    ["discovery", "Discovery", "Explore genres and the decades of gaming.", ["genre-atlas", "genre-cartographer", "hype-train", "retro-revival", "fresh-release", "era-hopper"]]
  ];
  const META_GROUPS = [
    ["medals", "Medal Kings", "Collect every bronze, silver and gold medal."],
    ["collector", "Badge Collector", "Grow your total number of unlocked achievements."],
    ["levels", "Levels & Ranks", "Climb the level ladder and master whole badge families."]
  ];
  const ALL_GROUPS = [...GROUPS.map(([id, title, blurb]) => [id, title, blurb]), ...META_GROUPS];
  const GROUP_OF = new Map(GROUPS.flatMap(([gid, , , ids]) => ids.map(id => [id, gid])));
  const MEDALS = [["bronze", "Bronze"], ["silver", "Silver"], ["gold", "Gold"]];
  const RARITY = { bronze: "Common", silver: "Rare", gold: "Epic", special: "Legendary" };
  const REWARD = { bronze: 50, silver: 150, gold: 300, special: 500 };
  const LEVEL_XP = 500;
  const STORE = "savepoint";
  const DATES_KEY = `${STORE}_achievement_dates_v1`;
  const LEVEL_NAMES = "Tutorial Taker|Button Masher|Save Point Finder|Side Questor|Loot Collector|Party Member|Dungeon Crawler|Boss Challenger|Combo Maker|Speed Runner|Achievement Hunter|Quest Veteran|Map Explorer|Class Master|Raid Regular|Guild Officer|Lore Keeper|Co-op Captain|Hardcore Player|Arcade Champion|Secret Finder|Platinum Chaser|Strategy Savant|Open-World Wanderer|Campaign Conqueror|Legend of the Library|Retro Royalty|Boss Slayer|Endgame Elite|Grandmaster|Hall of Famer|Cartridge Collector|Console Connoisseur|Game Sage|Master of Worlds|Living Legend|Eternal Player|High Score Holder|Arcade Immortal|Final Boss|Game Master|Pixel Prodigy|Quest Eternal|Realm Ruler|Mythic Gamer|Mythic Champion|Infinite Continue|Beyond Max Level|Transcendent Player|Save Point Sage".split("|");
  // Military-style insignia: c = chevrons, r = rockers, s = stars, b = bars.
  const INSIGNIA = [[1, "c1"], [5, "c2"], [10, "c3"], [15, "c3r1"], [20, "c3r2"], [25, "c3r3"], [30, "s1c3"], [35, "s2c3"], [40, "B1"], [42, "O1"], [44, "T3"], [46, "D4"], [48, "P5"], [50, "O1k"]];
  const insigniaSpec = level => INSIGNIA.reduce((spec, [from, value]) => level >= from ? value : spec, "c1");
  const starPoints = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`; }).join(" ");
  const insignia = (spec, paint = "currentColor") => {
    if (/^[BOTDP]\d/.test(spec)) {
      const kind = spec[0], crown = spec.includes("k"), star = (x, y, R) => `<polygon points="${starPoints(x, y, R, R * 0.46)}" fill="${paint}" stroke="${paint}" stroke-width="2" stroke-linejoin="round"/>`;
      if (kind === "B") return star(48, 50, 25);
      if (kind === "T") return star(48, 33, 14) + star(32, 62, 14) + star(64, 62, 14);
      if (kind === "D") return star(48, 28, 12) + star(48, 72, 12) + star(26, 50, 12) + star(70, 50, 12);
      if (kind === "P") return Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return star(48 + 25 * Math.cos(a), 52 + 25 * Math.sin(a), 12); }).join("");
      const cy = crown ? 58 : 50, r = crown ? 23 : 28;
      return `<circle cx="48" cy="${cy}" r="${r}" fill="none" stroke="${paint}" stroke-width="5"/>${star(48, cy, r - 9)}${crown ? `<polygon points="35,28 33,15 41,21 48,10 55,21 63,15 61,28" fill="${paint}" stroke="${paint}" stroke-width="1.5" stroke-linejoin="round"/>` : ""}`;
    }
    const n = letter => Number((String(spec).match(new RegExp(`${letter}(\\d)`)) || [])[1]) || 0, stars = n("s"), chevrons = n("c"), rockers = n("r"), bars = n("b");
    const parts = [[stars, 16, y => { const gap = 16, x0 = 48 - (stars - 1) * gap / 2; return Array.from({ length: stars }, (_, i) => `<polygon points="${starPoints(x0 + i * gap, y + 8, 8, 3.4)}" fill="${paint}"/>`).join(""); }],
      [chevrons, (chevrons - 1) * 11 + 10, y => Array.from({ length: chevrons }, (_, i) => `<polyline points="29,${y + i * 11 + 10} 48,${y + i * 11} 67,${y + i * 11 + 10}" fill="none" stroke="${paint}" stroke-width="5.5" stroke-linejoin="miter" stroke-linecap="butt"/>`).join("")],
      [rockers, (rockers - 1) * 9 + 8, y => Array.from({ length: rockers }, (_, i) => `<path d="M29 ${y + i * 9} Q48 ${y + i * 9 + 11} 67 ${y + i * 9}" fill="none" stroke="${paint}" stroke-width="4"/>`).join("")],
      [bars, (bars - 1) * 11 + 6, y => Array.from({ length: bars }, (_, i) => `<rect x="27" y="${y + i * 11}" width="42" height="6" rx="1" fill="${paint}"/>`).join("")]].filter(part => part[0]);
    const total = parts.reduce((sumH, part) => sumH + part[1], 0) + (parts.length - 1) * 6;
    let y = 48 - total / 2;
    return parts.map(([, height, draw]) => { const out = draw(y); y += height + 6; return out; }).join("");
  };
  const levelName = level => LEVEL_NAMES[level - 1] || `Level ${level}`;
  const sum = (rows, pick) => rows.reduce((total, row) => total + pick(row), 0);
  const readDates = () => { try { const value = JSON.parse(localStorage.getItem(DATES_KEY) || "null"); return value && typeof value === "object" ? value : null; } catch (_) { return null; } };

  const baseRows = (items, roles) => {
    const values = metrics(items, roles), rows = [];
    BADGES.forEach(([family, familyTitle, description, metric, unit, tiers]) => {
      const current = Math.max(0, Number(metric(values)) || 0);
      tiers.forEach(([target, title, xp], index) => rows.push({
        id: `${family}-t${index + 1}`, family, familyTitle, group: GROUP_OF.get(family) || GROUPS[0][0], title, description,
        unit, current, target, xp, tier: MEDALS[index][0], kind: "badge", rank: index + 1, ranks: tiers.length, legacyId: `${family}:${target}`,
        unlocked: current >= target
      }));
    });
    return rows;
  };

  const context = (base, level) => {
    const tierCount = (tier, onlyDone) => base.filter(row => row.tier === tier && (!onlyDone || row.unlocked)).length;
    const families = new Map();
    base.forEach(row => { const f = families.get(row.family) || { n: 0, d: 0 }; f.n++; if (row.unlocked) f.d++; families.set(row.family, f); });
    return { done: base.filter(row => row.unlocked).length, total: base.length, level, bronze: tierCount("bronze", true), bronzeTotal: tierCount("bronze"), silver: tierCount("silver", true), silverTotal: tierCount("silver"),
      gold: tierCount("gold", true), goldTotal: tierCount("gold"), maxed: [...families.values()].filter(f => f.n === f.d).length, familyTotal: families.size };
  };

  const metaRows = (c) => {
    const out = [], add = (id, group, title, description, unit, current, target, tier, glyph, label) => out.push({ id, family: id, familyTitle: title, group, title, description, unit, current, target, xp: REWARD[tier], tier, kind: "meta", glyph, label, rank: 1, ranks: 1, legacyId: `${id}:${target}`, unlocked: current >= target });
    MEDALS.forEach(([key, label]) => {
      const total = c[`${key}Total`], lower = label.toLowerCase();
      const targets = [...new Set([Math.min(3, total), Math.min(10, total), total])].filter(t => t > 0);
      targets.forEach((target, i) => {
        const king = i === targets.length - 1;
        add(`medal-${key}-${i + 1}`, "medals", king ? `${label} King` : `${label} ${i === 0 ? "Starter" : "Collector"}`, king ? `Earn every ${lower} badge. The full ${label} set is yours.` : `Earn ${target} ${lower} badges.`, `${lower} badges`, c[key], target, key, king ? "crown" : "medal", String(target));
      });
    });
    const COLLECT = [[1, "First Badge"], [10, "Ten Strong"], [25, "Quarter Century"], [50, "Half Century"], [75, "Three Quarters"], [100, "Centurion"], [150, "Badge Baron"], [200, "Overachiever"]].filter(([target]) => target < c.total);
    COLLECT.forEach(([target, title], i) => add(`collect-${target}`, "collector", title, target === 1 ? "Unlock your very first achievement." : `Unlock ${target} achievements in total.`, "achievements", c.done, target, ["bronze", "bronze", "silver", "silver", "gold", "gold", "special", "special"][i], "laurel", String(target)));
    add("collect-all", "collector", "Collection Complete", "Unlock every single achievement. Nothing left to chase.", "achievements", c.done, c.total, "special", "crown", "laurel");
    [[1, "Rank Up"], [5, "Rank Climber"], [10, "Rank Master"], [20, "Rank Legend"]].filter(([target]) => target < c.familyTotal).forEach(([target, title], i) => add(`maxed-${target}`, "levels", title, `Reach the top rank of ${target} different badge${target === 1 ? "" : "s"}.`, "badges at top rank", c.maxed, target, ["bronze", "silver", "gold", "special"][i], "ins", ["b1", "b2", "b3", "b4"][i]));
    add("maxed-all", "levels", "Maxed Out", "Reach the top rank of every badge family.", "badges at top rank", c.maxed, c.familyTotal, "special", "ins", "s1b3");
    [2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(n => add(`level-${n}`, "levels", levelName(n), `Reach level ${n} and earn the rank of ${levelName(n)}.`, "level", c.level, n, n <= 10 ? "bronze" : n <= 25 ? "silver" : n <= 40 ? "gold" : "special", "ins", insigniaSpec(n)));
    return out;
  };

  // The badge maths walks the whole library several times, and entries() is called by the profile, this page, awards and shares:
  // keep the last result and reuse it while the library has not changed (same array, same size, same update stamps).
  let memo = { items: null, roles: null, key: "", rows: null };
  const libraryKey = items => { let stamp = 0, favorites = 0; for (const item of items) { stamp += Number(item.updatedAt) || 0; if (item.favorite) favorites++; } return `${items.length}:${stamp}:${favorites}`; };
  const computeRows = (items, roles) => {
    const base = baseRows(items, roles);
    let level = 1 + Math.floor(sum(base.filter(row => row.unlocked), row => row.xp) / LEVEL_XP), meta = metaRows(context(base, level));
    for (let i = 0; i < 8; i++) {
      const next = 1 + Math.floor(sum([...base, ...meta].filter(row => row.unlocked), row => row.xp) / LEVEL_XP);
      if (next === level) break;
      level = next; meta = metaRows(context(base, level));
    }
    return [...base, ...meta];
  };
  const entries = (items, roles = {}) => {
    const dates = readDates() || {}, key = libraryKey(items);
    if (!(memo.items === items && memo.key === key)) memo = { items, roles, key, rows: computeRows(items, roles) };
    return memo.rows.map(row => {
      const asset = `icons/achievement-badges/${row.id}.svg`, unlockedAt = row.unlocked ? Number(dates[row.id]) || 0 : 0;
      return { ...row, asset, unlockedAt, rarity: RARITY[row.tier], percent: row.unlocked ? 100 : Math.min(99, Math.floor(row.current / Math.max(1, row.target) * 100)),
        name: row.title, level: row.unlocked ? 1 : 0, earned: row.unlocked ? [{ id: row.legacyId, name: row.title, target: row.target, xp: row.xp, asset }] : [] };
    });
  };
  const progression = rows => {
    const xp = sum(rows.filter(row => row.unlocked), row => row.xp), level = 1 + Math.floor(xp / LEVEL_XP), intoLevel = xp % LEVEL_XP;
    return { xp, level, intoLevel, name: levelName(level), nextName: levelName(level + 1), nextLevelXp: LEVEL_XP, percent: Math.round(intoLevel / LEVEL_XP * 100), earned: rows.filter(row => row.unlocked).length, total: rows.length };
  };
  const recent = (rows, count = 3) => rows.filter(row => row.unlocked).map((row, index) => ({ row, index })).sort((a, b) => (b.row.unlockedAt - a.row.unlockedAt) || (b.index - a.index)).slice(0, count).map(entry => entry.row);
  const unlocks = (items, roles) => entries(items, roles).filter(row => row.unlocked).map(row => ({ id: row.legacyId, name: row.title, target: row.target, xp: row.xp, asset: row.asset, title: row.familyTitle, badgeId: `a-${row.id}` }));
  const stamp = (items, roles) => {
    try {
      const had = readDates(), dates = had || {}; let changed = !had;
      entries(items, roles).filter(row => row.unlocked).forEach(row => { if (!(row.id in dates)) { dates[row.id] = had ? Date.now() : 0; changed = true; } });
      if (changed) localStorage.setItem(DATES_KEY, JSON.stringify(dates));
    } catch (_) {}
  };
  const levelTable = maxLevel => Array.from({ length: maxLevel }, (_, i) => ({ level: i + 1, name: levelName(i + 1), xp: i * LEVEL_XP }));

  // ---- Rendering ----
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const ring = (percent, level = 1) => `<svg class="achievement-level-ring" viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="lvg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff2a6"/><stop offset=".5" stop-color="#f1b01f"/><stop offset="1" stop-color="#b86f00"/></linearGradient><linearGradient id="lvf" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2b2f66"/><stop offset="1" stop-color="#0a0c1e"/></linearGradient></defs><polygon points="50.0,10.0 89.8,33.0 89.8,79.0 50.0,102.0 10.2,79.0 10.2,33.0" class="ring-track" pathLength="100"/><polygon points="50.0,17.0 83.8,36.5 83.8,75.5 50.0,95.0 16.2,75.5 16.2,36.5" fill="url(#lvf)"/><g transform="translate(50 50) scale(.78) translate(-48 -48)">${insignia(insigniaSpec(level), "#f6d56b")}</g><polygon points="50.0,10.0 89.8,33.0 89.8,79.0 50.0,102.0 10.2,79.0 10.2,33.0" class="ring-bar" pathLength="100" stroke-dasharray="${Math.max(0.1, percent)} 100"/></svg>`;
  const LOCK = `<svg class="level-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Locked"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
  const dateText = row => row.unlockedAt > 0 ? new Date(row.unlockedAt).toLocaleDateString() : "";
  const requirement = row => `${Number(row.target).toLocaleString()} ${row.unit}`;
  const sub = row => row.unlocked ? (dateText(row) || "Unlocked") : row.current > 0 ? `${Math.floor(row.current).toLocaleString()}/${requirement(row)}` : requirement(row);
  const artImg = (row, cls, size) => `<span class="ach-art-wrap ${cls}-wrap"><img class="${cls}${row.unlocked ? "" : " is-locked"}" src="${row.asset}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async" onload="this.parentNode.classList.add('is-ready')" onerror="this.parentNode.classList.add('is-ready')"></span>`;
  const tile = row => `<a class="ach-badge is-${row.tier} ${row.unlocked ? "is-unlocked" : "is-locked"}" href="#achievements/a-${row.id}" aria-label="${esc(row.title)}, ${row.unlocked ? "unlocked" : "locked"}">${artImg({ asset: row.asset, unlocked: true }, "ach-badge-art", 96)}<strong>${esc(row.title)}</strong><small>${esc(sub(row))}</small>${!row.unlocked && row.current > 0 ? `<span class="ach-tier-bar"><i style="width:${row.percent}%"></i></span>` : ""}</a>`;
  const groupRows = (rows, id) => rows.filter(row => row.group === id);
  const featured = list => [...list.filter(row => row.unlocked).sort((a, b) => b.unlockedAt - a.unlockedAt), ...list.filter(row => !row.unlocked).sort((a, b) => b.percent - a.percent)];
  const head = (back, title = "Achievements", right = `<span class="detail-heading-spacer" aria-hidden="true"></span>`) => `<header class="detail-page-heading analytics-page-heading"><a class="detail-back" href="${back}"><span aria-hidden="true">‹</span> Back</a><strong>${esc(title)}</strong>${right}</header>`;

  function page(ctx) {
    const rows = entries(ctx.items || [], ctx.roles || {}), progress = progression(rows), route = String(ctx.achievementId || "");
    if (route === "levels") {
      const maxLevel = 1 + Math.floor(sum(rows, row => row.xp) / LEVEL_XP), table = levelTable(maxLevel);
      return `<section class="achievements-page">${head("#achievements", "Levels")}<article class="level-summary"><div class="achievement-level-orb is-static">${ring(progress.percent, progress.level)}<span>LVL</span><strong>${progress.level}</strong></div><div><p class="achievement-eyebrow">YOU ARE</p><h1>${esc(progress.name)}</h1><p>${progress.xp} XP · ${LEVEL_XP - progress.intoLevel} XP to ${esc(progress.nextName)}</p></div></article><p class="level-note">Every ${LEVEL_XP} XP earns a level. Earn XP by unlocking achievements. Level ${maxLevel} is the top level reachable with every achievement.</p><ol class="level-list">${table.map(row => `<li class="level-row${row.level > progress.level + 2 ? " is-far" : ""} ${row.level < progress.level ? "is-reached" : row.level === progress.level ? "is-current" : "is-locked"}"><span class="level-num" title="Level ${row.level}"><svg viewBox="10 10 76 76" aria-hidden="true">${insignia(insigniaSpec(row.level), "#2a1a00")}</svg><b>${row.level}</b></span><div><strong>${esc(row.name)}</strong><small>${row.xp.toLocaleString()} XP required</small>${row.level === progress.level ? `<span class="level-bar"><i style="width:${progress.percent}%"></i></span>` : ""}</div><span class="level-state">${row.level > progress.level + 2 ? LOCK : row.level < progress.level ? "Reached" : row.level === progress.level ? "You are here" : `${(row.xp - progress.xp).toLocaleString()} XP to go`}</span></li>`).join("")}</ol></section>`;
    }
    const legacy = rows.find(row => row.family === route);
    const groupId = route.startsWith("g-") ? route.slice(2) : legacy && !route.startsWith("a-") ? legacy.group : "";
    if (groupId) {
      const group = ALL_GROUPS.find(row => row[0] === groupId), list = groupRows(rows, groupId);
      if (!group || !list.length) return `<section class="achievements-page">${head("#achievements")}<h1>Category not found</h1></section>`;
      return `<section class="achievements-page">${head("#achievements", group[1])}<header class="ach-group-intro"><p>${esc(group[2])}</p><small>${list.filter(row => row.unlocked).length} of ${list.length} unlocked</small></header><div class="ach-grid">${list.map(tile).join("")}</div></section>`;
    }
    if (route.startsWith("a-")) {
      const row = rows.find(item => item.id === route.slice(2));
      if (!row) return `<section class="achievements-page">${head("#achievements")}<h1>Achievement not found</h1></section>`;
      const group = ALL_GROUPS.find(item => item[0] === row.group), date = dateText(row);
      const status = row.unlocked ? (date ? `Unlocked on ${date}` : "Unlocked") : "Not unlocked yet";
      return `<section class="achievements-page">${head(`#achievements/g-${row.group}`, group ? group[1] : "Achievements", `<button type="button" class="ach-share-icon" data-share-badge="${esc(row.id)}" aria-label="Share badge image" title="Share badge"><i data-lucide="share-2" aria-hidden="true"></i></button>`)}<article class="achievement-detail-card ach-detail is-${row.tier}${row.unlocked ? " is-unlocked" : ""}"><span class="ach-tier-chip">${MEDALS.find(m => m[0] === row.tier)?.[1] || "Legendary"}${row.kind === "badge" ? ` · ${esc(row.familyTitle)}` : ""}</span><h1>${esc(row.title)}</h1><p>${esc(row.description)}</p>${artImg(row, "achievement-art is-large", 220)}<p class="ach-detail-status${row.unlocked ? " is-done" : ""}">${esc(status)}</p>${row.unlocked ? "" : `<div class="achievement-progress"><span><i style="width:${row.percent}%"></i></span><small>${Math.floor(row.current).toLocaleString()} / ${esc(requirement(row))}</small></div>`}<div class="ach-stats"><div><strong>${esc(requirement(row))}</strong><small>Goal</small></div><div><strong>${esc(row.rarity)}</strong><small>Rarity</small></div><div><strong>+${row.xp} XP</strong><small>${row.unlocked ? "Earned" : "Reward"}</small></div></div></article></section>`;
    }
    const sections = ALL_GROUPS.map(([id, title]) => {
      const list = groupRows(rows, id); if (!list.length) return "";
      return `<section class="ach-section"><div class="ach-section-head"><div><h2>${esc(title)}</h2><small>${list.filter(row => row.unlocked).length} of ${list.length} unlocked</small></div><a href="#achievements/g-${id}">View all</a></div><div class="ach-row">${featured(list).slice(0, 10).map(tile).join("")}</div></section>`;
    }).join("");
    return `<section class="achievements-page">${head("#profile", "Achievements", `<a class="detail-back ach-levels-link" href="#achievements/levels">Levels</a>`)}<header class="achievement-hero"><a class="achievement-level-orb" href="#achievements/levels" aria-label="Level ${progress.level}, ${esc(progress.name)}. ${LEVEL_XP - progress.intoLevel} XP to next level. View all levels">${ring(progress.percent, progress.level)}<span>LVL</span><strong>${progress.level}</strong></a><div class="achievement-hero-copy"><p class="achievement-eyebrow">YOUR PLAYER LEVEL</p><h1>${esc(progress.name)}</h1><p>${progress.xp} XP · ${progress.earned} of ${progress.total} achievements unlocked</p><small>${LEVEL_XP - progress.intoLevel} XP to ${esc(progress.nextName)} · <a href="#achievements/levels">All levels ›</a></small></div></header>${sections}</section>`;
  }
  // ---- Share a badge as a PNG card (the real SVG art, not a screenshot of text) ----
  const APP_NAME = STORE === "savepoint" ? "SavePoint" : "ScreenMark";
  const wrapText = (ctx, text, maxWidth) => { const lines = []; let line = ""; String(text).split(/\s+/).filter(Boolean).forEach(word => { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next; }); if (line) lines.push(line); return lines; };
  const loadImage = async src => {
    let url = src, revoke = false;
    try { const res = await fetch(src); if (res.ok) { url = URL.createObjectURL(new Blob([await res.text()], { type: "image/svg+xml" })); revoke = true; } } catch (_) {}
    return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => { resolve(img); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 2000); }; img.onerror = () => reject(new Error("Could not load the badge image.")); img.src = url; });
  };
  const shareImage = async (items, roles, id) => {
    const row = entries(items, roles).find(item => item.id === id);
    if (!row) throw new Error("Achievement not found.");
    const W = 1080, H = 1350, canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d"), font = (typeof document !== "undefined" && getComputedStyle(document.body).fontFamily) || "sans-serif";
    const tint = { bronze: "#b8693a", silver: "#a9b6c8", gold: "#f1b01f", special: "#a855f7" }[row.tier], muted = "#9aa0b4";
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1b1d27"); bg.addColorStop(1, "#0b0c12"); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 400, 30, W / 2, 400, 520); glow.addColorStop(0, `${tint}66`); glow.addColorStop(1, `${tint}00`); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `${tint}99`; ctx.lineWidth = 4; if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(28, 28, W - 56, H - 56, 48); ctx.stroke(); } else ctx.strokeRect(28, 28, W - 56, H - 56);
    const art = await loadImage(row.asset);
    ctx.save(); if (!row.unlocked) ctx.filter = "grayscale(1) brightness(.55)"; ctx.drawImage(art, W / 2 - 250, 130, 500, 500); ctx.restore();
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const chip = `${(MEDALS.find(m => m[0] === row.tier) || ["", "Legendary"])[1]}${row.kind === "badge" ? ` · ${row.familyTitle}` : ""}`.toUpperCase();
    ctx.fillStyle = tint; ctx.font = `800 32px ${font}`; ctx.fillText(chip, W / 2, 705);
    ctx.fillStyle = "#fff"; ctx.font = `800 80px ${font}`; let y = 800;
    wrapText(ctx, row.title, W - 160).slice(0, 2).forEach(line => { ctx.fillText(line, W / 2, y); y += 90; });
    ctx.fillStyle = muted; ctx.font = `500 38px ${font}`; y += -10;
    wrapText(ctx, row.description, W - 200).slice(0, 3).forEach(line => { ctx.fillText(line, W / 2, y); y += 52; });
    const date = dateText(row);
    ctx.fillStyle = row.unlocked ? tint : muted; ctx.font = `700 40px ${font}`;
    ctx.fillText(row.unlocked ? (date ? `Unlocked on ${date}` : "Unlocked") : `Not unlocked yet · ${Math.floor(row.current).toLocaleString()} / ${requirement(row)}`, W / 2, Math.max(y + 40, 1010));
    const boxes = [[requirement(row), "Goal"], [row.rarity, "Rarity"], [`+${row.xp} XP`, row.unlocked ? "Earned" : "Reward"]], bw = 290, gap = 26, x0 = (W - (bw * 3 + gap * 2)) / 2;
    boxes.forEach(([value, label], i) => {
      const x = x0 + i * (bw + gap); ctx.fillStyle = "rgba(255,255,255,.07)"; if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, 1080, bw, 150, 28); ctx.fill(); } else ctx.fillRect(x, 1080, bw, 150);
      ctx.fillStyle = "#fff"; ctx.font = `800 34px ${font}`; const lines = wrapText(ctx, value, bw - 30).slice(0, 2); lines.forEach((line, n) => ctx.fillText(line, x + bw / 2, 1132 + n * 40 - (lines.length - 1) * 14));
      ctx.fillStyle = muted; ctx.font = `500 26px ${font}`; ctx.fillText(label, x + bw / 2, 1208);
    });
    ctx.fillStyle = muted; ctx.font = `600 28px ${font}`; ctx.fillText(`${APP_NAME} · Achievements`, W / 2, 1290);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Image export failed.");
    return { blob, filename: `${row.id}.png`, title: `${row.title} badge` };
  };
  window.SplitAppPages.achievements = page;
  window.SplitAppAchievements = { metrics, entries, progression, unlocks, recent, stamp, levelName, levelTable, shareImage, insignia, insigniaSpec, groups: ALL_GROUPS };
})();
