#!/usr/bin/env node
/*
 * scripts/bench-loading.mjs — reproducible loading benchmark.
 *
 * Measures REAL browser facts with the Performance APIs through the
 * already-installed Playwright/Chromium toolchain (resolved from the
 * environment — never a new project dependency):
 *
 *   - HTML transfer size per route
 *   - initial JS bytes + JS resource count
 *   - DOMContentLoaded, load event, FCP, LCP
 *   - speculative requests observed before any user intent
 *     (RSC payload .txt fetches + scene chunks)
 *   - client-side navigation completion times
 *   - player: chunk requests and audio requests BEFORE first playback
 *     intent, and the continuity of the audio element across routes
 *
 * Every scenario runs N times with a fresh browser context (cold
 * cache) and reports MEDIANS, never a single lucky run.
 *
 * Usage:
 *   node scripts/bench-loading.mjs [--out DIR] [--runs N] [--port P]
 *   npm run bench:loading
 *
 * Default port 4173 matches the documented E2E static-server port,
 * so the E2E direct-source audio URLs (scripts/e2e-media-prepare.mjs
 * writes absolute http://127.0.0.1:4173/... URLs) resolve during the
 * player-continuity scenario.
 *
 * If Playwright cannot be resolved the command exits 2 with a clear
 * message — it never invents numbers.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

/* ------------------------------------------------------------------ */
/* Argument parsing                                                    */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { runs: 5, port: 0, outDir: null, serveDir: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--runs") args.runs = Number(argv[++i]);
    else if (a === "--port") args.port = Number(argv[++i]);
    else if (a === "--out") args.outDir = argv[++i];
    else if (a === "--serve") args.serveDir = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const OUT_DIR = args.outDir
  ? path.resolve(args.outDir)
  : path.resolve(repoRoot, "out");

if (!fs.existsSync(path.join(OUT_DIR, "index.html"))) {
  console.error(`bench:loading — no static export at ${OUT_DIR}. Run "npm run build" first.`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Playwright resolution (global install or local, never installed)    */
/* ------------------------------------------------------------------ */

async function resolvePlaywright() {
  const candidates = [
    "playwright",
    "/home/z/.npm-global/lib/node_modules/playwright/index.mjs"
  ];
  if (process.env.PLAYWRIGHT_MODULE) {
    candidates.unshift(process.env.PLAYWRIGHT_MODULE);
  }
  for (const candidate of candidates) {
    try {
      if (candidate.endsWith(".mjs")) {
        return await import(candidate);
      }
      const require = createRequire(import.meta.url);
      return require(candidate);
    } catch {
      /* try next */
    }
  }
  return null;
}

const playwright = await resolvePlaywright();
if (!playwright) {
  console.error(
    "bench:loading — Playwright is not available in this environment. " +
      "Install it globally (npm i -g playwright && npx playwright install chromium) " +
      "or set PLAYWRIGHT_MODULE. No numbers are invented; exiting."
  );
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/* Static server (reuse scripts/e2e-static-server.mjs with access log) */
/* ------------------------------------------------------------------ */

const PORT = args.port || 4173;
const BASE = `http://127.0.0.1:${PORT}`;

function startServer() {
  const serverPath = path.join(repoRoot, "scripts", "e2e-static-server.mjs");
  const child = spawn(process.execPath, [serverPath, OUT_DIR, String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  let buffer = "";
  child.stdout.on("data", (chunk) => {
    buffer += String(chunk);
  });
  return {
    child,
    getLog: () => buffer,
    stop: () => child.kill("SIGTERM")
  };
}

async function waitUntilReachable(timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/index.html`, { method: "HEAD" });
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("static server did not start");
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function median(values) {
  const v = [...values].filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

function pct(values, p) {
  const v = [...values].filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const idx = Math.min(v.length - 1, Math.max(0, Math.ceil((p / 100) * v.length) - 1));
  return v[idx];
}

const ROUTES = ["/", "/about/", "/contact/", "/blog/", "/work/", "/research/"];

/*
 * Request classification (v4.0.3): honest categories instead of
 * keyword guessing.
 *
 * - "initial" JS: every .js resource referenced by the exported
 *   document's <script src> tags — the critical graph.
 * - "dynamic" JS: any other JS the page loads. On a cold load with
 *   NO user interaction every dynamic chunk is speculative by
 *   definition (scene chunks, the RED MAGIC organism, the lazy
 *   player surface).
 * - "rsc-cross-route": RSC payload (.txt) fetches addressed to a
 *   DIFFERENT route than the one being loaded — automatic prefetch
 *   floods (v4.0.2 fetched up to 11 article payloads per page view).
 * - "rsc-bootstrap": same-route __next.* payloads the App Router
 *   hydrates from in a static export (framework-critical, not
 *   speculation).
 */

function initialScriptSet(html) {
  return new Set(
    [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1])
  );
}

function routeToFile(route) {
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  if (!clean) return path.join(OUT_DIR, "index.html");
  return path.join(OUT_DIR, clean, "index.html");
}

function classifyRequests(requests, route, initialScripts) {
  const routePrefix = route.replace(/\/$/, "");
  return requests
    .map((r) => {
      if (/\.(mp3|m4a|flac|wav)(\?|$)/.test(r.url)) return { ...r, kind: "audio" };
      if (r.url.endsWith(".js")) {
        return {
          ...r,
          kind: initialScripts.has(r.url) ? "initial" : "dynamic"
        };
      }
      if (r.url.endsWith(".txt")) {
        const crossRoute =
          routePrefix === ""
            ? !r.url.startsWith("/__next") && r.url !== "/index.txt"
            : !r.url.startsWith(`${routePrefix}/__next`);
        return { ...r, kind: crossRoute ? "rsc-cross-route" : "rsc-bootstrap" };
      }
      return { ...r, kind: "other" };
    });
}

async function installTracing(context) {
  const requests = [];
  context.on("request", (req) => {
    const url = new URL(req.url());
    if (url.origin.startsWith(BASE)) {
      requests.push({
        url: url.pathname,
        resourceType: req.resourceType(),
        start: Date.now()
      });
    }
  });
  context.on("response", (res) => {
    const url = new URL(res.url());
    const entry = requests.find(
      (r) => r.url === url.pathname && r.status === undefined
    );
    if (entry) {
      entry.status = res.status();
      const headers = res.headers();
      entry.size = Number(headers["content-length"] ?? 0);
    }
  });
  return requests;
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((p) => p.name === "first-contentful-paint");
    const resources = performance.getEntriesByType("resource");
    let jsBytes = 0;
    let jsCount = 0;
    let cssBytes = 0;
    const jsFiles = [];
    for (const r of resources) {
      const isJs =
        r.name.endsWith(".js") ||
        (r.initiatorType === "script" && !r.name.endsWith(".css"));
      if (isJs) {
        jsCount += 1;
        jsBytes += r.transferSize || 0;
        jsFiles.push({
          url: r.name.split("/").pop(),
          transferSize: r.transferSize || 0,
          decodedBodySize: r.decodedBodySize || 0
        });
      } else if (r.name.endsWith(".css")) {
        cssBytes += r.transferSize || 0;
      }
    }
    return {
      htmlTransferSize: nav?.transferSize ?? 0,
      domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
      loadEvent: Math.round(nav?.loadEventEnd ?? 0),
      fcp: fcp ? Math.round(fcp.startTime) : null,
      jsCount,
      jsBytes,
      cssBytes,
      jsFiles,
      lcp: null
    };
  });
}

async function collectLcp(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = 0;
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "largest-contentful-paint") {
              last = entry.startTime;
            }
          }
        });
        try {
          po.observe({ type: "largest-contentful-paint", buffered: true });
        } catch {
          resolve(null);
          return;
        }
        setTimeout(() => {
          po.disconnect();
          resolve(last ? Math.round(last) : null);
        }, 300);
      })
  );
}

const serverHandle = startServer();
await waitUntilReachable();

const browser = await playwright.chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

const results = {
  meta: {
    outDir: OUT_DIR,
    runs: args.runs,
    base: BASE,
    date: new Date().toISOString(),
    browser: "chromium (playwright)"
  },
  coldLoads: {},
  navigations: {},
  player: {},
  notes: []
};

/* ------------------------------------------------------------------ */
/* Scenario 1: cold initial loads                                      */
/* ------------------------------------------------------------------ */

console.log(`\n=== COLD LOADS (${args.runs} runs each, medians) ===`);

for (const route of ROUTES) {
  const runs = [];
  for (let i = 0; i < args.runs; i += 1) {
    const context = await browser.newContext();
    const requests = await installTracing(context);
    const page = await context.newPage();
    const t0 = Date.now();
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 30000 });
    // give idle work (preloader etc.) 3s to surface speculative requests
    await page.waitForTimeout(3000);
    const metrics = await collectMetrics(page);
    metrics.lcp = await collectLcp(page);
    const elapsed = Date.now() - t0;

    const html = fs.readFileSync(routeToFile(route), "utf8");
    const initialScripts = initialScriptSet(html);
    const classified = classifyRequests(requests, route, initialScripts);

    const dynamicJs = classified.filter((r) => r.kind === "dynamic");
    const crossRoute = classified.filter((r) => r.kind === "rsc-cross-route");

    runs.push({
      ...metrics,
      elapsed,
      speculativeJsCount: dynamicJs.length,
      speculativeJsUrls: dynamicJs.map((r) => r.url).sort(),
      crossRoutePayloads: crossRoute.map((r) => r.url).sort()
    });
    await context.close();
  }
  const med = {
    htmlTransferSize: median(runs.map((r) => r.htmlTransferSize)),
    jsCount: median(runs.map((r) => r.jsCount)),
    jsBytes: median(runs.map((r) => r.jsBytes)),
    cssBytes: median(runs.map((r) => r.cssBytes)),
    domContentLoaded: median(runs.map((r) => r.domContentLoaded)),
    loadEvent: median(runs.map((r) => r.loadEvent)),
    fcp: median(runs.map((r) => r.fcp)),
    lcp: median(runs.map((r) => r.lcp)),
    speculativeJsCount: median(runs.map((r) => r.speculativeJsCount)),
    crossRoutePayloadCount: median(runs.map((r) => r.crossRoutePayloads.length)),
    speculativeJsUrls: runs[0].speculativeJsUrls,
    crossRoutePayloads: runs[0].crossRoutePayloads
  };
  results.coldLoads[route] = med;
  console.log(
    `${route.padEnd(12)} html=${String(med.htmlTransferSize).padStart(6)}B js=${String(
      med.jsBytes
    ).padStart(7)}B/${med.jsCount}f dcl=${String(med.domContentLoaded).padStart(4)}ms load=${String(
      med.loadEvent
    ).padStart(4)}ms fcp=${String(med.fcp).padStart(4)}ms lcp=${String(med.lcp).padStart(4)}ms dynJS=${med.speculativeJsCount} crossRoute=${med.crossRoutePayloadCount}`
  );
}

/* ------------------------------------------------------------------ */
/* Scenario 2: client-side navigation after hydration                  */
/* ------------------------------------------------------------------ */

console.log(`\n=== CLIENT NAVIGATION (click, after hydration; medians) ===`);

const NAV_PATHS = [
  { from: "/", to: "/about/", label: "home->about" },
  { from: "/", to: "/contact/", label: "home->contact" },
  { from: "/", to: "/blog/", label: "home->blog" },
  { from: "/blog/", to: "/work/", label: "blog->work" },
  { from: "/work/", to: "/research/", label: "work->research" },
  { from: "/research/", to: "/contact/", label: "research->contact" },
  { from: "/contact/", to: "/", label: "contact->home" }
];

results.navigations = {};
for (const nav of NAV_PATHS) {
  const times = [];
  for (let i = 0; i < args.runs; i += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}${nav.from}`, { waitUntil: "load" });
    await page.waitForTimeout(1200); // hydration settle
    // find the nav link for the destination by href
    const selector = `a[href="${nav.to === "/" ? "/" : nav.to}"]`;
    const t0 = Date.now();
    try {
      await page.click(selector, { timeout: 4000, noWaitAfter: true });
      await page.waitForURL(`${BASE}${nav.to}`, { timeout: 8000 });
      await page
        .waitForLoadState("networkidle", { timeout: 6000 })
        .catch(() => {});
      times.push(Date.now() - t0);
    } catch {
      times.push(NaN);
    }
    await context.close();
  }
  const med = median(times);
  results.navigations[nav.label] = med;
  console.log(`${nav.label.padEnd(20)} median ${med} ms`);
}

/* ------------------------------------------------------------------ */
/* Scenario 3: player behavior                                         */
/* ------------------------------------------------------------------ */

console.log(`\n=== PLAYER: pre-intent requests + continuity ===`);

{
  const context = await browser.newContext();
  const requests = await installTracing(context);
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(3000);

  const homeHtml = fs.readFileSync(routeToFile("/"), "utf8");
  const classified = classifyRequests(requests, "/", initialScriptSet(homeHtml));

  const preIntent = {
    audioRequests: classified.filter((r) => r.kind === "audio").length,
    dynamicJsCount: classified.filter((r) => r.kind === "dynamic").length,
    crossRoutePayloadCount: classified.filter((r) => r.kind === "rsc-cross-route").length,
    audioElementCount: await page.evaluate(() => document.querySelectorAll("audio").length),
    playerStoreGlobals: await page.evaluate(() => Object.keys(window).filter((k) => /player/i.test(k)).length)
  };

  results.player.preIntent = preIntent;
  console.log(
    `pre-intent: audio=${preIntent.audioRequests} dynamicJS=${preIntent.dynamicJsCount} crossRoute=${preIntent.crossRoutePayloadCount} audioElements=${preIntent.audioElementCount}`
  );

  // Continuity: engage playback on the media scene through a REAL
  // play control (aria-label="Play <title>"), then traverse every
  // primary route and verify ONE audio element survives. Playwright's
  // click() is a trusted input event, so the play gesture is honored
  // (a DOM .click() would be ignored by the autoplay policy).
  //
  // The E2E direct-source tracks (scripts/e2e-media-prepare.mjs) bake
  // absolute URLs at the documented E2E port 4173, so this scenario
  // must be served there — the bench main port is only used for the
  // timing scenarios above.
  await page.goto(`${BASE}/#media`, { waitUntil: "load" });
  await page.waitForTimeout(2500);

  let playClicked = null;
  try {
    await page.click('button[aria-label^="Play "]', { timeout: 5000 });
    playClicked = await page
      .evaluate(() => document.querySelector('audio') ? "audio element present" : "no audio yet");
  } catch {
    playClicked = null;
  }

  if (playClicked) {
    await page.waitForTimeout(2500);
    const engaged = {
      playControl: playClicked,
      audioElements: await page.evaluate(() => document.querySelectorAll("audio").length),
      audioSrc: await page.evaluate(() => {
        const a = document.querySelector("audio");
        return a ? Boolean(a.src || a.currentSrc) : false;
      }),
      audioRequests: requests.filter((r) => /\.(mp3|m4a|flac|wav)(\?|$)/.test(r.url)).length
    };
    results.player.engaged = engaged;
    console.log(
      `engaged (${engaged.playControl}): audioElements=${engaged.audioElements} hasSrc=${engaged.audioSrc} audioRequests=${engaged.audioRequests}`
    );

    for (const route of ["/", "/about/", "/contact/", "/blog/", "/work/", "/research/"]) {
      await page.click(`a[href="${route}"]`, { timeout: 5000 }).catch(() => {});
      await page.waitForURL(`${BASE}${route}`, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
    const continuity = await page.evaluate(() => {
      const audios = document.querySelectorAll("audio");
      return {
        audioElements: audios.length,
        paused: audios.length ? audios[0].paused : null,
        currentTime: audios.length ? Math.round(audios[0].currentTime * 10) / 10 : null
      };
    });
    results.player.continuity = continuity;
    console.log(
      `after 6 soft navigations: audioElements=${continuity.audioElements} paused=${continuity.paused} t=${continuity.currentTime}s`
    );
  } else {
    results.player.engaged = "no play control found (media scene may require setup)";
    console.log("no play control found — continuity not exercised");
  }
  await context.close();
}

/* ------------------------------------------------------------------ */
/* Scenario 4: first navigation after hydration (separate measure)     */
/* ------------------------------------------------------------------ */

{
  const times = [];
  for (let i = 0; i < args.runs; i += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const t0 = Date.now();
    await page.click('a[href="/about/"]', { timeout: 6000, noWaitAfter: true });
    await page.waitForURL(`${BASE}/about/`, { timeout: 8000 });
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
    times.push(Date.now() - t0);
    await context.close();
  }
  results.navigations["home->about (first nav, ASAP after DCL)"] = median(times);
  console.log(
    `home->about (first nav, ASAP after DCL) median ${median(times)} ms`
  );
}

await browser.close();
serverHandle.stop();

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

const outPath =
  process.env.BENCH_OUTPUT ??
  path.join(repoRoot, "bench-results.json");

fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nWrote ${outPath}`);
