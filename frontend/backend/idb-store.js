// IndexedDB store for the library. One record per game, written incrementally,
// so a save touches only changed games instead of rewriting one huge JSON blob
// into localStorage (5 MB cap, synchronous, blocks the UI thread).
(() => {
  const DB_NAME = "savepoint_library", VERSION = 1;
  let dbPromise = null;
  const known = new Map(); // id -> JSON snapshot last written/read

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        const items = db.createObjectStore("items", { keyPath: "id" });
        items.createIndex("status", "status");
        items.createIndex("category", "category");
        items.createIndex("updatedAt", "updatedAt");
        items.createIndex("createdAt", "createdAt");
        db.createObjectStore("meta", { keyPath: "key" });
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
    items.forEach(item => known.set(String(item.id), JSON.stringify(item)));
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
      const id = String(item.id), snapshot = JSON.stringify(item);
      next.set(id, snapshot);
      if (known.get(id) !== snapshot) store.put({ ...item, id });
    }
    for (const id of known.keys()) if (!next.has(id)) store.delete(id);
    tx.objectStore("meta").put({ key: "state", history, preferences });
    await done(tx);
    known.clear(); next.forEach((snapshot, id) => known.set(id, snapshot));
  }

  window.SplitAppIDB = Object.freeze({ open, loadAll, save });
})();
