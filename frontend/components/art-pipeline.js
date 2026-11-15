// Artwork loading pipeline: a small concurrency-limited queue used by the Games, Library and Profile lists.
// - at most `concurrency` loads run at once, so a fast scroll cannot open dozens of connections;
// - newest requests run first (LIFO), so the rows on screen win over rows already scrolled past;
// - the same key is only loaded once; later requests share the running job;
// - a job whose `skip()` returns true (every tile that wanted it was removed) is dropped before it starts.
(root => {
  function createQueue({ concurrency = 6 } = {}) {
    const pending = [], inflight = new Map();
    let active = 0;
    function pump() {
      while (active < concurrency && pending.length) {
        const job = pending.pop();
        if (job.skip && job.skip()) { inflight.delete(job.key); job.resolve(null); continue; }
        active++;
        Promise.resolve().then(job.run).then(job.resolve, () => job.resolve(null)).finally(() => { active--; inflight.delete(job.key); pump(); });
      }
    }
    function add(key, run, skip) {
      if (inflight.has(key)) return inflight.get(key).promise;
      const job = { key, run, skip };
      job.promise = new Promise(resolve => { job.resolve = resolve; });
      inflight.set(key, job); pending.push(job); pump();
      return job.promise;
    }
    return { add, get active() { return active; }, get waiting() { return pending.length; } };
  }
  root.SplitAppArtPipeline = { createQueue };
  if (typeof module !== "undefined" && module.exports) module.exports = { createQueue };
})(typeof window !== "undefined" ? window : globalThis);
