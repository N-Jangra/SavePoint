// This app's source registry drives Settings toggles, discovery, and detail requests.
(() => {
  const providers = [
    {"key":"freetogame","name":"FreeToGame","categories":["game"],"keyRequired":false,"domain":"www.freetogame.com"},
    {"key":"steamdb","name":"Steam + SteamDB","categories":["game"],"keyRequired":false,"domain":"store.steampowered.com"},
    {"key":"howlongtobeat","name":"HowLongToBeat","categories":["game"],"keyRequired":false,"domain":"howlongtobeat.com"},
    {"key":"rawg","name":"RAWG","categories":["game"],"keyRequired":true,"keyUrl":"https://rawg.io/apidocs","domain":"api.rawg.io"}
  ].map(source => Object.freeze({ ...source, categories: Object.freeze([...source.categories]) }));
  // User-defined JSON API sources (Settings → Metadata Sources → Custom sources) are registered at runtime.
  let custom = [];
  const customProvider = config => Object.freeze({ key: `custom:${config.id}`, name: config.name || "Custom source", categories: Object.freeze(["game"]), keyRequired: false, custom: true, config });
  const allProviders = () => [...providers, ...custom];
  const setCustom = configs => { custom = (Array.isArray(configs) ? configs : []).filter(config => config?.id && config.searchUrl).map(customProvider); };
  const list = category => allProviders().filter(source => !category || source.categories.includes(category));
  const isEnabled = (sourceKey, preferences = {}) => preferences.metadataSources?.[sourceKey] !== false;
  const available = (category, preferences = {}) => {
    const order = Array.isArray(preferences.metadataSourceOrder) ? preferences.metadataSourceOrder : [];
    const rank = new Map(order.map((key, index) => [key, index]));
    return list(category).filter(source => isEnabled(source.key, preferences))
      .sort((left, right) => (rank.get(left.key) ?? Number.MAX_SAFE_INTEGER) - (rank.get(right.key) ?? Number.MAX_SAFE_INTEGER));
  };
  function normalize(preferences = {}) {
    if (!preferences.metadataSources || typeof preferences.metadataSources !== "object") preferences.metadataSources = {};
    if (!preferences.apiKeys || typeof preferences.apiKeys !== "object") preferences.apiKeys = {};
    const allowed = new Set(allProviders().map(source => source.key));
    Object.keys(preferences.metadataSources).forEach(key => { if (!allowed.has(key)) delete preferences.metadataSources[key]; });
    Object.keys(preferences.apiKeys).forEach(key => { if (!providers.some(source => source.key === key && source.keyRequired)) delete preferences.apiKeys[key]; });
    if (!preferences.sourceOptions || typeof preferences.sourceOptions !== "object" || Array.isArray(preferences.sourceOptions)) preferences.sourceOptions = {};
    Object.keys(preferences.sourceOptions).forEach(key => { if (!allowed.has(key)) delete preferences.sourceOptions[key]; });
    allProviders().forEach(source => { if (typeof preferences.metadataSources[source.key] !== "boolean") preferences.metadataSources[source.key] = true; });
    const order = Array.isArray(preferences.metadataSourceOrder) ? preferences.metadataSourceOrder.filter(key => allowed.has(key)) : [];
    allProviders().forEach(source => { if (!order.includes(source.key)) order.push(source.key); });
    preferences.metadataSourceOrder = order;
    return preferences;
  }
  // Per-source domain, user agent and cookies (Settings → Metadata Sources → a source). Returns the URL and headers to use for one request.
  const cleanDomain = value => String(value || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  const resolve = (sourceKey, url, preferences = {}) => {
    const options = preferences.sourceOptions?.[sourceKey] || {}, provider = providers.find(source => source.key === sourceKey), headers = {};
    let target = String(url);
    const domain = cleanDomain(options.domain);
    if (domain && /^[a-z0-9.-]+(:\d+)?$/.test(domain) && provider?.domain) {
      try { const parsed = new URL(target); if (parsed.hostname === provider.domain) { parsed.host = domain; target = parsed.href; } } catch (_) {}
    }
    if (String(options.userAgent || "").trim()) headers["User-Agent"] = String(options.userAgent).trim();
    if (String(options.cookies || "").trim()) headers.Cookie = String(options.cookies).trim();
    return { url: target, headers };
  };
  window.SplitAppMetadata = Object.freeze({ resolve, cleanDomain, appKey: 'savepoint', get providers() { return allProviders(); }, list, isEnabled, available, normalize, setCustom });
})();
