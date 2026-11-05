// Share a Home group: names as text, or as images (pages of 15 names, or one long picture).
(() => {
  const PER_PAGE = 15, LONG_CHUNK = 400, W = 1080, ROW = 72, HEAD = 200, FOOT = 84, PAD = 48;
  const native = () => window.Capacitor?.Plugins?.ShareIntent;
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function drawSheet({ title, names, start, total, page, pages, showHead }) {
    const rows = names.length, head = showHead ? HEAD : 40;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = head + rows * ROW + FOOT;
    const ctx = canvas.getContext("2d");
    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    const accent = css("--accent") || "#6355f5";
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, canvas.height);
    if (showHead) {
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, HEAD);
      ctx.fillStyle = "#fff"; ctx.textBaseline = "alphabetic";
      ctx.font = `800 64px ${font}`; ctx.fillText(fit(ctx, title, W - PAD * 2), PAD, 96);
      ctx.globalAlpha = .85; ctx.font = `600 34px ${font}`;
      ctx.fillText(`${total} ${total === 1 ? "game" : "games"}${pages > 1 ? ` · page ${page} of ${pages}` : ""}`, PAD, 150); ctx.globalAlpha = 1;
    }
    names.forEach((name, index) => {
      const y = head + index * ROW;
      if (index % 2 === 0) { ctx.fillStyle = "#f3f4f8"; ctx.fillRect(0, y, W, ROW); }
      ctx.fillStyle = accent; ctx.font = `700 28px ${font}`; ctx.textBaseline = "middle";
      const num = String(start + index + 1);
      ctx.textAlign = "right"; ctx.fillText(num, PAD + 64, y + ROW / 2); ctx.textAlign = "left";
      ctx.fillStyle = "#1c2030"; ctx.font = `600 34px ${font}`;
      ctx.fillText(fit(ctx, name, W - PAD * 2 - 100), PAD + 96, y + ROW / 2 + 1);
    });
    ctx.textBaseline = "middle"; ctx.fillStyle = "#8a90a2"; ctx.font = `600 26px ${font}`;
    ctx.textAlign = "left"; ctx.fillText("Shared from SavePoint", PAD, head + rows * ROW + FOOT / 2);
    if (pages > 1) { ctx.textAlign = "right"; ctx.fillText(`${page} / ${pages}`, W - PAD, head + rows * ROW + FOOT / 2); }
    return canvas.toDataURL("image/jpeg", .92);
  }
  function fit(ctx, text, max) {
    let value = String(text);
    if (ctx.measureText(value).width <= max) return value;
    while (value.length > 1 && ctx.measureText(value + "…").width > max) value = value.slice(0, -1);
    return value.trimEnd() + "…";
  }
  const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));
  function buildImages(title, names, mode) {
    const size = mode === "pages" ? PER_PAGE : LONG_CHUNK, groups = chunk(names, size);
    return groups.map((group, index) => ({ group, index, pages: groups.length, start: index * size }));
  }
  const dataUrlBlob = url => fetch(url).then(r => r.blob());
  const slug = value => String(value).normalize("NFKD").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "savepoint";

  async function saveImage(dataUrl, name) {
    const plugin = native();
    if (plugin?.downloadImage) { const r = await plugin.downloadImage({ src: dataUrl, filename: name, title: name }); return r?.location || "Downloads"; }
    const a = document.createElement("a"); a.href = dataUrl; a.download = `${name}.jpg`; document.body.appendChild(a); a.click(); a.remove(); return "your device";
  }
  async function shareImage(dataUrl, name) {
    const plugin = native();
    if (plugin?.shareImage) return plugin.shareImage({ src: dataUrl, filename: name, title: name });
    const blob = await dataUrlBlob(dataUrl), file = new File([blob], `${name}.jpg`, { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) return navigator.share({ files: [file], title: name });
    throw new Error("Sharing images isn't available here — use Save instead.");
  }
  async function shareNames(title, names) {
    const text = `${title} (${names.length})\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
    const plugin = native();
    if (plugin?.shareText) return plugin.shareText({ text, title });
    if (navigator.share) return navigator.share({ title, text });
    await navigator.clipboard.writeText(text); return "copied";
  }

  function open({ title, names }, { showPopup, closePopup, toast, esc }) {
    document.getElementById("share-dialog")?.remove();
    const dialog = document.createElement("dialog");
    dialog.id = "share-dialog"; dialog.className = "choice-dialog share-dialog";
    let mode = "pages", page = 0, images = [], cache = new Map();
    const count = names.length;
    dialog.innerHTML = `<div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">SHARE</p><h2>${esc(title)} · ${count}</h2></div><button class="choice-dialog-close" type="button" data-share-close aria-label="Close">×</button></header>
      <div class="share-body"><button type="button" class="share-names-btn" data-share-names><i data-lucide="list" aria-hidden="true"></i><span><strong>Share names only</strong><small>Send the list as text</small></span></button>
      <p class="settings-overline share-label">AS AN IMAGE</p>
      <div class="share-modes" role="group"><button type="button" class="active" data-share-mode="pages">Pages · ${PER_PAGE} names each</button><button type="button" data-share-mode="long">One long picture</button></div>
      <div class="share-preview" data-share-preview><span class="share-loading">Preparing…</span></div>
      <div class="share-pager" data-share-pager><button type="button" data-share-prev aria-label="Previous page">‹</button><span data-share-page></span><button type="button" data-share-next aria-label="Next page">›</button></div>
      <div class="share-actions"><button type="button" class="button secondary" data-share-save>Save</button><button type="button" class="button primary" data-share-send>Share</button></div>
      <button type="button" class="button ghost share-save-all" data-share-save-all hidden>Save all pages</button></div>`;
    document.body.appendChild(dialog);
    window.lucide?.createIcons({ root: dialog, attrs: { "aria-hidden": "true" } });
    const q = sel => dialog.querySelector(sel);
    const render = index => {
      const key = `${mode}:${index}`;
      if (!cache.has(key)) { const d = images[index]; cache.set(key, drawSheet({ title, names: d.group, start: d.start, total: count, page: index + 1, pages: d.pages, showHead: index === 0 })); }
      return cache.get(key);
    };
    const paint = () => {
      page = Math.min(page, images.length - 1);
      const preview = q("[data-share-preview]");
      preview.innerHTML = `<img alt="Preview of ${esc(title)}" src="${render(page)}">`;
      q("[data-share-page]").textContent = images.length > 1 ? `${page + 1} / ${images.length}` : "1 image";
      q("[data-share-prev]").disabled = page === 0; q("[data-share-next]").disabled = page >= images.length - 1;
      q("[data-share-pager]").hidden = images.length < 2;
      q("[data-share-save-all]").hidden = images.length < 2;
      q("[data-share-save-all]").textContent = `Save all ${images.length} images`;
      preview.classList.toggle("is-long", mode === "long");
    };
    const setMode = next => {
      mode = next; page = 0; cache = new Map(); images = buildImages(title, names, mode);
      dialog.querySelectorAll("[data-share-mode]").forEach(b => b.classList.toggle("active", b.dataset.shareMode === mode));
      paint();
    };
    const fileName = index => `${slug(title)}-${mode === "pages" ? "page" : "part"}-${index + 1}`;
    const guard = async (fn, ok) => { try { const r = await fn(); if (ok) toast(ok(r)); } catch (e) { if (!/cancel|abort/i.test(String(e?.message || e?.name || ""))) toast(e?.message || "Could not complete that."); } };
    dialog.addEventListener("click", event => {
      const t = event.target;
      if (t === dialog || t.closest("[data-share-close]")) return closePopup(dialog);
      const m = t.closest("[data-share-mode]"); if (m) return setMode(m.dataset.shareMode);
      if (t.closest("[data-share-prev]")) { page = Math.max(0, page - 1); return paint(); }
      if (t.closest("[data-share-next]")) { page = Math.min(images.length - 1, page + 1); return paint(); }
      if (t.closest("[data-share-names]")) return guard(() => shareNames(title, names), r => r === "copied" ? "Names copied." : "Sharing names…");
      if (t.closest("[data-share-save]")) return guard(() => saveImage(render(page), fileName(page)), r => `Saved to ${r}.`);
      if (t.closest("[data-share-send]")) return guard(() => shareImage(render(page), fileName(page)));
      if (t.closest("[data-share-save-all]")) return guard(async () => { for (let i = 0; i < images.length; i++) await saveImage(render(i), fileName(i)); return images.length; }, n => `Saved ${n} images.`);
    });
    dialog.addEventListener("close", () => setTimeout(() => dialog.remove(), 300));
    showPopup(dialog);
    setTimeout(() => setMode("pages"), 30);
  }
  window.SplitAppShare = Object.freeze({ open });
})();
