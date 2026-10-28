// App-specific metadata detail loader.
(() => {
  const metadata = window.SplitAppMetadata;
  const appKey = metadata.appKey;
  const clean = value => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const details = (source, item, data = {}) => ({
    source, title: data.title || item.title || "Untitled", description: clean(data.description || data.summary || item.description || ""),
    image: data.image || data.portraitImage || data.thumbnail || item.image || "",
    portraitImage: data.portraitImage || data.image || data.thumbnail || item.image || "",
    landscapeImage: data.landscapeImage || data.backgroundImage || "",
    year: data.year || item.year || "", rating: data.rating || item.rating || 0,
    goal: data.goal || item.goal || 0, progress: Number(item.progress) || 0,
    url: data.url || item.url || "", fields: (data.fields || []).filter(row => row && row.value !== undefined && row.value !== null && row.value !== ""),
    links: (data.links || []).filter(row => row?.url),
    sections: (data.sections || []).filter(section => section && Array.isArray(section.items) && section.items.length),
    purchase: data.purchase && typeof data.purchase === "object" ? data.purchase : null
  });
  const value = input => {
    if (input == null) return "";
    if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") return String(input);
    if (Array.isArray(input)) return input.map(value).filter(Boolean).join(", ");
    return "";
  };
  const wikidataClaim = (entity, property) => {
    const raw = entity?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
    if (typeof raw === "string") return raw;
    if (raw?.time) return raw.time.replace(/^\+/, "").slice(0, 10);
    if (raw?.amount) return raw.amount;
    if (raw?.text) return raw.text;
    if (raw?.id) return raw.id;
    return "";
  };
  const controller = window.SplitAppDiscovery;
  const encode = controller.encode || (value => encodeURIComponent(String(value ?? "")));
  const get = (url, settings = {}) => controller.requestJson(url, settings);
  const getText = (url, settings = {}) => controller.requestText(url, settings);
  const loaders = {
        wikidata: async (item,s) => { const data=await get(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encode(item.providerId)}&format=json&props=labels|descriptions|claims|sitelinks&languages=en`,s);const entity=data.entities?.[item.providerId]||{},label=entity.labels?.en?.value||item.title,desc=entity.descriptions?.en?.value||"";const image=wikidataClaim(entity,"P18");return details("wikidata",item,{title:label,description:desc,image:image?`https://commons.wikimedia.org/wiki/Special:FilePath/${encode(image)}`:"",url:`https://www.wikidata.org/wiki/${encode(item.providerId)}`,fields:[["Published",wikidataClaim(entity,"P577")],["Genre",wikidataClaim(entity,"P136")],["Platform",wikidataClaim(entity,"P400")],["Official website",wikidataClaim(entity,"P856")]].map(([label,value])=>({label,value}))});},
    freetogame: async (item,s) => { const d=await get(`https://www.freetogame.com/api/game?id=${encode(item.providerId)}`,s);return details("freetogame",item,{title:d.title,description:d.description,image:d.thumbnail,portraitImage:d.thumbnail,landscapeImage:d.screenshots?.[0]?.image,year:d.release_date?.slice(0,4),url:d.game_url,sections:d.screenshots?.length?[{title:"Screenshots",kind:"gallery",items:d.screenshots.slice(0,12).map((shot,index)=>({title:`Screenshot ${index+1}`,image:shot.image,url:shot.image}))}]:[],fields:[["Genre",d.genre],["Platform",d.platform],["Publisher",d.publisher],["Developer",d.developer],["Release date",d.release_date],["System requirements",[d.minimum_system_requirements?.os,d.minimum_system_requirements?.processor,d.minimum_system_requirements?.memory,d.minimum_system_requirements?.graphics,d.minimum_system_requirements?.storage].filter(Boolean).join(" · ")]].map(([label,value])=>({label,value}))});},
    steamdb: async (item,s) => { const id=String(item.providerId).replace(/^app:/,"");const steamUrl=`https://store.steampowered.com/app/${id}/`;const steamDbUrl=`https://steamdb.info/app/${id}/`;const data=await get(`https://store.steampowered.com/api/appdetails?appids=${encode(id)}&l=english&cc=us`,s);const d=data?.[id]?.data;if(!d)throw new Error("Steam could not load this game's details.");return details("steamdb",item,{title:d.name,description:d.short_description,image:d.capsule_image||d.header_image,portraitImage:d.capsule_image||d.capsule_imagev5||d.header_image,landscapeImage:d.header_image,url:steamDbUrl,purchase:{url:steamUrl,price:d.price_overview?.final_formatted||(d.is_free?"Free":"Price unavailable"),isFree:Boolean(d.is_free)},links:[{label:"View in SteamDB",url:steamDbUrl}],sections:d.screenshots?.length?[{title:"Screenshots",kind:"gallery",items:d.screenshots.slice(0,20).map((shot,index)=>({title:`Screenshot ${index+1}`,image:shot.path_full||shot.path_thumbnail,url:shot.path_full||shot.path_thumbnail}))}]:[],fields:[["Developer",d.developers],["Publisher",d.publishers],["Genres",d.genres?.map(x=>x.description)],["Release date",d.release_date?.date],["Platforms",Object.entries(d.platforms||{}).filter(([,v])=>v).map(([k])=>k)],["Price",d.price_overview?.final_formatted]].map(([label,value])=>({label,value}))});},
    howlongtobeat: async (item,s) => {
      const id=String(item.providerId).replace(/^howlongtobeat:/, "");
      let game=null, pageError=null;
      try {
        const url=`https://howlongtobeat.com/game/${encode(id)}`, html=await getText(url,s);
        const raw=html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
        game=raw?JSON.parse(raw)?.props?.pageProps?.game?.data?.game?.[0]:null;
      } catch(error) { pageError=error; }
      if(!game) {
        const base="https://howlongtobeat.com";
        const token=await get(`${base}/api/search/site/init?t=${Date.now()}`,{...s,noCache:true,headers:{Accept:"application/json",Referer:`${base}/`}});
        if(!token?.token) throw pageError || new Error("HowLongToBeat session unavailable.");
        const payload={searchType:"games",searchTerms:String(item.title||`game ${id}`).trim().split(/\s+/),searchPage:1,size:15,searchOptions:{games:{userId:0,platform:"",sortCategory:"popular",rangeCategory:"main",rangeTime:{min:null,max:null},gameplay:{perspective:"",flow:"",genre:"",difficulty:""},rangeYear:{min:"",max:""},modifier:""},users:{sortCategory:"postcount"},lists:{sortCategory:"follows"},filter:"",sort:0,randomizer:0},useCache:true};
        const headers={Accept:"application/json","Content-Type":"application/json",Origin:base,Referer:`${base}/`,"x-auth-token":token.token};
        if(token.hpKey&&token.hpVal!=null){headers["x-hp-key"]=token.hpKey;headers["x-hp-val"]=token.hpVal;payload[token.hpKey]=token.hpVal;}
        const data=await get(`${base}/api/search/site`,{...s,method:"POST",headers,body:JSON.stringify(payload)});
        game=(data.data||[]).find(row=>String(row.game_id)===id)||(data.data||[])[0];
      }
      if(!game) throw pageError || new Error("HowLongToBeat game was not found.");
      const hours=n=>Number(n)>0?`${Math.round(Number(n)/360)/10} hours`:"";
      return details("howlongtobeat",item,{title:game.game_name,description:game.profile_summary,image:game.game_image?`https://howlongtobeat.com/games/${game.game_image}`:"",year:game.release_world,url:`https://howlongtobeat.com/game/${encode(id)}`,fields:[["Main story",hours(game.comp_main)],["Main + extras",hours(game.comp_plus)],["Completionist",hours(game.comp_100)],["Platforms",game.profile_platform],["Type",game.game_type],["Community score",game.review_score]].map(([label,value])=>({label,value}))});
    },
    rawg: async (item,s) => {
      const key=s.apiKeys?.rawg?.trim();
      if(!key) throw new Error("Add a RAWG API key in Settings → Metadata Sources.");
      const d=await get(`https://api.rawg.io/api/games/${encode(item.providerId)}?key=${encode(key)}`,s);
      let landscapeImage=d.background_image_additional||"";
      let screenshots=[];
      try {
        const gallery=await get(`https://api.rawg.io/api/games/${encode(item.providerId)}/screenshots?key=${encode(key)}&page_size=12`,s);
        screenshots=(gallery.results||[]).map((shot,index)=>({title:`Screenshot ${index+1}`,image:shot.image,url:shot.image})).filter(shot=>shot.image);
        landscapeImage ||= screenshots[0]?.image||"";
      } catch {}
      return details("rawg",item,{title:d.name,description:d.description_raw,image:item.image||d.background_image,portraitImage:item.image||d.background_image,landscapeImage,year:d.released?.slice(0,4),rating:d.rating,url:d.website||`https://rawg.io/games/${d.slug}`,sections:screenshots.length?[{title:"Screenshots",kind:"gallery",items:screenshots}]:[],fields:[["Released",d.released],["Metacritic",d.metacritic],["Genres",d.genres?.map(x=>x.name)],["Platforms",d.platforms?.map(x=>x.platform?.name)],["Developers",d.developers?.map(x=>x.name)],["Publishers",d.publishers?.map(x=>x.name)],["Playtime",d.playtime?`${d.playtime} hours average`:""],["Website",d.website]].map(([label,value])=>({label,value}))});
    },
  };
  const load = async (item, settings = {}) => {
    if (!item?.metadataSource || !item?.providerId) throw new Error("This entry has no source ID to load details from.");
    const source = metadata.providers.find(row => row.key === item.metadataSource && row.categories.includes(item.category));
    if (!source || typeof loaders[source.key] !== "function") throw new Error(`This ${appKey} app does not support ${item.metadataSource} details for ${item.category}.`);
    if (!metadata.isEnabled(source.key, settings)) throw new Error(`${source.name} is disabled in Metadata Sources.`);
    const id = String(item.providerId);
    const normalizedItem = id.startsWith(`${source.key}:`) ? { ...item, providerId: id.slice(source.key.length + 1) } : item;
    return loaders[source.key](normalizedItem, settings);
  };
  window.SplitAppDetailController = Object.freeze({ appKey, load });
})();
