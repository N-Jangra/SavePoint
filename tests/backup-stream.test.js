"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../frontend/components/backup-stream.js"), "utf8");
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
