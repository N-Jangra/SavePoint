// Shared library card and category components used by Dashboard and Search.
(() => {
  window.SplitAppLibrary = Object.freeze({
    create(context) {
      const { prefs, items, activeCategory, category, labelCategory, esc } = context;
      return { card, filteredItems, listOrEmpty, dashboardItems };
  function card(item) {
    const cat = category(item.category), progress = Math.max(0, Number(item.progress) || 0), goal = Math.max(0, Number(item.goal) || 0);
    const percent = goal ? Math.min(100, Math.round(progress / goal * 100)) : 0;
    const unit = String(cat?.unit || "");
    const progressUnit = /^hours?$/i.test(unit) ? "h" : unit;
    const rating = item.rating ? `★ ${esc(item.rating)}${prefs.ratingFormat === "10-point" ? "/10" : "/5"}` : "";
      const fieldValue = pattern => item.cachedDetails?.fields?.find(field => pattern.test(String(field.label || "")))?.value || "";
      const displayValue = value => {
        if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).slice(0, 2).join(", ");
        if (value && typeof value === "object") return displayValue(value.name || value.title || value.label || value.value || "");
        return String(value || "").trim();
      };
      const developers = displayValue(item.facts?.developers || item.cachedDetails?.developers || item.cachedDetails?.developer || fieldValue(/^(developer|developers|studio|studios)$/i));
      const genres = displayValue(item.facts?.genres || item.cachedDetails?.genres || item.cachedDetails?.genre || fieldValue(/^(genre|genres)$/i));
      const subtitle = [developers, genres].filter(Boolean).join(" · ");
    const thumbnail = item.localThumbnailData || item.image;
    const showArtwork = prefs.showThumbnails && thumbnail;
    const art = `${showArtwork ? `<img src="${esc(thumbnail)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<span class="item-art-fallback" aria-hidden="true"${showArtwork ? " hidden" : ""}>${esc(cat?.icon || "✦")}</span>`;
    const accent = prefs.categoryColors[item.category] || cat?.color || prefs.mainColor;
    const actions = prefs.dashboardRowActions === "quick"
      ? `<button type="button" class="card-quick-progress-button" data-action="progress" data-id="${esc(item.id)}" aria-label="Add progress to ${esc(item.title)}" title="Add progress to ${esc(item.title)}">＋</button>`
      : `<button type="button" class="card-menu-button" data-open-item-actions="${esc(item.id)}" aria-label="Actions for ${esc(item.title)}" title="Actions for ${esc(item.title)}">⋮</button>`;
    return `<article class="item-card dashboard-card" data-item="${esc(item.id)}" style="--item-accent:${esc(accent)}"><div class="item-art">${art}</div><div class="item-copy"><h3><button type="button" class="item-title-link" data-open-details data-action="details" data-id="${esc(item.id)}">${esc(item.title)}</button></h3>${subtitle ? `<p class="item-subtitle">${esc(subtitle)}</p>` : ""}<div class="item-meta">${rating && prefs.showRatings ? `<span class="item-rating">${rating}</span>` : ""}<span class="status-pill" data-status="${esc(String(item.status || "").toLowerCase())}">${esc(item.status)}</span>${goal && prefs.showProgress ? `<span class="dashboard-progress-summary" aria-label="${progress} of ${goal} ${esc(unit || "units")}"><strong>${progress}</strong><span aria-hidden="true">/</span><span>${goal}${progressUnit ? ` ${esc(progressUnit)}` : ""}</span></span>` : ""}</div>${goal && prefs.showProgress ? `<div class="progress-line"><span style="width:${percent}%"></span></div>` : ""}</div><div class="card-actions">${actions}</div></article>`;
  }
  function filteredItems(query = "") {
    const normalized = query.trim().toLocaleLowerCase();
    return items.filter(item => (activeCategory === "all" || item.category === activeCategory) && (!normalized || `${item.title} ${item.status}`.toLocaleLowerCase().includes(normalized)));
  }
  function dashboardItems(status, query = "") {
    const compareTitle = (left, right) => String(left.title || "").localeCompare(String(right.title || ""), undefined, { sensitivity: "base" });
    return filteredItems(query).filter(item => !status || item.status === status).sort((left, right) => {
      switch (prefs.dashboardSort) {
        case "recent": case "recently-added": case "created-desc": return (Number(right.createdAt) || 0) - (Number(left.createdAt) || 0) || compareTitle(left, right);
        case "recently-updated": case "updated-desc": return (Number(right.updatedAt) || 0) - (Number(left.updatedAt) || 0) || compareTitle(left, right);
        case "rating": case "highest-rated": case "rating-desc": return (Number(right.rating) || 0) - (Number(left.rating) || 0) || compareTitle(left, right);
        case "most-progress": case "progress-desc": return (Number(right.progress) || 0) - (Number(left.progress) || 0) || compareTitle(left, right);
        case "least-progress": case "progress-asc": return (Number(left.progress) || 0) - (Number(right.progress) || 0) || compareTitle(left, right);
        case "newest-release": case "release-desc": return (Number(right.year) || 0) - (Number(left.year) || 0) || compareTitle(left, right);
        case "title-desc": case "alphabetical-desc": return compareTitle(right, left);
        case "alphabetical-asc": return compareTitle(left, right);
        default: return compareTitle(left, right);
      }
    });
  }
  function listOrEmpty(list, message = "Nothing here yet.", hint = "Add something to get started.") {
    return list.length ? `<div class="item-list">${list.map(card).join("")}</div>` : `<div class="empty-state"><strong>${esc(message)}</strong><span>${esc(hint)}</span></div>`;
  }
    }
  });
})();
