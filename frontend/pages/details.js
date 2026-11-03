// Source-rich detail screen shared by the split apps.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.details = context => {
    const {
      detailPreview, items, detailItemId, detailReturnPage, detailData,
      detailLoading, detailError, detailEditMode, detailRestorePending, category, labelCategory, prefs, esc
    } = context;

    const detailValue = value => Array.isArray(value)
      ? value.map(detailValue).filter(Boolean).join(", ")
      : value && typeof value === "object"
        ? Object.values(value).map(detailValue).filter(Boolean).join(" · ")
        : window.SplitAppDates.text(String(value ?? ""));

    const safeUrl = value => {
      try {
        const url = new URL(String(value || ""));
        return ["https:", "http:"].includes(url.protocol) ? url.href : "";
      } catch { return ""; }
    };
    const safeImage = value => /^data:image\/[a-z0-9.+-]+;base64,/i.test(String(value || "")) ? String(value) : safeUrl(value);

    const renderSection = (section, watchedIds = new Set(), canToggleEpisodes = false, item = null, sectionIndex = 0, imageButton = () => "") => {
      const items = section.items || [];
      const body = section.kind === "carousel"
        ? `<div class="detail-carousel">${items.map((entry, entryIndex) => {
            const href = safeUrl(entry.url);
            const image = safeImage(item?.localImageData?.[`cachedDetails.sections.${sectionIndex}.items.${entryIndex}.image`] || entry.image);
            const inner = `<span class="detail-carousel-art">${image ? `<img src="${esc(image)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<i data-lucide="image" aria-hidden="true"${image ? " hidden" : ""}></i></span><strong>${esc(entry.title || "Untitled")}</strong>${entry.meta ? `<small>${esc(detailValue(entry.meta))}</small>` : ""}`;
            return href ? `<a class="detail-carousel-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<div class="detail-carousel-card">${inner}</div>`;
          }).join("")}</div>`
        : section.kind === "gallery"
        ? `<div class="detail-gallery">${items.map((entry, entryIndex) => {
            const image = safeImage(item?.localImageData?.[`cachedDetails.sections.${sectionIndex}.items.${entryIndex}.image`] || entry.image || entry.url);
            return image ? imageButton(image, entry.title || "Screenshot", `<span class="detail-gallery-art"><img src="${esc(image)}" alt="${esc(entry.title || "Source image")}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.closest('.detail-gallery-image')?.removeAttribute('data-detail-image-src');this.closest('.detail-gallery-image')?.setAttribute('aria-disabled','true')"><i data-lucide="image" aria-hidden="true" hidden></i></span><span>${esc(entry.title || "")}</span>`, "detail-gallery-image") : "";
          }).join("")}</div>`
        : `<div class="detail-source-list">${items.map((entry, entryIndex) => {
            const href = safeUrl(entry.url);
            const image = safeImage(item?.localImageData?.[`cachedDetails.sections.${sectionIndex}.items.${entryIndex}.image`] || entry.image);
            const title = esc(entry.title || "Untitled");
            const episodeId = String(entry.id ?? entry.title ?? "");
            const watched = watchedIds.has(episodeId);
            const toggle = section.kind === "episodes" && canToggleEpisodes
              ? `<button class="episode-toggle ${watched ? "is-watched" : ""}" type="button" data-episode-toggle data-episode-id="${esc(episodeId)}" data-episode-title="${title}" aria-pressed="${watched}">${watched ? "Watched ✓" : "Mark watched"}</button>`
              : "";
            const thumbnail = image ? imageButton(image, entry.title || "Source image", `<span class="detail-source-art"><img src="${esc(image)}" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.closest('.detail-source-image')?.removeAttribute('data-detail-image-src');this.closest('.detail-source-image')?.setAttribute('aria-disabled','true')"><i data-lucide="image" aria-hidden="true" hidden></i></span>`, "detail-source-image") : "";
            const content = `<div class="detail-source-item">${thumbnail}<div><strong>${title}</strong>${entry.meta ? `<small>${esc(detailValue(entry.meta))}</small>` : ""}${entry.description ? `<p>${esc(entry.description)}</p>` : ""}${href && section.kind !== "episodes" ? `<a class="detail-entry-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>` : ""}${toggle}</div></div>`;
            return content;
          }).join("")}</div>`;
      return section.collapsed
        ? `<details class="detail-section detail-collapsible"><summary><h3>${esc(section.title || "More details")}</h3><span aria-hidden="true">›</span></summary>${body}</details>`
        : `<section class="detail-section"><h3>${esc(section.title || "More details")}</h3>${body}</section>`;
    };

    function renderDetails() {
      const item = detailPreview || items.find(row => row.id === detailItemId);
      if (!item) return detailRestorePending
        ? `<div class="empty-state" role="status"><strong>Checking your library…</strong><p>Opening this game if it’s saved on this device.</p></div>`
        : `<div class="empty-state"><strong>That entry is no longer in your library.</strong><a class="button secondary" href="#dashboard">Go to Home</a></div>`;

      const alreadySaved = detailPreview && items.find(row => row.category === item.category && String(row.title || "").trim().toLocaleLowerCase() === String(item.title || "").trim().toLocaleLowerCase());
      const source = window.SplitAppMetadata.providers.find(row => row.key === (item.metadataSource || item.source));
      const loaded = detailData || {};
      const image = safeImage(item.localThumbnailData || item.localImageData?.["image"] || item.localImageData?.["cachedDetails.portraitImage"] || item.localImageData?.["cachedDetails.image"] || loaded.portraitImage || loaded.image || item.image);
      const landscape = safeImage(item.localImageData?.["cachedDetails.landscapeImage"] || item.localImageData?.["cachedDetails.backgroundImage"] || loaded.landscapeImage || loaded.backgroundImage);
      const summary = loaded.description || item.description || item.summary || "No description is available for this entry yet.";
      const sourceUrl = safeUrl(loaded.url || item.url || item.providerUrl);
      const goal = Math.max(0, Number(loaded.goal || item.goal) || 0);
      const progress = Math.max(0, Number(item.progress) || 0);
      const percent = goal ? Math.max(0, Math.min(100, Math.round(progress / goal * 100))) : 0;
      const unit = category(item.category)?.unit || "";
      const facts = [
        ["Year", loaded.year || item.year],
        ["Rating", loaded.rating || item.rating ? `★ ${loaded.rating || item.rating}` : ""]
      ].filter(([, value]) => value !== "" && value !== undefined && value !== null);
      const fields = (loaded.fields || []).filter(row => row && row.value !== "" && row.value != null);
      const links = (loaded.links || []).map(link => ({ ...link, href: safeUrl(link.url) })).filter(link => link.href);
      const sections = (loaded.sections || []).filter(section => section && section.items?.length);
      const canProgress = !detailPreview;
      const popupImageButton = (src, label, content, className = "") => src
        ? `<button type="button" class="detail-image-trigger ${className}" data-detail-image-src="${esc(src)}" data-detail-image-label="${esc(label)}" aria-label="View ${esc(label)}">${content}</button>`
        : "";
      const detailImage = popupImageButton(image, `${item.title} cover`, `<img class="detail-image" src="${esc(image)}" alt="${esc(item.title)} cover" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.closest('.detail-cover-trigger')?.removeAttribute('data-detail-image-src');this.closest('.detail-cover-trigger')?.setAttribute('aria-disabled','true');this.closest('.detail-hero')?.classList.add('no-hero-art')"><span class="detail-cover-placeholder" aria-hidden="true" hidden>${esc(category(item.category)?.icon || "✦")}</span>`, "detail-cover-trigger");
      const buySub = [fields.find(row => /developer/i.test(row.label))?.value, loaded.year || item.year].filter(Boolean).map(detailValue).join(" • ");
      const purchase = loaded.purchase && safeUrl(loaded.purchase.url)
        ? `<div class="ios-buy"><div class="ios-buy-copy"><p>${loaded.purchase.isFree ? "Play" : "Buy"} ${esc(item.title)} <span>on Steam</span></p>${buySub ? `<small>${esc(buySub)}</small>` : ""}</div><strong>${esc(loaded.purchase.price || "")}</strong><a class="button primary" href="${esc(loaded.purchase.url)}" target="_blank" rel="noopener noreferrer">${loaded.purchase.isFree ? "Play on Steam" : "Buy on Steam"}</a></div>`
        : "";
      const statuses = category(item.category)?.statuses || [];
      const maxRating = prefs?.ratingFormat === "10-point" ? 10 : 5;
      const ratingControl = maxRating === 5
        ? `<div class="detail-rating-stars" role="group" aria-label="Rate this game from 1 to 5">${Array.from({ length: 5 }, (_, index) => { const score = index + 1; const active = score <= Number(item.rating); return `<button type="button" data-detail-rating="${score}" aria-label="Rate ${score} out of 5" aria-pressed="${Number(item.rating) === score}"><i data-lucide="star" class="${active ? "active" : ""}" aria-hidden="true"></i></button>`; }).join("")}</div>`
        : `<label class="detail-rating-select"><span>Rating</span><span class="detail-select-wrap"><select data-detail-rating-select aria-label="Rating"><option value="0">No rating</option>${Array.from({ length: 10 }, (_, index) => `<option value="${index + 1}" ${Number(item.rating) === index + 1 ? "selected" : ""}>${index + 1} / 10</option>`).join("")}</select><i data-lucide="chevron-down" aria-hidden="true"></i></span></label>`;

      const watchedSet = new Set((item.watchedEpisodeIds || []).map(String));
      const indexedSections = sections.map((section, index) => ({ section, index })), taken = new Set();
      const takeSlot = pattern => indexedSections.filter(({ section, index }) => !taken.has(index) && pattern.test(section.title || "") && taken.add(index));
      const slots = { media: takeSlot(/^(screenshots|trailers)/i), achievements: takeSlot(/^achievements/i), series: takeSlot(/^(same series|editions)/i), team: takeSlot(/^development team/i) };
      slots.other = indexedSections.filter(({ index }) => !taken.has(index));
      const renderRows = rows => rows.map(({ section, index }) => renderSection(section, watchedSet, canProgress, item, index, popupImageButton)).join("");
      const part = {
        tracking: canProgress ? `<section class="detail-section detail-tracking-section"><h3>Tracking &amp; Rating</h3>${detailEditMode ? "" : `<span class="ios-sub">Status</span><div class="ios-pills detail-status-pills" role="group" aria-label="Game status">${statuses.map(status => `<button type="button" class="ios-pill${status === item.status ? " active" : ""}" data-detail-status-btn="${esc(status)}" aria-pressed="${status === item.status}">${esc(status)}</button>`).join("")}</div>`}<div class="detail-tracking-row"><span>My Rating</span>${ratingControl}</div></section><dialog class="choice-dialog detail-delete-dialog" id="detail-delete-dialog"><form method="dialog"><div class="choice-dialog-grabber"></div><h2>Delete ${esc(item.title)}?</h2><p>This removes the game from your collection.</p><footer class="choice-dialog-actions"><button type="button" class="button secondary" data-detail-delete-cancel>Cancel</button><button type="button" class="button primary" data-detail-delete-confirm>Delete</button></footer></form></dialog>` : "",
        media: renderRows(slots.media),
        stores: (loaded.stores || []).length ? `<section class="detail-section detail-stores"><h3>Where to buy</h3><div class="detail-store-list">${loaded.stores.map(row => safeUrl(row.url) ? `<a class="button secondary small" href="${esc(safeUrl(row.url))}" target="_blank" rel="noopener noreferrer">${esc(row.name)} ↗</a>` : "").join("")}</div></section>` : "",
        tags: (loaded.tags || []).length ? `<section class="detail-section"><h3>Tags</h3><div class="detail-chips">${loaded.tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div></section>` : "",
        ratings: (loaded.ratingBreakdown || []).length ? `<section class="detail-section detail-rating-breakdown"><h3>Player ratings${loaded.ratingCount ? ` · ${Number(loaded.ratingCount).toLocaleString()}` : ""}</h3><div class="rating-bar" role="img" aria-label="${esc(loaded.ratingBreakdown.map(row => `${row.label} ${row.percent}%`).join(", "))}">${loaded.ratingBreakdown.map((row, index) => `<span class="rating-seg rating-seg-${index % 4}" style="width:${Math.max(2, Number(row.percent) || 0)}%"></span>`).join("")}</div><div class="rating-legend">${loaded.ratingBreakdown.map((row, index) => `<span><i class="rating-seg-${index % 4}"></i>${esc(row.label)} <b>${esc(row.percent)}%</b></span>`).join("")}</div></section>` : "",
        facts: facts.length || fields.length ? `<section class="detail-section"><h3>Details</h3><div class="detail-facts">${facts.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(detailValue(value))}</strong></div>`).join("")}${fields.map(row => `<div><span>${esc(row.label)}</span><strong>${esc(detailValue(row.value))}</strong></div>`).join("")}</div></section>` : "",
        requirements: loaded.requirements ? (() => {
          const { minimum = [], recommended = [] } = loaded.requirements;
          const labels = [...new Set([...minimum, ...recommended].map(([label]) => label))];
          const get = (rows, label) => rows.find(([key]) => key === label)?.[1] || "";
          const both = minimum.length && recommended.length;
          return `<section class="detail-section detail-requirements"><h3>System requirements</h3><div class="detail-table-wrap"><table class="detail-table req-table"><thead><tr><th scope="col"></th>${minimum.length ? "<th scope=\"col\">Minimum</th>" : ""}${recommended.length ? "<th scope=\"col\">Recommended</th>" : ""}</tr></thead><tbody>${labels.map(label => `<tr><th scope="row">${esc(label)}</th>${minimum.length ? `<td>${esc(get(minimum, label)) || "—"}</td>` : ""}${recommended.length ? `<td>${esc(get(recommended, label)) || "—"}</td>` : ""}</tr>`).join("")}</tbody></table></div>${both ? "" : ""}</section>`;
        })() : "",
        achievements: renderRows(slots.achievements),
        languages: (loaded.languages || []).length ? `<details class="detail-section detail-collapsible detail-languages"><summary><h3>Languages (${loaded.languages.length})</h3><span aria-hidden="true">›</span></summary><div class="detail-table-wrap"><table class="detail-table lang-table"><thead><tr><th scope="col">Language</th><th scope="col">Interface</th><th scope="col">Full audio</th></tr></thead><tbody>${loaded.languages.map(row => `<tr><th scope="row">${esc(row.name)}</th><td class="lang-yes">✓</td><td class="${row.audio ? "lang-yes" : "lang-no"}">${row.audio ? "✓" : "—"}</td></tr>`).join("")}</tbody></table></div></details>` : "",
        links: links.length ? `<section class="detail-section"><h3>Links</h3><div class="detail-link-list">${links.map(link => `<a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label || link.title || link.site || link.href)} ↗</a>`).join("")}</div></section>` : "",
        series: renderRows(slots.series),
        team: renderRows(slots.team),
        other: renderRows(slots.other),
        overview: `<section class="detail-section"><h3>Overview</h3><p class="detail-description">${esc(summary)}</p></section>`
      };
      const hasRatings = (loaded.ratingBreakdown || []).length > 0, hasAchievements = slots.achievements.length > 0, hasTeam = slots.team.length + slots.series.length > 0;
      let detailBody;
      if (hasRatings || hasAchievements || hasTeam) {
        const tabs = [["overview", "Overview"], hasRatings && ["ratings", "Ratings"], hasAchievements && ["achievements", "Achievements"], hasTeam && ["team", "Team & series"]].filter(Boolean);
        const activeTab = tabs.some(([key]) => key === context.detailTab) ? context.detailTab : tabs[0][0];
        const panel = (key, html) => `<div class="detail-tab-panel" id="detail-panel-${key}" role="tabpanel" aria-labelledby="detail-tab-${key}" tabindex="0" data-detail-panel="${key}"${activeTab === key ? "" : " hidden"}>${html}</div>`;
        detailBody = `<div class="detail-tabs" role="tablist" aria-label="Game information">${tabs.map(([key, label]) => `<button type="button" id="detail-tab-${key}" role="tab" class="${activeTab === key ? "active" : ""}" aria-selected="${activeTab === key}" aria-controls="detail-panel-${key}" tabindex="${activeTab === key ? "0" : "-1"}" data-detail-tab="${key}">${label}</button>`).join("")}</div>`
          + panel("overview", [part.tracking, part.media, part.overview, part.stores, part.tags, part.facts, part.requirements, part.languages, part.other, part.links].join(""))
          + (hasRatings ? panel("ratings", part.ratings) : "")
          + (hasAchievements ? panel("achievements", part.achievements) : "")
          + (hasTeam ? panel("team", part.team + part.series) : "");
      } else {
        detailBody = [part.tracking, part.media, part.overview, part.stores, part.tags, part.ratings, part.facts, part.requirements, part.achievements, part.languages, part.links, part.series, part.team, part.other].join("");
      }
      return `<div class="detail-page">
        <header class="detail-page-heading"><button type="button" class="detail-back" data-go="${esc(detailReturnPage)}"><span aria-hidden="true">‹</span> Back</button><span class="detail-heading-spacer" aria-hidden="true"></span>${detailPreview ? `<span class="detail-heading-actions">${alreadySaved ? `<button type="button" class="button secondary small detail-preview-add" data-action="open-saved-entry" data-id="${esc(alreadySaved.id)}"><i data-lucide="check" aria-hidden="true"></i><span>In library · Open</span></button>` : `<button type="button" class="button primary small detail-preview-add" data-action="save-detail-item"><i data-lucide="plus" aria-hidden="true"></i><span>Add to library</span></button>`}</span>` : detailEditMode ? `<span class="detail-heading-actions detail-edit-actions"><button type="button" class="button secondary small" data-action="cancel-detail-edit">Cancel</button><button type="button" class="button primary small" data-detail-save>Save</button></span>` : `<span class="detail-heading-actions"><button type="button" class="detail-icon-button" data-action="edit" data-id="${esc(item.id)}" aria-label="Edit entry" title="Edit entry"><i data-lucide="pencil"></i></button><button type="button" class="detail-delete-button" data-action="delete-detail" data-id="${esc(item.id)}" aria-label="Delete from collection" title="Delete from collection"><i data-lucide="trash2"></i></button></span>`}</header>
        <article class="detail-hero ios-hero${landscape || image ? "" : " no-hero-art"}">
          <div class="ios-hero-bg"${(landscape || image) ? ` style="background-image:url('${esc(landscape || image)}')"` : ""}></div>
          <div class="ios-hero-body">
            ${image ? detailImage : `<div class="detail-image-placeholder">${esc(category(item.category)?.icon || "✦")}</div>`}
            <div class="detail-hero-copy">
              <p class="eyebrow">${esc(item.metadataSource === "mix" ? `Mix · ${(loaded.mixSources || []).join(" + ") || "all sources"}` : source?.name || item.metadataSource || "SAVEPOINT")}${source ? ` • ${esc(source.categories.map(labelCategory).join(" / "))}` : ""}</p>
              <h2>${esc(canProgress ? item.title : (loaded.title || item.title))}</h2>
              <div class="detail-badges">${canProgress ? `<span class="ios-status-badge">${esc(item.status)}</span>` : ""}${facts.slice(0, 3).map(([label, value]) => `<span>${esc(label === "Rating" ? value : detailValue(value))}</span>`).join("")}${loaded.badge ? `<span class="detail-age-badge">${esc(loaded.badge)}</span>` : ""}${sourceUrl ? `<a class="detail-source-link" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source page ↗</a>` : ""}</div>
            </div>
          </div>
          ${purchase}
        </article>
        ${detailLoading ? `<p class="app-info detail-loading">Loading full details from ${esc(source?.name || "the metadata source")}…</p>` : ""}
        ${detailError ? `<div class="detail-error"><p>${esc(detailError)}</p><button class="button secondary small" data-action="refresh-details">Try again</button></div>` : ""}
        ${canProgress && detailEditMode ? `<form id="detail-edit-form" class="detail-edit-form"><label>Title<input name="title" required maxlength="180" value="${esc(item.title)}"></label><label>Status<span class="detail-select-wrap"><select name="status">${statuses.map(status => `<option value="${esc(status)}" ${status === item.status ? "selected" : ""}>${esc(status)}</option>`).join("")}</select><i data-lucide="chevron-down" aria-hidden="true"></i></span></label><div class="detail-edit-numbers"><label>Progress<input name="progress" type="number" min="0" step="${esc(prefs.progressIncrement || 1)}" value="${progress}"></label><label>Goal<input name="goal" type="number" min="0" step="1" value="${goal}"></label></div></form>` : ""}
        ${canProgress && !detailEditMode ? `<section class="detail-progress-card"><div class="ios-progress-head"><div><span>Playtime &amp; Goal</span><strong>${progress}${goal ? `<small> / ${goal} ${esc(unit || "hrs")} goal</small>` : ""}</strong></div><div class="ios-stepper"><button type="button" data-adjust-progress="-1">-1h</button><button type="button" class="accent" data-adjust-progress="1">+1h</button><button type="button" data-adjust-progress="5">+5h</button></div></div><div class="progress-line"><span style="width:${percent}%"></span></div><small>${goal ? `${percent}% of completion goal • Tap +1h to log a quick session` : "Edit entry to set a goal and track completion."}</small></section>` : ""}
        <div class="detail-content-layout">${detailBody}</div>
        <dialog class="detail-image-modal" id="detail-image-modal" aria-label="Image viewer">
          <header class="detail-image-modal-toolbar"><span class="detail-image-counter" data-detail-image-counter aria-live="polite"></span><div class="detail-image-toolbar-actions"><button type="button" data-detail-image-download aria-label="Download image" title="Download"><i data-lucide="download" aria-hidden="true"></i></button><button type="button" data-detail-image-copy aria-label="Copy image" title="Copy"><i data-lucide="copy" aria-hidden="true"></i></button><button type="button" data-detail-image-share aria-label="Share image" title="Share"><i data-lucide="share-2" aria-hidden="true"></i></button><button type="button" class="detail-image-modal-close" data-detail-image-close aria-label="Close image viewer" title="Close"><i data-lucide="x" aria-hidden="true"></i></button></div></header>
          <button type="button" class="detail-image-modal-nav detail-image-modal-prev" data-detail-image-prev aria-label="Previous image"><i data-lucide="chevron-left" aria-hidden="true"></i></button>
          <figure><span class="detail-image-stage"><span class="detail-image-status" data-detail-image-status role="status">Loading image…</span><img data-detail-modal-img alt=""></span><figcaption data-detail-modal-caption></figcaption></figure>
          <button type="button" class="detail-image-modal-nav detail-image-modal-next" data-detail-image-next aria-label="Next image"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
          <p class="detail-image-modal-hint" data-detail-image-hint>Swipe to browse</p>
        </dialog>
      </div>`;
    }

    return renderDetails();
  };
})();
