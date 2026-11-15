"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { createQueue } = require(path.join(__dirname, "..", "frontend", "components", "art-pipeline.js"));

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test("art pipeline never runs more than the concurrency limit at once", async () => {
  const queue = createQueue({ concurrency: 3 });
  let running = 0, peak = 0;
  const jobs = Array.from({ length: 12 }, (_, i) => queue.add(`k${i}`, async () => { running++; peak = Math.max(peak, running); await delay(5); running--; return i; }));
  assert.deepEqual(await Promise.all(jobs), Array.from({ length: 12 }, (_, i) => i));
  assert.equal(peak, 3);
});

test("art pipeline runs the newest requests first so visible rows beat scrolled-past rows", async () => {
  const queue = createQueue({ concurrency: 1 });
  const order = [];
  const make = name => queue.add(name, async () => { order.push(name); await delay(2); });
  await Promise.all(["first", "old-1", "old-2", "newest"].map(make));
  assert.deepEqual(order, ["first", "newest", "old-2", "old-1"]);
});

test("art pipeline loads a repeated key once and shares the result", async () => {
  const queue = createQueue({ concurrency: 2 });
  let runs = 0;
  const run = async () => { runs++; await delay(3); return "blob"; };
  const results = await Promise.all([queue.add("same", run), queue.add("same", run), queue.add("same", run)]);
  assert.deepEqual(results, ["blob", "blob", "blob"]);
  assert.equal(runs, 1);
});

test("art pipeline drops queued jobs whose tiles were removed before they started", async () => {
  const queue = createQueue({ concurrency: 1 });
  const ran = [];
  const alive = new Set(["a", "c"]);
  const make = name => queue.add(name, async () => { ran.push(name); await delay(2); }, () => !alive.has(name));
  await Promise.all(["a", "b", "c"].map(make));
  assert.deepEqual(ran.sort(), ["a", "c"]);
});

test("art pipeline keeps working after a job throws", async () => {
  const queue = createQueue({ concurrency: 1 });
  const failed = await queue.add("bad", async () => { throw new Error("boom"); });
  assert.equal(failed, null);
  assert.equal(await queue.add("good", async () => "ok"), "ok");
});

test("the library page wires its artwork through the pipeline and the saved thumbnail cache", () => {
  const fs = require("node:fs"), app = fs.readFileSync(path.join(__dirname, "..", "frontend", "app.js"), "utf8"), html = fs.readFileSync(path.join(__dirname, "..", "frontend", "index.html"), "utf8");
  assert.match(html, /components\/art-pipeline\.js/);
  assert.match(app, /SplitAppArtPipeline\?\.createQueue\(/);
  assert.match(app, /queueArtworkLoad\(image\)/);
  assert.match(app, /cachedThumbUrls\(\[\[key, sig\]\]\)/);
  assert.match(app, /putThumbs\(\[\[key, sig, blob\]\]\)/);
});
