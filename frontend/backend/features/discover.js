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
  async function requestJson(url, options = {}) {
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
  const requestText = (url, options = {}) => wireRequest(url, options, "text");
  const result = (source, category, providerId, title, fields = {}) => ({
    source, category, providerId: String(providerId || ""), title: String(title || "").trim(),
    year: fields.year || "", image: fields.image || "", description: fields.description || "",
    rating: fields.rating || 0, goal: Number(fields.goal) || 0, url: fields.url || "", subtitle: fields.subtitle || "", ...fields
  });
  const textFromHtml = html => String(html || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

  const searchers = {
        wikidata: async (query, category, settings) => {
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encode(query)}&language=en&type=item&limit=15&format=json&origin=*`;
      const data = await requestJson(url, settings);
      return (data.search || []).map(row => result("wikidata", category, row.id, row.label || query, { description: row.description, subtitle: row.description || (category === "movie" ? "Movie" : "Game"), url: `https://www.wikidata.org/wiki/${row.id}` }));
    },
    freetogame: async (query, category, settings) => {
      const data = await requestJson("https://www.freetogame.com/api/games", settings), q = query.toLowerCase();
      return (Array.isArray(data) ? data : []).filter(row => [row.title,row.genre,row.developer].some(value => String(value || "").toLowerCase().includes(q))).slice(0,15).map(row => result("freetogame", category, row.id, row.title, { year: row.release_date?.slice(0,4), image: row.thumbnail, description: row.short_description, url: row.game_url, subtitle: [row.genre,row.release_date,row.developer].filter(Boolean).join(" · ") }));
    },
    steamdb: async (query, category, settings) => {
      const data = await requestJson(`https://store.steampowered.com/api/storesearch/?term=${encode(query)}&l=english&cc=us`, settings);
      return (data.items || []).slice(0,20).map(row => result("steamdb", category, `app:${row.id}`, row.name, { image: row.tiny_image, url: `https://steamdb.info/app/${row.id}/`, subtitle: [row.type,row.price?.final_formatted].filter(Boolean).join(" · ") }));
    },
    howlongtobeat: async (query, category, settings) => {
      const base = "https://howlongtobeat.com";
      const token = await fetchHowLongToBeatToken(base);
      const payload = howLongToBeatPayload(query, token);
      const headers = howLongToBeatHeaders(base, token);
      let data;
      try {
        data = await requestJson(`${base}/api/search/site`, { ...settings, method:"POST", noCache:true, headers, body:JSON.stringify(payload) });
      } catch (error) {
        if (![401, 403, 404].includes(Number(error?.status)) && !/\b(401|403|404)\b/.test(error?.message || "")) throw error;
        const freshToken = await fetchHowLongToBeatToken(base, true);
        data = await requestJson(`${base}/api/search/site`, { ...settings, method:"POST", noCache:true, headers:howLongToBeatHeaders(base, freshToken), body:JSON.stringify(howLongToBeatPayload(query, freshToken)) });
      }
      return (data.data || []).filter(row => row.game_type === "game").map(row => result("howlongtobeat",category,row.game_id,row.game_name,{year:row.release_world,image:row.game_image ? `${base}/games/${row.game_image}` : "",description:row.profile_summary,url:`${base}/game/${row.game_id}`,rating:Number(row.review_score)/10,subtitle:[row.release_world,row.comp_main ? `${Math.round(row.comp_main/360)/10}h main` : "",row.comp_plus ? `${Math.round(row.comp_plus/360)/10}h +extras` : ""].filter(Boolean).join(" · ")}));
    },
    rawg: async (query, category, settings) => {
      const key = settings.apiKeys?.rawg?.trim(); if (!key) throw new Error("Add a RAWG API key in Settings → Metadata Sources.");
      const data = await requestJson(`https://api.rawg.io/api/games?key=${encode(key)}&search=${encode(query)}&page_size=15`, settings);
      return (data.results || []).map(row => result("rawg",category,row.id,row.name,{year:row.released?.slice(0,4),image:row.background_image,description:row.rating ? `RAWG rating ${row.rating}/5` : "",rating:row.rating,url:`https://rawg.io/games/${row.slug}`,subtitle:[row.released?.slice(0,4),row.rating ? `★ ${row.rating}` : ""].filter(Boolean).join(" · ")}));
    },
  };
  let howLongToBeatToken = null;
  let howLongToBeatBlockedUntil = 0;
  let howLongToBeatBlockedError = null;
  async function runSourceSearch(source, query, category, settings) {
    if (source.key === "howlongtobeat" && Date.now() < howLongToBeatBlockedUntil) {
      throw Object.assign(new Error(howLongToBeatBlockedError?.message || "HowLongToBeat temporarily denied search requests."), { status: howLongToBeatBlockedError?.status || 403 });
    }
    try {
      return await searchers[source.key](query, category, settings);
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
  async function fetchHowLongToBeatToken(base, refresh = false) {
    if (!refresh && howLongToBeatToken && Date.now() - howLongToBeatToken.fetchedAt < 10 * 60 * 1000) return howLongToBeatToken;
    const token = await requestJson(`${base}/api/search/site/init?t=${Date.now()}`, { noCache:true, headers:{ Accept:"application/json", Referer:`${base}/` } });
    if (!token?.token) throw new Error("HowLongToBeat session unavailable.");
    howLongToBeatToken = { ...token, fetchedAt:Date.now() };
    return howLongToBeatToken;
  }
  async function search(query, category, settings = {}) {
    if (!String(query || "").trim()) return [];
    const sources = metadata.available(category, settings).filter(source => typeof searchers[source.key] === "function");
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
    const searcher = searchers[source.key];
    if (typeof searcher !== "function") throw new Error("This metadata source does not support search.");
    const results = await runSourceSearch(source, query.trim(), category, settings);
    const unique = new Map();
    for (const item of results) if (item?.title) unique.set(`${item.source}:${item.providerId || item.title.toLowerCase()}`, item);
    return [...unique.values()].slice(0, 36);
  }
  function clearSourceCooldown(sourceKey) {
    if (sourceKey !== "howlongtobeat") return;
    howLongToBeatBlockedUntil = 0;
    howLongToBeatBlockedError = null;
  }
  window.SplitAppDiscovery = Object.freeze({ appKey, search, searchSource, requestJson, requestText, encode, result, textFromHtml, clearSourceCooldown });
})();
