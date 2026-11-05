// Share a Home group as images that look like the Home list (cover, title, subtitle, rating, status).
(() => {
  const PER_PAGE = 15, LONG_CHUNK = 45, W = 1080, ROW = 176, HEAD = 200, FOOT = 84, PAD = 40;
  const native = () => window.Capacitor?.Plugins?.ShareIntent;
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const fit = (ctx, text, max) => {
    let value = String(text || "");
    if (ctx.measureText(value).width <= max) return value;
    while (value.length > 1 && ctx.measureText(value + "…").width > max) value = value.slice(0, -1);
    return value.trimEnd() + "…";
  };
  const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const loadImage = url => new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = url; });
  const statusColor = status => { const key = String(status || "").toLowerCase().replace(/\s+/g, "-"); return css(`--status-color-${key}`) || css("--accent") || "#6355f5"; };

  // Covers load once per game; a slow cover keeps loading in the background and is reused by the next draw.
  const coverJobs = new Map();
  const coverOf = (entry, getImage) => { if (!coverJobs.has(entry.id)) coverJobs.set(entry.id, getImage(entry).catch(() => null)); return coverJobs.get(entry.id); };
  const waitFor = (promise, ms) => Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(undefined), ms))]);
  async function drawSheet({ title, entries, start, total, page, pages, showHead, getImage }) {
    const jobs = entries.map(entry => coverOf(entry, getImage));
    let images = await Promise.all(jobs.map(job => waitFor(job, 4000)));
    // Give covers that are only slow (not failed) one longer chance so a big list doesn't end up with blanks.
    if (images.some(img => img === undefined)) images = await Promise.all(jobs.map((job, i) => images[i] === undefined ? waitFor(job, 9000) : images[i]));
    const missing = images.filter(img => img === undefined).length;
    images = images.map(img => img || null);
    const head = showHead ? HEAD : 24, rows = entries.length;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = head + rows * ROW + FOOT;
    const ctx = canvas.getContext("2d");
    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    const accent = css("--accent") || "#6355f5";
    ctx.fillStyle = "#f2f3f9"; ctx.fillRect(0, 0, W, canvas.height);
    if (showHead) {
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, HEAD);
      ctx.fillStyle = "#fff"; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
      ctx.font = `800 64px ${font}`; ctx.fillText(fit(ctx, title, W - PAD * 2), PAD, 96);
      ctx.globalAlpha = .85; ctx.font = `600 34px ${font}`;
      ctx.fillText(`${total} ${total === 1 ? "game" : "games"}${pages > 1 ? ` · page ${page} of ${pages}` : ""}`, PAD, 150); ctx.globalAlpha = 1;
    }
    // One white card holding the rows, like the Home list.
    ctx.fillStyle = "#fff"; roundRect(ctx, 20, head, W - 40, rows * ROW, 28); ctx.fill();
    entries.forEach((entry, index) => {
      const y = head + index * ROW, art = { x: 44, y: y + 18, w: 108, h: ROW - 36 };
      if (index) { ctx.fillStyle = "#e8eaf2"; ctx.fillRect(176, y, W - 216, 2); }
      ctx.save(); roundRect(ctx, art.x, art.y, art.w, art.h, 16); ctx.clip();
      const img = images[index];
      if (img) {
        const scale = Math.max(art.w / img.width, art.h / img.height), dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, art.x + (art.w - dw) / 2, art.y + (art.h - dh) / 2, dw, dh);
      } else { ctx.fillStyle = "#dff1ea"; ctx.fillRect(art.x, art.y, art.w, art.h); ctx.fillStyle = "#4b8f78"; ctx.font = `700 40px ${font}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🎮", art.x + art.w / 2, art.y + art.h / 2); }
      ctx.restore();
      const tx = 176, maxW = W - tx - 48;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#1c2030"; ctx.font = `700 38px ${font}`; ctx.fillText(fit(ctx, entry.title, maxW), tx, y + 62);
      ctx.fillStyle = "#7a8094"; ctx.font = `500 27px ${font}`; if (entry.subtitle) ctx.fillText(fit(ctx, entry.subtitle, maxW), tx, y + 100);
      let px = tx; const py = y + 118, ph = 38;
      const pill = (text, bg, fg) => { ctx.font = `700 24px ${font}`; const w = ctx.measureText(text).width + 32; ctx.fillStyle = bg; roundRect(ctx, px, py, w, ph, 12); ctx.fill(); ctx.fillStyle = fg; ctx.textBaseline = "middle"; ctx.fillText(text, px + 16, py + ph / 2 + 1); ctx.textBaseline = "alphabetic"; px += w + 12; };
      if (entry.rating) pill(entry.rating, "#fdf0d5", "#a8690a");
      if (entry.status) { const c = statusColor(entry.status); pill(entry.status, c + "26", c); }
    });
    ctx.textBaseline = "middle"; ctx.fillStyle = "#8a90a2"; ctx.font = `600 26px ${font}`; ctx.textAlign = "left";
    ctx.fillText("Shared from SavePoint", PAD, head + rows * ROW + FOOT / 2);
    if (pages > 1) { ctx.textAlign = "right"; ctx.fillText(`${page} / ${pages}`, W - PAD, head + rows * ROW + FOOT / 2); }
    const url = encode(canvas);
    return { url, complete: missing === 0 };
  }
  // The Android bridge gets very slow with payloads above ~250 KB, so keep the encoded image small.
  function encode(canvas) {
    const LIMIT = 235000;
    let source = canvas, quality = .86, url = source.toDataURL("image/jpeg", quality);
    for (let guard = 0; url.length > LIMIT && guard < 12; guard++) {
      if (quality > .7) quality -= .1;
      else { const next = document.createElement("canvas"); next.width = Math.round(source.width * .85); next.height = Math.round(source.height * .85); next.getContext("2d").drawImage(source, 0, 0, next.width, next.height); source = next; }
      url = source.toDataURL("image/jpeg", quality);
    }
    return url;
  }
  const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));
  const buildImages = (entries, mode) => { const size = mode === "pages" ? PER_PAGE : LONG_CHUNK, groups = chunk(entries, size); return groups.map((group, index) => ({ group, index, pages: groups.length, start: index * size })); };
  const slug = value => String(value).normalize("NFKD").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "savepoint";

  async function saveImage(dataUrl, name) {
    const plugin = native();
    if (plugin?.downloadImage) { const r = await plugin.downloadImage({ src: dataUrl, filename: name, title: name }); return r?.location || "Downloads"; }
    const a = document.createElement("a"); a.href = dataUrl; a.download = `${name}.jpg`; document.body.appendChild(a); a.click(); a.remove(); return "your device";
  }
  async function shareImage(dataUrl, name) {
    const plugin = native();
    if (plugin?.shareImage) return plugin.shareImage({ src: dataUrl, filename: name, title: name });
    const blob = await (await fetch(dataUrl)).blob(), file = new File([blob], `${name}.jpg`, { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) return navigator.share({ files: [file], title: name });
    throw new Error("Sharing images isn't available here — use Save instead.");
  }

  function open({ title, entries, getImage }, { showPopup, closePopup, toast, esc, cacheGet, cachePut }) {
    document.getElementById("share-dialog")?.remove();
    coverJobs.clear();
    const dialog = document.createElement("dialog");
    dialog.id = "share-dialog"; dialog.className = "choice-dialog share-dialog";
    let mode = "pages", page = 0, images = [], cache = new Map(), token = 0;
    const count = entries.length;
    dialog.innerHTML = `<div class="choice-dialog-grabber"></div><header class="choice-dialog-header"><div><p class="settings-overline">SHARE</p><h2>${esc(title)} · ${count}</h2></div><button class="choice-dialog-close" type="button" data-share-close aria-label="Close">×</button></header>
      <div class="share-body"><div class="share-modes" role="group"><button type="button" class="active" data-share-mode="pages">Pages · ${PER_PAGE} games each</button><button type="button" data-share-mode="long">One long picture</button></div>
      <div class="share-preview" data-share-preview><span class="share-loading">Preparing…</span></div>
      <div class="share-pager" data-share-pager><button type="button" data-share-prev aria-label="Previous page">‹</button><span data-share-page></span><button type="button" data-share-next aria-label="Next page">›</button></div></div>
      <footer class="share-footer"><p class="share-status" data-share-status role="status" aria-live="polite" hidden></p><div class="share-actions"><button type="button" class="button secondary" data-share-save>Save</button><button type="button" class="button primary" data-share-send>Share</button></div><button type="button" class="button ghost share-save-all" data-share-save-all hidden>Save all pages</button></footer>`;
    document.body.appendChild(dialog);
    const q = sel => dialog.querySelector(sel);
    // Rendered pages live in IndexedDB (keyed by the page's content), so reopening a group is instant.
    const hash = text => { let h = 5381; for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
    const blobToDataUrl = blob => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(blob); });
    const pageSig = d => "v3:" + hash(JSON.stringify([title, count, d.index, d.pages, d.group.map(e => [e.id, e.title, e.subtitle, e.rating, e.status])]));
    const render = index => {
      const key = `${mode}:${index}`;
      if (!cache.has(key)) {
        const d = images[index], idbKey = `share:${slug(title)}:${mode}:${index}`, sig = pageSig(d);
        cache.set(key, (async () => {
          try { const blob = cacheGet && await cacheGet(idbKey, sig); if (blob) return await blobToDataUrl(blob); } catch (_) {}
          const { url, complete } = await drawSheet({ title, entries: d.group, start: d.start, total: count, page: index + 1, pages: d.pages, showHead: index === 0, getImage });
          // Only complete pages are stored; a page with missing covers is redrawn next time.
          if (!complete) cache.delete(key); else { try { if (cachePut) cachePut(idbKey, sig, await (await fetch(url)).blob()); } catch (_) {} }
          return url;
        })());
      }
      return cache.get(key);
    };
    const prefetch = index => { if (index >= 0 && index < images.length) setTimeout(() => { if (dialog.isConnected) render(index); }, 400); };
    const paint = async () => {
      const mine = ++token;
      page = Math.min(page, images.length - 1);
      const preview = q("[data-share-preview]");
      preview.innerHTML = `<span class="share-loading">Preparing…</span>`;
      q("[data-share-page]").textContent = images.length > 1 ? `${page + 1} / ${images.length}` : "1 image";
      q("[data-share-prev]").disabled = page === 0; q("[data-share-next]").disabled = page >= images.length - 1;
      q("[data-share-pager]").hidden = images.length < 2;
      const all = q("[data-share-save-all]"); all.hidden = images.length < 2; all.textContent = `Save all ${images.length} images`;
      const url = await render(page);
      if (mine === token) { preview.innerHTML = `<img alt="Preview of ${esc(title)}" src="${url}">`; prefetch(page + 1); }
    };
    const setMode = next => {
      mode = next; page = 0; cache = new Map(); images = buildImages(entries, mode);
      dialog.querySelectorAll("[data-share-mode]").forEach(b => b.classList.toggle("active", b.dataset.shareMode === mode));
      paint();
    };
    const fileName = index => `${slug(title)}-${mode === "pages" ? "page" : "part"}-${index + 1}`;
    const say = (text, tone = "") => { const el = q("[data-share-status]"); el.hidden = !text; el.textContent = text; el.dataset.tone = tone; };
    const busy = on => dialog.querySelectorAll(".share-footer button").forEach(b => { b.disabled = on; });
    const guard = async (fn, ok, working = "Working…") => {
      say(working, "busy"); busy(true);
      try { const r = await fn(); say(ok ? ok(r) : "", "ok"); if (ok) toast(ok(r)); }
      catch (e) { if (/cancel|abort/i.test(String(e?.message || e?.name || ""))) say(""); else say(e?.message || "Could not complete that.", "error"); }
      finally { busy(false); }
    };
    dialog.addEventListener("click", event => {
      const t = event.target;
      if (t === dialog || t.closest("[data-share-close]")) return closePopup(dialog);
      const m = t.closest("[data-share-mode]"); if (m) return setMode(m.dataset.shareMode);
      if (t.closest("[data-share-prev]")) { page = Math.max(0, page - 1); return paint(); }
      if (t.closest("[data-share-next]")) { page = Math.min(images.length - 1, page + 1); return paint(); }
      if (t.closest("[data-share-save]")) return guard(async () => saveImage(await render(page), fileName(page)), r => `Saved to ${r}.`, "Saving…");
      if (t.closest("[data-share-send]")) return guard(async () => shareImage(await render(page), fileName(page)), null, "Opening share…");
      if (t.closest("[data-share-save-all]")) return guard(async () => { let ahead = render(0); for (let i = 0; i < images.length; i++) { const url = await ahead; ahead = i + 1 < images.length ? render(i + 1) : null; await saveImage(url, fileName(i)); } return images.length; }, n => `Saved ${n} images to Downloads.`, "Saving all images…");
    });
    dialog.addEventListener("close", () => setTimeout(() => dialog.remove(), 300));
    showPopup(dialog);
    setTimeout(() => setMode("pages"), 30);
    // Warm the remaining covers a few at a time so later pages are ready.
    (async () => { const queue = entries.slice(PER_PAGE); const worker = async () => { while (queue.length && dialog.isConnected) { await coverOf(queue.shift(), getImage); } }; await new Promise(r => setTimeout(r, 1500)); await Promise.all([worker(), worker(), worker()]); })();
  }
  window.SplitAppShare = Object.freeze({ open });
})();
