// Shared library card and category components used by Dashboard and Search.
(() => {
  window.SplitAppLibrary = Object.freeze({
    create(context) {
      const { prefs, items, activeCategory, category, labelCategory, esc } = context;
      return { card, filteredItems, listOrEmpty, dashboardItems };
  function card(item) {
    const cat = category(item.category), progress = Math.max(0, Number(item.progress) || 0), goal = Math.max(0, Number(item.goal) || 0);
    const percent = goal ? Math.min(100, Math.round(progress / goal * 100)) : 0;
    const rating = item.rating ? `★ ${esc(item.rating)}${prefs.ratingFormat === "10-point" ? "/10" : "/5"}` : "";
    const thumbnail = item.localThumbnailData || item.image;
    const art = prefs.showThumbnails && thumbnail ? `<img src="${esc(thumbnail)}" alt="" loading="lazy">` : `<span>${esc(cat?.icon || "✦")}</span>`;
    const accent = prefs.categoryColors[item.category] || cat?.color || prefs.mainColor;
    const actions = prefs.dashboardRowActions === "quick"
      ? `<button data-action="progress" data-id="${esc(item.id)}" aria-label="Add progress" title="Add progress">＋</button>`
      : `<details class="card-actions-menu"><summary aria-label="Game actions" title="Game actions">⋮</summary><div><button data-action="progress" data-id="${esc(item.id)}">＋ Progress</button><button data-action="edit" data-id="${esc(item.id)}">Edit</button></div></details>`;
    return `<article class="item-card dashboard-card" data-item="${esc(item.id)}" style="--item-accent:${esc(accent)}"><div class="item-art">${art}</div><div class="item-copy"><h3><button class="item-title-link" data-open-details data-action="details" data-id="${esc(item.id)}">${esc(item.title)}</button></h3>${rating && prefs.showRatings ? `<p>${rating}</p>` : ""}<div class="item-meta"><span class="status-pill">${esc(item.status)}</span>${goal && prefs.showProgress ? `<span class="muted">${progress}/${goal} ${esc(cat?.unit || "")}</span>` : ""}</div>${goal && prefs.showProgress ? `<div class="progress-line"><span style="width:${percent}%"></span></div>` : ""}</div><div class="card-actions">${actions}</div></article>`;
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
  function listOrEmpty(list, message = "Nothing here yet.") {
    return list.length ? `<div class="item-list">${list.map(card).join("")}</div>` : `<div class="empty-state"><strong>${esc(message)}</strong><span>Add something to get started.</span></div>`;
  }
    }
  });
})();
