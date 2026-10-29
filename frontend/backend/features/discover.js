// App-specific metadata search service.
(() => {
  const metadata = window.SplitAppMetadata;
  const appKey = metadata.appKey;
  const cacheName = `splitapp_${appKey}_metadata`;
  const capacitor = window.Capacitor;
  const nativeApp = Boolean(capacitor?.isNativePlatform?.() || ["android", "ios"].includes(capacitor?.getPlatform?.()));
  const nativeHttp = window.CapacitorHttp || capacitor?.Plugins?.CapacitorHttp || capacitor?.Plugins?.Http || null;
  const localPreview = !nativeApp && location.protocol.startsWith("http") && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const encode = value => encodeURIComponent(String(value || "").trim());
  async function wireRequest(url, options = {}, responseType = "json") {
    const method = String(options.method || "GET").toUpperCase();
    const headers = { Accept: responseType === "text" ? "text/html,application/xhtml+xml,*/*" : "application/json", ...(options.headers || {}) };
    // Browsers refuse to set Cookie / User-Agent. The Android app sends them as-is; the local preview passes them to its proxy; a plain website drops them.
    if (!nativeApp) {
      for (const [name, key] of [["Cookie", "x-source-cookie"], ["User-Agent", "x-source-user-agent"]]) {
        if (headers[name] && localPreview) headers[key] = headers[name];
        delete headers[name];
      }
    }
    if (nativeApp && nativeHttp?.request) {
      const response = await nativeHttp.request({
        url, method, headers, data: options.body || null,
        responseType: responseType === "text" ? "text" : "json", connectTimeout: 15000, readTimeout: 20000
      });
      const status = Number(response?.status || 0);
      if (status >= 400) throw Object.assign(new Error(`${status} ${response.statusText || "Metadata request failed"}`), { status });
      const data = response?.data;
      if (responseType === "text") return typeof data === "string" ? data : String(data ?? "");
      if (typeof data === "string") {
        try { return JSON.parse(data); }
        catch { throw new Error("Metadata provider returned invalid JSON."); }
      }
      return data;
    }
    const requestUrl = localPreview ? `/proxy?url=${encodeURIComponent(url)}` : url;
    const response = await fetch(requestUrl, { method, headers, body: options.body });
    if (!response.ok) throw Object.assign(new Error(`${response.status} ${response.statusText}`), { status: response.status });
    return responseType === "text" ? await response.text() : await response.json();
  }
  // Every request to a known source picks up that source's domain / user agent / cookies from Settings (the user's values win over built-in headers).
  function applySource(url, options = {}) {
    let host = ""; try { host = new URL(url).hostname; } catch (_) { return { url, options }; }
    const provider = metadata.providers.find(source => source.domain === host); if (!provider) return { url, options };
    const resolved = metadata.resolve(provider.key, url, options);
    return { url: resolved.url, options: { ...options, headers: { ...(options.headers || {}), ...resolved.headers } } };
  }
  async function requestJson(url, options = {}) {
    ({ url, options } = applySource(url, options));
    const method = String(options.method || "GET").toUpperCase();
    const canCache = method === "GET" && !options.noCache && window.caches && !/[?&](?:key|apikey)=/i.test(url);
    let cache = null, stale = null;
    if (canCache) {
      try {
        cache = await window.caches.open(cacheName); stale = await cache.match(url);
        const fetchedAt = Number(stale?.headers.get("x-splitapp-cached-at")) || 0;
        if (stale && fetchedAt && Date.now() - fetchedAt < 6 * 60 * 60 * 1000) return stale.json();
      } catch { cache = null; stale = null; }
    }
    try {
      const data = await wireRequest(url, options, "json");
      if (cache) {
        const headers = new Headers({ "Content-Type": "application/json", "x-splitapp-cached-at": String(Date.now()) });
        await cache.put(url, new Response(JSON.stringify(data), { status: 200, headers }));
      }
      return data;
    } catch (error) {
      if (stale && options.offlineFallback !== "none") return stale.json();
      throw error;
    }
  }
  const requestText = (url, options = {}) => { ({ url, options } = applySource(url, options)); return wireRequest(url, options, "text"); };
  const result = (source, category, providerId, title, fields = {}) => ({
    source, category, providerId: String(providerId || ""), title: String(title || "").trim(),
    year: fields.year || "", image: fields.image || "", description: fields.description || "",
    rating: fields.rating || 0, goal: Number(fields.goal) || 0, url: fields.url || "", subtitle: fields.subtitle || "", ...fields
  });
  const textFromHtml = html => String(html || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

  const searchers = {
    freetogame: async (query, category, settings) => {
      const data = await requestJson("https://www.freetogame.com/api/games", settings), q = query.toLowerCase();
      return (Array.isArray(data) ? data : []).filter(row => [row.title,row.genre,row.developer].some(value => String(value || "").toLowerCase().includes(q))).slice(0,15).map(row => result("freetogame", category, row.id, row.title, { year: row.release_date?.slice(0,4), image: row.thumbnail, description: row.short_description, url: row.game_url, subtitle: [row.genre,row.release_date,row.developer].filter(Boolean).join(" · ") }));
    },
    steamdb: async (query, category, settings) => {
      const data = await requestJson(`https://store.steampowered.com/api/storesearch/?term=${encode(query)}&l=english&cc=us`, settings);
      return (data.items || []).slice(0,20).map(row => result("steamdb", category, `app:${row.id}`, row.name, { image: row.tiny_image, url: `https://steamdb.info/app/${row.id}/`, subtitle: [row.type,row.price?.final_formatted].filter(Boolean).join(" · ") }));
    },
    howlongtobeat: async (query, category, settings) => {
      if (!nativeApp) throw new Error("HowLongToBeat search only works in the Android app. Browsers block it, so use another source here.");
      const base = "https://howlongtobeat.com";
      const token = await fetchHowLongToBeatToken(base);
      const payload = howLongToBeatPayload(query, token);
      const sessionHeaders = await howLongToBeatSessionHeaders();
      const headers = { ...howLongToBeatHeaders(base, token), ...sessionHeaders };
      let data;
      try {
        data = await requestJson(`${base}/api/search/site`, { ...settings, method:"POST", noCache:true, headers, body:JSON.stringify(payload) });
      } catch (error) {
        if (![401, 403, 404].includes(Number(error?.status)) && !/\b(401|403|404)\b/.test(error?.message || "")) throw error;
        const freshToken = await fetchHowLongToBeatToken(base, true);
        data = await requestJson(`${base}/api/search/site`, { ...settings, method:"POST", noCache:true, headers:{ ...howLongToBeatHeaders(base, freshToken), ...sessionHeaders }, body:JSON.stringify(howLongToBeatPayload(query, freshToken)) });
      }
      return (data.data || []).filter(row => row.game_type === "game").map(row => result("howlongtobeat",category,row.game_id,row.game_name,{year:row.release_world,image:row.game_image ? `${base}/games/${row.game_image}` : "",description:row.profile_summary,url:`${base}/game/${row.game_id}`,rating:Number(row.review_score)/10,subtitle:[row.release_world,row.comp_main ? `${Math.round(row.comp_main/360)/10}h main` : "",row.comp_plus ? `${Math.round(row.comp_plus/360)/10}h +extras` : ""].filter(Boolean).join(" · ")}));
    },
    rawg: async (query, category, settings) => {
      const key = settings.apiKeys?.rawg?.trim(); if (!key) throw new Error("Add a RAWG API key in Settings → Metadata Sources.");
      const data = await requestJson(`https://api.rawg.io/api/games?key=${encode(key)}&search=${encode(query)}&page_size=15`, settings);
      return (data.results || []).map(row => result("rawg",category,row.id,row.name,{year:row.released?.slice(0,4),image:row.background_image,description:row.rating ? `RAWG rating ${row.rating}/5` : "",rating:row.rating,url:`https://rawg.io/games/${row.slug}`,subtitle:[row.released?.slice(0,4),row.rating ? `★ ${row.rating}` : ""].filter(Boolean).join(" · ")}));
    },
  };
  // ---- Custom JSON API sources ----
  const pickPath = (object, path) => {
    if (!path) return undefined;
    return String(path).replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean).reduce((value, key) => value == null ? undefined : value[key], object);
  };
  const pickText = (object, path) => {
    const value = pickPath(object, path);
    if (Array.isArray(value)) return value.map(entry => typeof entry === "object" ? entry?.name || entry?.title || entry?.label || "" : entry).filter(Boolean).join(", ");
    if (value && typeof value === "object") return value.name || value.title || value.url || "";
    return value == null ? "" : String(value);
  };
  const pickList = (object, path) => {
    const value = pickPath(object, path);
    if (Array.isArray(value)) return value.map(entry => typeof entry === "object" ? entry?.name || entry?.title || entry?.label || "" : String(entry)).filter(Boolean);
    return value ? String(value).split(/,\s*/).filter(Boolean) : [];
  };
  const fillTemplate = (template, values) => String(template || "").replace(/\{(query|id|apikey)\}/g, (_, key) => key === "apikey" ? encodeURIComponent(values.apikey || "") : encodeURIComponent(values[key] ?? ""));
  const safeHttp = url => { try { const parsed = new URL(url); return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : ""; } catch { return ""; } };
  function customRequest(config, url, settings) {
    const safe = safeHttp(url);
    if (!safe) throw new Error("The custom source URL must start with http:// or https://.");
    const headers = {};
    if (config.apiKey && config.apiKeyHeader) headers[config.apiKeyHeader] = config.apiKey;
    return requestJson(safe, { ...settings, headers });
  }
  const mapCustomResult = (config, row, category, index) => {
    const map = config.map || {};
    const id = pickText(row, map.id) || pickText(row, map.title) || String(index);
    const image = pickText(row, map.image) || (config.imageTemplate ? config.imageTemplate.replace(/\{id\}/g, encodeURIComponent(id)) : "");
    return result(`custom:${config.id}`, category, id, pickText(row, map.title), { year: pickText(row, map.year).slice(0, 4), image, description: pickText(row, map.description), rating: Number(pickText(row, map.rating)) || 0, url: pickText(row, map.url), subtitle: pickText(row, map.subtitle) || pickText(row, map.year).slice(0, 4) });
  };
  async function searchCustom(config, query, category, settings) {
    const url = fillTemplate(config.searchUrl, { query, apikey: config.apiKey });
    const data = await customRequest(config, url, settings);
    const rows = config.resultsPath ? pickPath(data, config.resultsPath) : data;
    return (Array.isArray(rows) ? rows : []).slice(0, 25).map((row, index) => mapCustomResult(config, row, category, index)).filter(row => row.title);
  }
  // Used by the "Test" button in the custom source editor.
  async function testCustomSource(config, query = "zelda", settings = {}) {
    const results = await searchCustom(config, query, "game", settings);
    return results.slice(0, 5);
  }
  async function loadCustomDetails(config, item, settings) {
    if (!config.detailUrl) return null;
    const data = await customRequest(config, fillTemplate(config.detailUrl, { id: item.providerId, query: item.title, apikey: config.apiKey }), settings);
    const root = config.detailRoot ? pickPath(data, config.detailRoot) : data;
    return { root, pickText, pickList };
  }
  const searcherFor = source => searchers[source.key] || (source.custom ? (query, category, settings) => searchCustom(source.config, query, category, settings) : null);
  let howLongToBeatToken = null;
  let howLongToBeatBlockedUntil = 0;
  let howLongToBeatBlockedError = null;
  async function runSourceSearch(source, query, category, settings) {
    if (source.key === "howlongtobeat" && Date.now() < howLongToBeatBlockedUntil) {
      throw Object.assign(new Error(howLongToBeatBlockedError?.message || "HowLongToBeat temporarily denied search requests."), { status: howLongToBeatBlockedError?.status || 403 });
    }
    try {
      return await searcherFor(source)(query, category, settings);
    } catch (error) {
      const status = Number(error?.status) || Number(/\b(\d{3})\b/.exec(error?.message || "")?.[1]);
      if (source.key === "howlongtobeat" && status === 403) {
        // Avoid repeatedly calling a provider endpoint while it is denying the
        // mobile client. A fresh user search can retry after this short window.
        howLongToBeatBlockedUntil = Date.now() + 60 * 1000;
        howLongToBeatBlockedError = error;
      }
      throw error;
    }
  }
  function howLongToBeatPayload(query, token) {
    const payload = { searchType:"games", searchTerms:String(query).trim().split(/\s+/).filter(Boolean), searchPage:1, size:15, searchOptions:{ games:{userId:0,platform:"",sortCategory:"popular",rangeCategory:"main",rangeTime:{min:null,max:null},gameplay:{perspective:"",flow:"",genre:"",difficulty:""},rangeYear:{min:"",max:""},modifier:""},users:{sortCategory:"postcount"},lists:{sortCategory:"follows"},filter:"",sort:0,randomizer:0 }, useCache:true };
    if (token.hpKey && token.hpVal != null) payload[token.hpKey] = token.hpVal;
    return payload;
  }
  function howLongToBeatHeaders(base, token) {
    const headers = { Accept:"application/json", "Content-Type":"application/json", Origin:base, Referer:`${base}/`, "x-auth-token":token.token };
    if (token.hpKey && token.hpVal != null) { headers["x-hp-key"] = token.hpKey; headers["x-hp-val"] = token.hpVal; }
    return headers;
  }
  // Session from the in-app popup the user completed (cookies + that WebView's own User-Agent).
  async function howLongToBeatSessionHeaders() {
    try {
      const session = await capacitor?.Plugins?.ProviderConsent?.getHowLongToBeatSession?.();
      const headers = {};
      if (session?.cookie) headers.Cookie = session.cookie;
      if (session?.userAgent) headers["User-Agent"] = session.userAgent;
      return headers;
    } catch { return {}; }
  }
  async function fetchHowLongToBeatToken(base, refresh = false) {
    if (!refresh && howLongToBeatToken && Date.now() - howLongToBeatToken.fetchedAt < 10 * 60 * 1000) return howLongToBeatToken;
    const token = await requestJson(`${base}/api/search/site/init?t=${Date.now()}`, { noCache:true, headers:{ Accept:"application/json", Referer:`${base}/`, ...(await howLongToBeatSessionHeaders()) } });
    if (!token?.token) throw new Error("HowLongToBeat session unavailable.");
    howLongToBeatToken = { ...token, fetchedAt:Date.now() };
    return howLongToBeatToken;
  }
  async function search(query, category, settings = {}) {
    if (!String(query || "").trim()) return [];
    const sources = metadata.available(category, settings).filter(source => typeof searcherFor(source) === "function");
    if (!sources.length) throw new Error(`No enabled metadata sources are available for ${category}.`);
    const settled = await Promise.allSettled(sources.map(source => runSourceSearch(source, query.trim(), category, settings)));
    const results = settled.flatMap(entry => entry.status === "fulfilled" ? entry.value : []);
    const errors = settled.filter(entry => entry.status === "rejected").map(entry => entry.reason?.message || String(entry.reason));
    const unique = new Map();
    for (const item of results) if (item?.title) unique.set(`${item.source}:${item.providerId || item.title.toLowerCase()}`, item);
    if (!unique.size && errors.length) throw new Error(errors.join("; "));
    const output = [...unique.values()].slice(0, 36);
    output.warnings = errors;
    return output;
  }
  async function searchSource(query, category, settings = {}, sourceKey) {
    if (!String(query || "").trim()) return [];
    const source = metadata.available(category, settings).find(entry => entry.key === sourceKey);
    if (!source) throw new Error("Enable this metadata source in Settings → Metadata Sources first.");
    const searcher = searcherFor(source);
    if (typeof searcher !== "function") throw new Error("This metadata source does not support search.");
    const results = await runSourceSearch(source, query.trim(), category, settings);
    const unique = new Map();
    for (const item of results) if (item?.title) unique.set(`${item.source}:${item.providerId || item.title.toLowerCase()}`, item);
    return [...unique.values()].slice(0, 36);
  }
  // Suggestions for the empty Discover page: popular / new / upcoming lists from the enabled sources.
  async function trending(category, settings = {}, sourceKey = "") {
    const enabled = new Set(metadata.available(category, settings).map(source => source.key));
    const want = key => enabled.has(key) && (!sourceKey || sourceKey === key);
    const year = new Date().getFullYear(), today = new Date().toISOString().slice(0, 10);
    const jobs = [];
    if (want("steamdb")) jobs.push(async () => {
      const data = await requestJson("https://store.steampowered.com/api/featuredcategories?cc=us&l=english", settings);
      const money = row => `${row.currency === "USD" ? "$" : ""}${(row.final_price / 100).toFixed(2)}${row.currency && row.currency !== "USD" ? ` ${row.currency}` : ""}`;
      const pick = (title, list, upcoming = false) => ({ source: "steamdb", title, items: (list?.items || []).filter(row => row.type === 0 || row.type === undefined).slice(0, 12).map(row => result("steamdb", category, `app:${row.id}`, row.name, { image: row.header_image || row.small_capsule_image, url: `https://steamdb.info/app/${row.id}/`, subtitle: row.discounted ? `-${row.discount_percent}% · ${money(row)}` : row.final_price ? money(row) : upcoming ? "Coming soon" : "Free" })) });
      return [pick("Top sellers on Steam", data.top_sellers), pick("New on Steam", data.new_releases), pick("On sale", data.specials), pick("Coming soon", data.coming_soon, true)];
    });
    if (want("freetogame")) jobs.push(async () => {
      const data = await requestJson("https://www.freetogame.com/api/games?sort-by=popularity", settings);
      return [{ source: "freetogame", title: "Popular free-to-play", items: (Array.isArray(data) ? data : []).slice(0, 12).map(row => result("freetogame", category, row.id, row.title, { year: row.release_date?.slice(0, 4), image: row.thumbnail, description: row.short_description, url: row.game_url, subtitle: [row.genre, row.platform].filter(Boolean).join(" · ") })) }];
    });
    metadata.available(category, settings).filter(source => source.custom && source.config.suggestionsUrl && (!sourceKey || sourceKey === source.key)).forEach(source => jobs.push(async () => {
      const config = source.config;
      const data = await customRequest(config, fillTemplate(config.suggestionsUrl, { apikey: config.apiKey }), settings);
      const rows = config.suggestionsPath || config.resultsPath ? pickPath(data, config.suggestionsPath || config.resultsPath) : data;
      return [{ source: source.key, title: `${source.name}`, items: (Array.isArray(rows) ? rows : []).slice(0, 12).map((row, index) => mapCustomResult(config, row, category, index)).filter(row => row.title) }];
    }));
    const rawgKey = settings.apiKeys?.rawg?.trim();
    if (want("rawg") && rawgKey) jobs.push(async () => {
      const list = async (query) => (await requestJson(`https://api.rawg.io/api/games?key=${encode(rawgKey)}&page_size=12&${query}`, settings)).results || [];
      const map = rows => rows.map(row => result("rawg", category, row.id, row.name, { year: row.released?.slice(0, 4), image: row.background_image, description: row.rating ? `RAWG rating ${row.rating}/5` : "", rating: row.rating, url: `https://rawg.io/games/${row.slug}`, subtitle: [row.released?.slice(0, 4), row.rating ? `★ ${row.rating}` : "", row.genres?.[0]?.name].filter(Boolean).join(" · ") }));
      const [hot, best, upcoming] = await Promise.all([list(`ordering=-added&dates=${year - 1}-01-01,${year}-12-31`), list(`ordering=-metacritic&metacritic=80,100&dates=${year - 2}-01-01,${year}-12-31`), list(`ordering=-added&dates=${today},${year + 1}-12-31`)]);
      return [{ source: "rawg", title: "Trending on RAWG", items: map(hot) }, { source: "rawg", title: "Critically acclaimed", items: map(best) }, { source: "rawg", title: "Upcoming", items: map(upcoming) }];
    });
    const settled = await Promise.allSettled(jobs.map(job => job()));
    const sections = settled.flatMap(entry => entry.status === "fulfilled" ? entry.value : []).filter(section => section.items.length);
    if (!sections.length && settled.some(entry => entry.status === "rejected")) throw settled.find(entry => entry.status === "rejected").reason;
    return sections;
  }
  function clearSourceCooldown(sourceKey) {
    if (sourceKey !== "howlongtobeat") return;
    howLongToBeatBlockedUntil = 0;
    howLongToBeatBlockedError = null;
  }
  window.SplitAppDiscovery = Object.freeze({ appKey, search, searchSource, trending, testCustomSource, loadCustomDetails, requestJson, requestText, encode, result, textFromHtml, clearSourceCooldown });
})();
