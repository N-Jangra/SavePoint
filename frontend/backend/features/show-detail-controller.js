// App-specific metadata detail loader.
(() => {
  const metadata = window.SplitAppMetadata;
  const appKey = metadata.appKey;
  const clean = value => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const baseDetails = (source, item, data = {}) => ({
    source, title: data.title || item.title || "Untitled", description: clean(data.description || data.summary || item.description || ""),
    image: data.image || data.portraitImage || data.thumbnail || item.image || "",
    portraitImage: data.portraitImage || data.image || data.thumbnail || item.image || "",
    landscapeImage: data.landscapeImage || data.backgroundImage || "",
    year: data.year || item.year || "", rating: data.rating || item.rating || 0,
    goal: data.goal || item.goal || 0, progress: Number(item.progress) || 0,
    url: data.url || item.url || "", fields: (data.fields || []).filter(row => row && row.value !== undefined && row.value !== null && row.value !== ""),
    links: (data.links || []).filter(row => row?.url),
    sections: (data.sections || []).filter(section => section && Array.isArray(section.items) && section.items.length),
    purchase: data.purchase && typeof data.purchase === "object" ? data.purchase : null,
    requirements: data.requirements && (data.requirements.minimum?.length || data.requirements.recommended?.length) ? { minimum: data.requirements.minimum || [], recommended: data.requirements.recommended || [] } : null,
    languages: (data.languages || []).filter(row => row?.name),
    tags: (data.tags || []).map(String).filter(Boolean),
    badge: data.badge ? String(data.badge) : "",
    ratingBreakdown: (data.ratingBreakdown || []).filter(row => row && Number(row.percent) > 0),
    ratingCount: Number(data.ratingCount) || 0,
    stores: (data.stores || []).filter(row => row?.url && row?.name),
    schemaVersion: 2, fetchedAt: Date.now()
  });
  // Structured, provider-independent facts saved with the game so Statistics (and future features)
  // can use play time, price, team, requirements and names without re-reading provider-specific fields.
  const toList = input => Array.isArray(input) ? input.map(String).filter(Boolean) : String(input ?? "").split(/,\s*/).map(part => part.trim()).filter(Boolean);
  const numberFrom = input => { const match = String(input ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/); return match ? Number(match[1]) : 0; };
  const currencyFrom = input => window.SplitAppCurrency?.detect ? window.SplitAppCurrency.detect(input) : /₹|\bINR\b|\bRs\.?/i.test(String(input || "")) ? "INR" : /€|\bEUR\b/i.test(String(input || "")) ? "EUR" : /£|\bGBP\b/i.test(String(input || "")) ? "GBP" : /\$|\bUSD\b/i.test(String(input || "")) ? "USD" : "";
  const deriveFacts = (out, source) => {
    const field = pattern => out.fields.find(row => pattern.test(row.label))?.value;
    const team = (out.sections.find(section => /development team/i.test(section.title))?.items || []).map(row => ({ name: row.title, role: row.meta || "" }));
    const priceText = out.purchase?.price || field(/^Price$/) || "";
    const requirements = pattern => out.fields.filter(row => pattern.test(row.label)).map(row => `${row.label.replace(/^(PC|Min\.)\s*/i, "")}: ${row.value}`).join(" · ");
    return {
      source, fetchedAt: Date.now(),
      mainHours: numberFrom(field(/^Main story$/)), extrasHours: numberFrom(field(/^Main \+ extras$/)), completionistHours: numberFrom(field(/^Completionist$/)),
      averageHours: numberFrom(field(/^Playtime$/)),
      price: priceText, priceValue: /free/i.test(priceText) ? 0 : numberFrom(priceText), priceCurrency: currencyFrom(priceText),
      developers: toList(field(/^Developers?$/)), publishers: toList(field(/^Publishers?$/)), genres: toList(field(/^Genres?$/)), platforms: toList(field(/^Platforms?$/)),
      released: field(/^(Released|Release date|Published)$/) || "", metacritic: numberFrom(field(/^Metacritic$/)),
      rating: Number(out.rating) || 0, ratingCount: out.ratingCount || 0, ageRating: out.badge || "",
      alternativeNames: toList(field(/^Also known as$/)), tags: out.tags, stores: out.stores.map(row => row.name),
      minRequirements: out.requirements ? out.requirements.minimum.map(([label, value]) => `${label}: ${value}`).join(" · ") : requirements(/^(PC minimum|Min\. )/), recommendedRequirements: out.requirements ? out.requirements.recommended.map(([label, value]) => `${label}: ${value}`).join(" · ") : requirements(/^PC recommended/), languages: out.languages.map(row => row.name), team
    };
  };
  const details = (source, item, data = {}) => { const out = baseDetails(source, item, data); out.facts = deriveFacts(out, source); return out; };
  // Steam gives requirements as HTML lists; RAWG as plain "Label: value" lines. Both become [label, value] rows.
  const requirementRows = (input, kind) => {
    const text = String(input || ""); const rows = [];
    if (/<li/i.test(text)) {
      const re = /<li>\s*<strong>\s*([^<:]+?)\s*:?\s*<\/strong>\s*:?\s*([\s\S]*?)<\/li>/gi; let match;
      while ((match = re.exec(text))) { const label = clean(match[1]), value = clean(match[2]); if (label && value) rows.push([label, value]); }
      const intro = clean(text.split(/<ul/i)[0]).replace(new RegExp(`^${kind}:?\\s*`, "i"), "");
      if (intro) rows.unshift(["Requires", intro]);
    } else {
      for (const raw of clean(text.replace(/<br\s*\/?>|\r/gi, "\n")).length ? text.replace(/<br\s*\/?>|\r/gi, "\n").split(/\n+/) : []) {
        const line = clean(raw); if (!line || new RegExp(`^${kind}:?$`, "i").test(line)) continue;
        const match = line.match(/^([A-Za-z][A-Za-z .\/+&-]{1,30}):\s*(.+)$/);
        if (match && !new RegExp(`^${kind}$`, "i").test(match[1])) rows.push([match[1].trim(), match[2].trim()]); else rows.push(["Requires", line.replace(new RegExp(`^${kind}:?\\s*`, "i"), "")]);
      }
    }
    return rows;
  };
  const steamLanguages = html => {
    const [list] = String(html || "").split(/<br\s*\/?>/i);
    return list.split(",").map(part => { const name = clean(part); return { name: name.replace(/\*$/, "").trim(), audio: /\*$/.test(name) }; }).filter(row => row.name);
  };
  const value = input => {
    if (input == null) return "";
    if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") return String(input);
    if (Array.isArray(input)) return input.map(value).filter(Boolean).join(", ");
    return "";
  };
  const controller = window.SplitAppDiscovery;
  const encode = controller.encode || (value => encodeURIComponent(String(value ?? "")));
  const get = (url, settings = {}) => controller.requestJson(url, settings);
  const getText = (url, settings = {}) => controller.requestText(url, settings);
  const loaders = {
    freetogame: async (item,s) => {
      const d=await get(`https://www.freetogame.com/api/game?id=${encode(item.providerId)}`,s);
      if(!d||d.status===0) throw new Error("FreeToGame could not load this game's details.");
      const shots=(d.screenshots||[]).slice(0,12).map((shot,index)=>({title:`Screenshot ${index+1}`,image:shot.image,url:shot.image}));
      const mr=d.minimum_system_requirements||{};
      const links=[]; if(d.freetogame_profile_url) links.push({label:"FreeToGame page",url:d.freetogame_profile_url}); if(d.game_url) links.push({label:"Play / download",url:d.game_url});
      return details("freetogame",item,{title:d.title,description:d.description||d.short_description,image:d.thumbnail,portraitImage:d.thumbnail,landscapeImage:d.screenshots?.[0]?.image||d.thumbnail,year:d.release_date?.slice(0,4),url:d.game_url||d.freetogame_profile_url,links,sections:shots.length?[{title:"Screenshots",kind:"gallery",items:shots}]:[],requirements:{minimum:[["OS",mr.os],["Processor",mr.processor],["Memory",mr.memory],["Graphics",mr.graphics],["Storage",mr.storage]].filter(([,v])=>v),recommended:[]},tags:[d.genre,d.platform,"Free to play"].filter(Boolean),fields:[["Status",d.status],["Genre",d.genre],["Platform",d.platform],["Publisher",d.publisher],["Developer",d.developer],["Release date",d.release_date],["Price","Free to play"]].map(([label,value])=>({label,value}))});
    },
    steamdb: async (item,s) => {
      const id=String(item.providerId).replace(/^app:/,""); const steamUrl=`https://store.steampowered.com/app/${id}/`, steamDbUrl=`https://steamdb.info/app/${id}/`;
      const data=await get(`https://store.steampowered.com/api/appdetails?appids=${encode(id)}&l=english&cc=us`,s);
      const entry=data?.[id]; const d=entry?.success===false?null:entry?.data;
      if(!d) throw new Error("Steam could not load this game's details.");
      const shots=(d.screenshots||[]).slice(0,20).map((shot,index)=>({title:`Screenshot ${index+1}`,image:shot.path_full||shot.path_thumbnail,url:shot.path_full||shot.path_thumbnail}));
      const trailers=(d.movies||[]).slice(0,4).map(m=>{
        const videoUrl=m.mp4?.max||m.mp4?.["480"]||m.webm?.max||"";
        const videoType=m.mp4?.max||m.mp4?.["480"]?"video/mp4":m.webm?.max?"video/webm":"";
        return {title:m.name||"Trailer",image:m.thumbnail,videoUrl,videoType,meta:"Trailer"};
      }).filter(m=>m.videoUrl);
      const dlc=(d.dlc||[]).length;
      const req=html=>String(html||"").replace(/<br\s*\/?>/gi," · ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").replace(/^(Minimum|Recommended):\s*/i,"").trim();
      const pcReq=Array.isArray(d.pc_requirements)?{}:(d.pc_requirements||{});
      // Steam's wide capsule gets cropped badly as a cover; use the real portrait art when this game has it.
      const libraryArt=`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`;
      const portraitArt=await new Promise(done=>{ if(typeof Image==="undefined") return done(""); const probe=new Image(); const timer=setTimeout(()=>done(""),3500); probe.onload=()=>{clearTimeout(timer); done(probe.naturalHeight>probe.naturalWidth?libraryArt:"");}; probe.onerror=()=>{clearTimeout(timer); done("");}; probe.src=libraryArt; });
      const sections=[]; if(shots.length) sections.push({title:"Screenshots",kind:"gallery",items:shots}); if(trailers.length) sections.push({title:"Trailers",kind:"videos",items:trailers});
      return details("steamdb",item,{title:d.name,description:d.short_description||d.about_the_game,image:portraitArt||d.capsule_image||d.header_image,portraitImage:portraitArt||d.capsule_image||d.capsule_imagev5||d.header_image,landscapeImage:d.header_image||d.background,year:d.release_date?.date?.match(/\d{4}/)?.[0],rating:d.metacritic?.score?d.metacritic.score/20:0,url:steamDbUrl,purchase:{url:steamUrl,price:d.price_overview?.final_formatted||(d.is_free?"Free":"Price unavailable"),isFree:Boolean(d.is_free)},links:[{label:"View in SteamDB",url:steamDbUrl},...(d.website?[{label:"Website",url:d.website}]:[]),...(d.metacritic?.url?[{label:"Metacritic",url:d.metacritic.url}]:[])],sections,requirements:{minimum:requirementRows(pcReq.minimum,"Minimum"),recommended:requirementRows(pcReq.recommended,"Recommended")},languages:steamLanguages(d.supported_languages),tags:(d.categories||[]).map(x=>x.description).slice(0,14),badge:Number(d.required_age)>0?`Age ${d.required_age}+`:"",fields:[["Developer",d.developers],["Publisher",d.publishers],["Genres",d.genres?.map(x=>x.description)],["Release date",d.release_date?.date],["Platforms",Object.entries(d.platforms||{}).filter(([,v])=>v).map(([k])=>k)],["Price",d.price_overview?.final_formatted||(d.is_free?"Free":"")],["Discount",d.price_overview?.discount_percent?`${d.price_overview.discount_percent}% off`:""],["Metacritic",d.metacritic?.score],["Steam recommendations",d.recommendations?.total?d.recommendations.total.toLocaleString():""],["Achievements",d.achievements?.total],["Controller support",d.controller_support],["DLC",dlc?`${dlc} available`:""]].map(([label,value])=>({label,value}))});
    },    howlongtobeat: async (item,s) => {
      const id=String(item.providerId).replace(/^howlongtobeat:/, "");
      // Reuse the session from the in-app popup the user completed (cookies + that WebView's own User-Agent).
      let sess={}; try { const r=await window.Capacitor?.Plugins?.ProviderConsent?.getHowLongToBeatSession?.(); if(r?.cookie) sess.Cookie=r.cookie; if(r?.userAgent) sess["User-Agent"]=r.userAgent; } catch {}
      let game=null, pageError=null;
      try {
        const url=`https://howlongtobeat.com/game/${encode(id)}`, html=await controller.requestHowLongToBeatText(url,{...s,headers:{...(s?.headers||{}),...sess}});
        const raw=html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
        game=raw?JSON.parse(raw)?.props?.pageProps?.game?.data?.game?.[0]:null;
      } catch(error) { pageError=error; }
      if(!game) {
        const base="https://howlongtobeat.com";
        const token=await controller.requestHowLongToBeatJson(`${base}/api/search/site/init?t=${Date.now()}`,{...s,noCache:true,headers:{Accept:"application/json",Referer:`${base}/`,...sess}});
        if(!token?.token) throw pageError || new Error("HowLongToBeat session unavailable.");
        const payload={searchType:"games",searchTerms:String(item.title||`game ${id}`).trim().split(/\s+/),searchPage:1,size:15,searchOptions:{games:{userId:0,platform:"",sortCategory:"popular",rangeCategory:"main",rangeTime:{min:null,max:null},gameplay:{perspective:"",flow:"",genre:"",difficulty:""},rangeYear:{min:"",max:""},modifier:""},users:{sortCategory:"postcount"},lists:{sortCategory:"follows"},filter:"",sort:0,randomizer:0},useCache:true};
        const headers={Accept:"application/json","Content-Type":"application/json",Origin:base,Referer:`${base}/`,"x-auth-token":token.token,...sess};
        if(token.hpKey&&token.hpVal!=null){headers["x-hp-key"]=token.hpKey;headers["x-hp-val"]=token.hpVal;payload[token.hpKey]=token.hpVal;}
        const data=await controller.requestHowLongToBeatJson(`${base}/api/search/site`,{...s,method:"POST",headers,body:JSON.stringify(payload)});
        game=(data.data||[]).find(row=>String(row.game_id)===id)||(data.data||[])[0];
      }
      if(!game) throw pageError || new Error("HowLongToBeat game was not found.");
      const hours=n=>Number(n)>0?`${Math.round(Number(n)/360)/10} hours`:"";
      return details("howlongtobeat",item,{title:game.game_name,description:game.profile_summary,image:game.game_image?`https://howlongtobeat.com/games/${game.game_image}`:"",year:game.release_world,url:`https://howlongtobeat.com/game/${encode(id)}`,fields:[["Main story",hours(game.comp_main)],["Main + extras",hours(game.comp_plus)],["Completionist",hours(game.comp_100)],["Platforms",game.profile_platform],["Type",game.game_type],["Community score",game.review_score],["Release",game.release_world],["Developer",game.profile_dev],["Players polled",game.comp_all_count||game.comp_main_count],["Completions",game.count_comp?Number(game.count_comp).toLocaleString():""],["Playing now",game.count_playing?Number(game.count_playing).toLocaleString():""],["Backlogs",game.count_backlog?Number(game.count_backlog).toLocaleString():""],["Retired",game.count_retired?Number(game.count_retired).toLocaleString():""]].map(([label,value])=>({label,value}))});
    },
    rawg: async (item,s) => {
      const key=s.apiKeys?.rawg?.trim();
      if(!key) throw new Error("Add a RAWG API key in Settings → Metadata Sources.");
      const id=encode(item.providerId), base=`https://api.rawg.io/api/games/${id}`, k=`key=${encode(key)}`;
      // Details first; every extra list is optional and fetched in parallel so one failure never blocks the page.
      const opt=path=>get(`${base}/${path}${path.includes("?")?"&":"?"}${k}`,s).catch(()=>null);
      const [d, gallery, stores, series, additions, achievements, team]=await Promise.all([
        get(`${base}?${k}`,s), opt("screenshots?page_size=12"), opt("stores"), opt("game-series?page_size=10"),
        opt("additions?page_size=10"), opt("achievements?page_size=8"), opt("development-team?page_size=10")
      ]);
      const screenshots=(gallery?.results||[]).map((shot,index)=>({title:`Screenshot ${index+1}`,image:shot.image,url:shot.image})).filter(shot=>shot.image);
      const landscapeImage=d.background_image_additional||screenshots[0]?.image||"";
      const storeNames=new Map((d.stores||[]).map(row=>[row.store?.id,row.store?.name]));
      const storeLinks=(stores?.results||[]).filter(row=>row.url).map(row=>({name:storeNames.get(row.store_id)||"Store",url:row.url}));
      const links=[]; if(d.metacritic_url) links.push({label:"Metacritic",url:d.metacritic_url}); if(d.reddit_url) links.push({label:"Reddit",url:d.reddit_url});
      links.push({label:"RAWG page",url:`https://rawg.io/games/${d.slug}`});
      const related=list=>(list?.results||[]).map(row=>({title:row.name,meta:[row.released?.slice(0,4),row.rating?`★ ${row.rating}`:""].filter(Boolean).join(" · "),image:row.background_image||"",url:`https://rawg.io/games/${row.slug}`}));
      const sections=[];
      if(screenshots.length) sections.push({title:"Screenshots",kind:"gallery",items:screenshots});
      const seriesItems=related(series); if(seriesItems.length) sections.push({title:"Same series",kind:"carousel",items:seriesItems});
      const additionItems=related(additions); if(additionItems.length) sections.push({title:"Editions & DLC",kind:"carousel",items:additionItems});
      const achItems=(achievements?.results||[]).map(row=>({title:row.name,meta:row.percent?`${row.percent}% of players`:"",description:row.description,image:row.image||""}));
      if(achItems.length) sections.push({title:`Achievements (${d.parent_achievements_count||d.achievements_count||achItems.length})`,kind:"list",collapsed:true,items:achItems});
      const teamItems=(team?.results||[]).map(row=>({title:row.name,meta:(row.positions||[]).map(x=>x.name).join(", "),image:row.image||"",url:`https://rawg.io/creators/${row.slug}`}));
      if(teamItems.length) sections.push({title:"Development team",kind:"list",collapsed:true,items:teamItems});
      const ratingBreakdown=(d.ratings||[]).map(row=>({label:row.title[0].toUpperCase()+row.title.slice(1),percent:Math.round(row.percent*10)/10,id:row.id}));
      const pc=(d.platforms||[]).find(x=>x.platform?.slug==="pc")?.requirements||{};
      const req=text=>String(text||"").replace(/^(Minimum|Recommended):\s*/i,"").replace(/\s+/g," ").trim();
      const mc=(d.metacritic_platforms||[]).map(row=>`${row.platform?.name||row.platform?.platform?.name||""} ${row.metascore}`.trim()).join(" · ");
      return details("rawg",item,{title:d.name,description:d.description_raw,image:item.image||d.background_image,portraitImage:item.image||d.background_image,landscapeImage,year:d.released?.slice(0,4),rating:d.rating,url:d.website||`https://rawg.io/games/${d.slug}`,sections,links,stores:storeLinks,requirements:{minimum:requirementRows(pc.minimum,"Minimum"),recommended:requirementRows(pc.recommended,"Recommended")},tags:(d.tags||[]).filter(t=>!t.language||t.language==="eng").slice(0,16).map(x=>x.name),badge:d.esrb_rating?.name?`ESRB ${d.esrb_rating.name}`:"",ratingBreakdown,ratingCount:d.ratings_count,fields:[["Released",d.released],["Metacritic",d.metacritic],["Metacritic by platform",mc],["Genres",d.genres?.map(x=>x.name)],["Platforms",d.platforms?.map(x=>x.platform?.name)],["Developers",d.developers?.map(x=>x.name)],["Publishers",d.publishers?.map(x=>x.name)],["Also known as",d.alternative_names],["Playtime",d.playtime?`${d.playtime} hours average`:""],["Achievements",d.parent_achievements_count||d.achievements_count||""],["Website",d.website]].map(([label,value])=>({label,value}))});
    },
  };
  loaders.igdb = async (item,s) => {
    const id = Number(item.providerId);
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("This IGDB entry has an invalid game ID.");
    const rows = await controller.igdbRequest(`fields id,name,slug,summary,storyline,first_release_date,cover.url,artworks.url,screenshots.url,rating,rating_count,genres.name,platforms.name,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,game_modes.name,player_perspectives.name,themes.name,websites.url,url; where id = ${id}; limit 1;`, s);
    const game = Array.isArray(rows) ? rows[0] : null;
    if (!game) throw new Error("IGDB could not find this game's details.");
    const image = url => controller.igdbImage(url, "t_screenshot_med");
    const cover = controller.igdbImage(game.cover?.url, "t_cover_big") || item.image;
    const screenshots = [...(game.screenshots || []), ...(game.artworks || [])].map((shot,index) => ({ title:`Image ${index + 1}`, image:image(shot.url), url:image(shot.url) })).filter(row => row.image).slice(0,16);
    const companies = game.involved_companies || [];
    const developers = companies.filter(row => row.developer).map(row => row.company?.name).filter(Boolean);
    const publishers = companies.filter(row => row.publisher).map(row => row.company?.name).filter(Boolean);
    const genres = (game.genres || []).map(row => row.name).filter(Boolean);
    const platforms = (game.platforms || []).map(row => row.name).filter(Boolean);
    const modes = (game.game_modes || []).map(row => row.name).filter(Boolean);
    const themes = (game.themes || []).map(row => row.name).filter(Boolean);
    const released = game.first_release_date ? new Date(Number(game.first_release_date) * 1000).toISOString().slice(0,10) : "";
    const igdbUrl = game.url || (game.slug ? `https://www.igdb.com/games/${game.slug}` : "");
    const sites = (game.websites || []).filter(row => /^https?:\/\//i.test(row.url || ""));
    const links = [...(igdbUrl ? [{label:"IGDB page",url:igdbUrl}] : []), ...sites.slice(0,6).map((site,index) => ({label:index === 0 ? "Related website" : `Website ${index + 1}`,url:site.url}))];
    const sections = screenshots.length ? [{title:"Screenshots and artwork",kind:"gallery",items:screenshots}] : [];
    return details("igdb",item,{title:game.name,description:game.summary||game.storyline,image:cover,portraitImage:cover,landscapeImage:screenshots[0]?.image||"",year:released.slice(0,4),rating:Number(game.rating)?Number((game.rating/20).toFixed(1)):0,url:igdbUrl,links,sections,tags:[...genres,...themes],ratingCount:game.rating_count||0,fields:[["Released",released],["Genres",genres],["Platforms",platforms],["Developers",developers],["Publishers",publishers],["IGDB rating",Number(game.rating)?`${Math.round(game.rating)}/100`:""],["Game modes",modes],["Player perspectives",(game.player_perspectives||[]).map(row=>row.name).filter(Boolean)]].map(([label,value])=>({label,value}))});
  };
  const load = async (item, settings = {}) => {
    if (!item?.metadataSource || !item?.providerId) throw new Error("This entry has no source ID to load details from.");
    const source = metadata.providers.find(row => row.key === item.metadataSource && row.categories.includes(item.category));
    if (source?.custom) {
      if (!metadata.isEnabled(source.key, settings)) throw new Error(`${source.name} is disabled in Metadata Sources.`);
      const config = source.config, loaded = await controller.loadCustomDetails(config, item, settings);
      const map = config.detailMap || {}, root = loaded?.root || {}, text = path => loaded?.pickText(root, path) || "", list = path => loaded?.pickList(root, path) || [];
      const shots = list(map.screenshots).map((image, index) => ({ title: `Screenshot ${index + 1}`, image, url: image })).filter(row => /^https?:/i.test(row.image));
      return details(source.key, item, { title: text(map.title) || item.title, description: text(map.description) || item.description, image: text(map.image) || item.image, year: text(map.released).slice(0, 4) || item.year, rating: Number(text(map.rating)) || item.rating, url: text(map.url) || item.url, sections: shots.length ? [{ title: "Screenshots", kind: "gallery", items: shots }] : [], tags: list(map.tags), links: item.url ? [{ label: `Open on ${source.name}`, url: item.url }] : [], fields: [["Released", text(map.released)], ["Genres", list(map.genres)], ["Platforms", list(map.platforms)], ["Developers", list(map.developers)], ["Publishers", list(map.publishers)], ["Playtime", text(map.hours) ? `${text(map.hours)} hours average` : ""], ["Price", text(map.price)], ["Metacritic", text(map.metacritic)]].map(([label, value]) => ({ label, value })) });
    }
    if (!source || typeof loaders[source.key] !== "function") throw new Error(`This ${appKey} app does not support ${item.metadataSource} details for ${item.category}.`);
    if (!metadata.isEnabled(source.key, settings)) throw new Error(`${source.name} is disabled in Metadata Sources.`);
    const id = String(item.providerId);
    const normalizedItem = id.startsWith(`${source.key}:`) ? { ...item, providerId: id.slice(source.key.length + 1) } : item;
    return loaders[source.key](normalizedItem, settings);
  };
  window.SplitAppDetailController = Object.freeze({ appKey, load });
})();
