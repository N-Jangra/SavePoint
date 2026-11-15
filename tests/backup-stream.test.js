"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../frontend/components/backup-stream.js"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "../frontend/app.js"), "utf8");
const backendSource = fs.readFileSync(path.join(__dirname, "../frontend/backend/app.js"), "utf8");
const settingsSource = fs.readFileSync(path.join(__dirname, "../frontend/pages/settings.js"), "utf8");
const nativeStoreSource = fs.readFileSync(path.join(__dirname, "../android/app/src/main/java/com/cuemark/savepoint/EncryptedStorePlugin.java"), "utf8");
const sharePluginSource = fs.readFileSync(path.join(__dirname, "../android/app/src/main/java/com/cuemark/savepoint/ShareIntentPlugin.java"), "utf8");
const window = {};
vm.runInNewContext(source, { window, TextDecoderStream, DecompressionStream, Uint8Array, setTimeout, JSON, Error });

function streamChunks(text, sizes = [1, 2, 7, 13]) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0, size = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) { controller.close(); return; }
      const end = Math.min(bytes.length, offset + sizes[size++ % sizes.length]);
      controller.enqueue(bytes.slice(offset, end)); offset = end;
    }
  });
}

test("Android encrypted records have an atomic app-specific files mirror and empty-store recovery", () => {
  assert.match(nativeStoreSource, /getExternalFilesDir\(null\)/);
  assert.match(nativeStoreSource, /CueMark\/SavePoint\/records/);
  assert.match(nativeStoreSource, /Os\.rename\(/);
  assert.match(nativeStoreSource, /Map<String, JSONObject> byId/);
  assert.match(nativeStoreSource, /getMirrorLocation/);
  assert.match(nativeStoreSource, /ensureMirror/);
  assert.match(nativeStoreSource, /syncMirrorBatch/);
  assert.match(nativeStoreSource, /finishLibraryMirrorSync/);
  assert.match(backendSource, /syncMirrorBatch\(\{ items: batch \}\)/);
  assert.match(backendSource, /if \(!status\?\.ready\)\s*\{[\s\S]*?syncMirrorBatch[\s\S]*?\}\s*await plugin\.setMeta\?\./);
  assert.match(backendSource, /finishLibraryMirrorSync\(\{ count: items\.length \}\)/);
  assert.match(backendSource, /EncryptedStore\?\.ensureMirror/);
  assert.match(nativeStoreSource, /deleteMirror\(\)/);
});

test("backup stream parser preserves nested values, escapes, and fields across split chunks", async () => {
  const backup = {
    app: "SavePoint", version: 2, exportedAt: "2026-11-11T00:00:00.000Z",
    index: [{ id: "1" }],
    items: [
      { id: "1", title: "A ] and } \"quoted\" game", nested: { list: [1, { ok: true }] } },
      { id: "2", title: "Second", tags: ["a", "b"] }
    ],
    history: [{ action: "added", title: "one" }], preferences: { theme: "dark", nested: { enabled: true } }
  };
  const parsed = await window.SplitAppBackupStream.parse(streamChunks(JSON.stringify(backup)));
  const { index: _index, ...expected } = backup;
  assert.deepEqual(JSON.parse(JSON.stringify(parsed)), expected);
});

test("backup stream parser accepts an empty items array", async () => {
  const backup = { app: "SavePoint", items: [], history: [], preferences: {} };
  const parsed = await window.SplitAppBackupStream.parse(streamChunks(JSON.stringify(backup), [3, 1]));
  assert.deepEqual(JSON.parse(JSON.stringify(parsed)), backup);
});

test("backup stream parser rejects a truncated items array", async () => {
  await assert.rejects(() => window.SplitAppBackupStream.parse(streamChunks('{"app":"SavePoint","items":[{"id":"1"}')),
    /item list is incomplete/);
});

test("transfer export embeds artwork found only in SavePoint IndexedDB", async () => {
  const bytes = Buffer.from("idb-only-poster");
  const blob = new Blob([bytes], { type: "image/jpeg" });
  const idb = { getImages: async entries => entries.length ? [[entries[0][0], blob]] : [], getThumbs: async () => [] };
  const window = {
    APP_CONFIG: { key: "savepoint", name: "SavePoint", categories: [] },
    SplitAppIDB: idb,
    addEventListener() {},
  };
  const context = {
    window, navigator: { onLine: false }, document: { addEventListener() {}, visibilityState: "visible" },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    URL, Blob, FileReader: class {
      readAsDataURL(value) {
        value.arrayBuffer().then(buffer => {
          this.result = `data:${value.type};base64,${Buffer.from(buffer).toString("base64")}`;
          this.onload();
        }, error => { this.error = error; this.onerror(); });
      }
    },
    Promise, Map, Set, Object, Array, String, Number, Math, Date, RegExp, Error, JSON,
    setTimeout, clearTimeout, fetch, console, Uint8Array, TextEncoder, TextDecoder, Response,
  };
  vm.runInNewContext(backendSource, context, { filename: "backend/app.js" });
  const item = { id: "idb-art", title: "IndexedDB only", image: "https://example.test/poster.jpg", category: "game" };
  const entry = await window.SplitAppBackend.backupItem(item);
  assert.equal(entry.transferImages.image, `data:image/jpeg;base64,${bytes.toString("base64")}`);
});

test("transfer import retains source URLs and restores IndexedDB image cache keys", () => {
  const start = appSource.indexOf("function restoreTransferImages"), end = appSource.indexOf("// .txt: one game per line", start);
  const source = appSource.slice(start, end);
  assert.doesNotMatch(source, /target\[leaf\] = value/);
  assert.match(source, /thumbKeyOf\(item, false\)/);
  assert.match(source, /backend\?\.collectAllImageCandidates\?\.\(item\)/);
  assert.match(source, /putImages\?\.\(storedImages\)/);
});

test("Android backup picker accepts password transfer files with binary MIME types", () => {
  assert.match(settingsSource, /<input type="file" accept="\*\/\*" data-setting-action="import"/);
});

test("Android encrypted transfers can stream to the system share sheet in bounded chunks", () => {
  assert.match(appSource, /data-run-export-share/);
  assert.match(appSource, /share \? "share"/);
  assert.match(backendSource, /mode === "share"/);
  assert.match(backendSource, /appendFileChunk/);
  assert.match(backendSource, /shareChunkedFile/);
  assert.match(sharePluginSource, /send\.setClipData\(ClipData\.newUri/);
  assert.match(sharePluginSource, /chooser\.setClipData\(ClipData\.newUri/);
  assert.match(sharePluginSource, /FLAG_GRANT_READ_URI_PERMISSION/);
  assert.match(appSource, /if \(!silent && !share\) toast\("Choose where to save your library/);
});

test("mobile transfer export reads saved artwork concurrently with a low-memory bound", () => {
  assert.match(backendSource, /const imageBatchSize = deviceMemory <= 2 \? 2 : 4/);
  assert.match(backendSource, /Promise\.all\(items\.slice\(offset, offset \+ imageBatchSize\)\.map\(backupEntry\)\)/);
});
