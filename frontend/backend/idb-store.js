// IndexedDB store for the library. One record per game, written incrementally,
// so a save touches only changed games instead of rewriting one huge JSON blob
// into localStorage (5 MB cap, synchronous, blocks the UI thread).
(root => {
  const DB_NAME = "savepoint_library", VERSION = 3;
  let dbPromise = null;
  // Keep compact signatures instead of a second full JSON copy of every game.
  // With 10k records the old cache duplicated the complete library in JS heap.
  const known = new Map(); // id -> compact content fingerprint
  function signature(value) {
    const json = JSON.stringify(value);
    let first = 0x811c9dc5, second = 0x9e3779b9;
    for (let index = 0; index < json.length; index++) {
      const code = json.charCodeAt(index);
      first = Math.imul(first ^ code, 0x01000193);
      second = Math.imul(second ^ (code + index), 0x85ebca6b);
    }
    return `${json.length}:${(first >>> 0).toString(16)}${(second >>> 0).toString(16)}`;
  }

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!root.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("items")) {
          const items = db.createObjectStore("items", { keyPath: "id" });
          items.createIndex("status", "status");
          items.createIndex("category", "category");
          items.createIndex("updatedAt", "updatedAt");
          items.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
        // Device-local artwork cache: one small Blob per game/artwork kind, read in one fast batch.
        const thumbs = db.objectStoreNames.contains("thumbs") ? request.transaction.objectStore("thumbs") : db.createObjectStore("thumbs", { keyPath: "key" });
        if (!thumbs.indexNames.contains("at")) {
          thumbs.createIndex("at", "at");
          // Existing v2 artwork has no age field, so an index upgrade alone
          // would leave those rows invisible to trimThumbs forever.
          const cursorRequest = thumbs.openCursor();
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) return;
            const value = cursor.value;
            if (!Number(value.at)) { value.at = Date.now(); cursor.update(value); }
            cursor.continue();
          };
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    dbPromise.catch(() => { dbPromise = null; });
    return dbPromise;
  }
  const done = tx => new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error); });
  const result = request => new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });

  // Returns { items, history, preferences, empty } or throws when IndexedDB is unusable.
  async function loadAll() {
    const db = await open();
    const tx = db.transaction(["items", "meta"], "readonly");
    const [items, meta] = await Promise.all([result(tx.objectStore("items").getAll()), result(tx.objectStore("meta").get("state"))]);
    known.clear();
    items.forEach(item => known.set(String(item.id), signature(item)));
    return { items, history: meta?.history || [], preferences: meta?.preferences || {}, empty: !items.length && !meta };
  }

  // Writes only games whose content changed and deletes games that are gone.
  async function save({ items, history, preferences }) {
    const db = await open();
    const tx = db.transaction(["items", "meta"], "readwrite");
    const store = tx.objectStore("items");
    const next = new Map();
    for (const item of items) {
      if (item?.id == null) continue;
      const id = String(item.id), snapshot = signature(item);
      next.set(id, snapshot);
      if (known.get(id) !== snapshot) store.put({ ...item, id });
    }
    for (const id of known.keys()) if (!next.has(id)) store.delete(id);
    tx.objectStore("meta").put({ key: "state", history, preferences });
    await done(tx);
    known.clear(); next.forEach((snapshot, id) => known.set(id, snapshot));
  }

  // Touches only the given games (plus the small meta record). No scan of the library.
  async function saveSome({ changed = [], removedIds = [], history, preferences }) {
    const db = await open();
    const tx = db.transaction(["items", "meta"], "readwrite");
    const store = tx.objectStore("items");
    const writes = [];
    for (const item of changed) {
      if (item?.id == null) continue;
      const id = String(item.id), snapshot = signature(item);
      if (known.get(id) === snapshot) continue;
      store.put({ ...item, id }); writes.push([id, snapshot]);
    }
    for (const id of removedIds) { store.delete(String(id)); }
    tx.objectStore("meta").put({ key: "state", history, preferences });
    await done(tx);
    writes.forEach(([id, snapshot]) => known.set(id, snapshot));
    removedIds.forEach(id => known.delete(String(id)));
  }

  // Thumbnail cache. entries: [[key, sig]] -> returns [[key, blob]] for entries whose stored signature still matches.
  async function getThumbs(entries) {
    const db = await open();
    const store = db.transaction("thumbs", "readonly").objectStore("thumbs");
    const rows = await Promise.all(entries.map(([key]) => result(store.get(key)).catch(() => null)));
    const hits = [];
    rows.forEach((row, index) => { if (row?.blob && row.sig === entries[index][1]) hits.push([row.key, row.blob]); });
    return hits;
  }
  async function putThumbs(entries) {
    if (!entries.length) return;
    const db = await open();
    const tx = db.transaction("thumbs", "readwrite");
    const store = tx.objectStore("thumbs");
    const at = Date.now();
    entries.forEach(([key, sig, blob]) => store.put({ key, sig, blob, at }));
    await done(tx);
  }
  // Which artwork is already cached ([[key, sig]]), so background fill only touches what is missing.
  async function listThumbKeys() {
    const db = await open();
    const store = db.transaction("thumbs", "readonly").objectStore("thumbs");
    return new Promise((resolve, reject) => {
      const rows = [], request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) { resolve(rows); return; }
        rows.push([cursor.key, cursor.value.sig]);
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });
  }
  async function trimThumbs(maxEntries = 0) {
    const max = Math.max(0, Number(maxEntries) || 0);
    if (!max) return 0;
    const db = await open(), tx = db.transaction("thumbs", "readwrite"), store = tx.objectStore("thumbs");
    let count = await result(store.count()), removed = 0;
    if (count <= max) { await done(tx); return removed; }
    await new Promise((resolve, reject) => {
      const request = store.index("at").openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || count <= max) { resolve(); return; }
        cursor.delete(); count--; removed++; cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });
    await done(tx);
    return removed;
  }
  async function clearThumbs() {
    const db = await open(), tx = db.transaction("thumbs", "readwrite");
    tx.objectStore("thumbs").clear(); await done(tx);
  }

  const core = Object.freeze({ open, loadAll, save, saveSome, getThumbs, putThumbs, listThumbKeys, trimThumbs, clearThumbs });
  root.SplitAppIDBCore = core;
  if (typeof window === "undefined") return; // inside the data worker: expose the core only

  // On the page, every call goes to the data worker so diffing, serialising and IndexedDB
  // transactions never block scrolling. If workers are unavailable, use the core in-thread.
  let worker = null, nextId = 1, usable = typeof Worker === "function";
  const pending = new Map();
  function ensureWorker() {
    if (!usable) return null;
    if (worker) return worker;
    try {
      worker = new Worker("backend/data-worker.js");
      worker.onmessage = event => {
        const { id, ok, result, error } = event.data || {};
        const job = pending.get(id); if (!job) return;
        pending.delete(id);
        if (ok) job.resolve(result); else job.reject(new Error(error || "Data worker failed"));
      };
      worker.onerror = () => {
        // Worker could not start (e.g. file:// preview): retry every pending call in-thread.
        usable = false; worker = null;
        const jobs = [...pending.values()]; pending.clear();
        jobs.forEach(job => (job.op === "merge" ? Promise.resolve().then(() => root.SplitAppMixMerge.merge(...job.args)) : core[job.op](...job.args)).then(job.resolve, job.reject));
      };
    } catch (_) { usable = false; worker = null; }
    return worker;
  }
  function call(op, ...args) {
    const target = ensureWorker();
    if (!target) return core[op](...args);
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject, op, args });
      target.postMessage({ id, op, args });
    });
  }
  root.SplitAppIDB = Object.freeze({
    open: () => call("open").then(() => undefined),
    loadAll: () => call("loadAll"),
    save: data => call("save", data),
    saveSome: data => call("saveSome", data),
    getThumbs: entries => call("getThumbs", entries),
    putThumbs: entries => call("putThumbs", entries),
    listThumbKeys: () => call("listThumbKeys"),
    trimThumbs: max => call("trimThumbs", max),
    clearThumbs: () => call("clearThumbs"),
    // Merge several sources' details off the main thread (used by background sync).
    merge: (entries, title, item) => {
      const target = ensureWorker();
      if (!target) return Promise.resolve(root.SplitAppMixMerge.merge(entries, title, item));
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject, op: "merge", args: [entries, title, item] });
        target.postMessage({ id, op: "merge", args: [entries, title, item] });
      });
    }
  });
})(self);
