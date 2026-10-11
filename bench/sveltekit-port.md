# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** kay 1.31.0, commit `56e5d18`, the shipped config: `inlineStyles: true`, the home page prerendered with its contact form as a deferred server island (`server="defer"`), and `site` read from `SITE_URL` at runtime. The partner, legal and 404 pages are rendered per request.
- **Bun:** 1.4.4 canary (`1.4.4-canary.1+6c1eb067e`) for both versions, the kay executable's embedded runtime included (checked with `BUN_BE_BUN=1 ./server --revision`). kay is built by calling its CLI with that Bun: the site's `package.json` scripts put npm's `bun` 1.4.2 first on the path, installed as the Tailwind plugin's peer, so kay's builds and executable in sittings before 8 ran on Bun 1.4.2.
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 11 Oct 2026, every section in one sitting (sitting 10), both versions interleaved. Figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.
- **Background load:** another app on the machine ran a job queue using about one core in bursts throughout, which widens the server ranges below.

## Web Vitals (browser)
Tool: the repo's `tests-e2e/perf.e2e.ts` (Playwright, Chromium), throttled through CDP with Lighthouse presets: slow 4G and 4x CPU for phones (Pixel 7), cable for desktop (1600x900). Cache disabled, page scrolled to the end. 3 rounds alternating between versions; each figure is the median of the 3, in ms.

| Page, device | Metric | SvelteKit | kay |
|---|---|---|---|
| Partner page, phone | First paint | 744 | 396 |
| Partner page, phone | Largest paint | 1,200 | 852 |
| Partner page, small phone (360 px) | First paint | 736 | 424 |
| Partner page, small phone | Largest paint | 1,192 | 844 |
| Partner page, laptop | First paint | 188 | 208 |
| Partner page, desktop | First paint | 192 | 220 |
| Home page, phone | First paint = largest paint | 884 | 532 |
| Home page, small phone | First paint = largest paint | 916 | 616 |
| Home page, laptop | First paint | 264 | 240 |
| Home page, laptop | Largest paint | 368 | 280 |
| Home page, desktop | First paint | 260 | 240 |
| Home page, desktop | Largest paint | 356 | 292 |

- Layout shift is at most 0.011 on kay (the partner page on phones: its list moves up 28 px about 800 ms in, cause not traced) and 0.0005 on SvelteKit. Both are well under the 0.1 "good" threshold.
- TTFB is not reported, since CDP throttling leaves Navigation Timing's `responseStart` unthrottled.
- The partner page on desktop and laptop is where kay is behind, by 20 to 28 ms.
- **Partner page largest paint:** the logo it paints last arrives after kay's runtime script, 14.6 KB brotli (see the client build below). On kay 1.17.4, before that script grew, it painted at 736 ms (sitting 6).
- **Honest note:** the phone paints need `inlineStyles`, which is opt-in. On kay 1.14.0 (sitting 2), with the stylesheet linked as kay does by default, kay's phone first paint was 85 to 140 ms behind SvelteKit, because its stylesheet downloads alongside the fonts, scripts and logos. Inlining costs about 2 KB more per page and no stylesheet caching between pages.

## Page weight (what a phone downloads, Chromium transfer sizes)

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page, whole page after scrolling | 706 | 558 | KB |
| Home page, first view before scrolling | 262 | 196 | KB |
| Home page requests | 65 (70 on desktop) | 29, the deferred contact form included | requests |
| Partner page, whole | 138 | 100 | KB |
| Partner page requests | 27 | 8 | requests |

- Most of the home page saving is images: kay serves AVIF q50 by `Accept`, at the width drawn.

## Client build, brotli sizes, not gzip

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Client JavaScript, all files, brotli | 70.1 (19 files) | 46.1 (33 files) | KB |
| Client JavaScript a page loads, brotli | | 16.0 (partner page, 3 files) | KB |
| Client CSS, brotli | 13.0 | 13.9 | KB |
| Font files | 231 (9 woff2) | 90 (3 woff2) | KB |
| Image files | 3.06 | 2.71 | MB |

SvelteKit's client JavaScript was not measured again: `c860ae5` has not changed since sitting 1.

- **kay's client JavaScript grew in kay 1.18.0:** kay 1.17.4 built 16.6 KB in 8 files (sitting 6). From 1.18.0, kay builds each of the home page's sections and the contact form as islands with shared chunks, which the pages never load as they render static, and its runtime script, loaded by every page with an island, went from 9.5 to 13.3 KB brotli. It was 14.4 KB on 1.28.0 and is 14.6 KB on 1.30.0 and 1.31.0.

**HTML per request, as each server sends it to a browser** (not the same encoding):

| Page | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page | 16.9 gzip, rendered per request | 28.5 br, prerendered | KB |
| Partner page | 4.1 gzip | 20.7 gzip | KB |

- kay's HTML carries the 13.9 KB stylesheet inlined, so it is not fetched separately.
- Built without a site, as here, the home page is rendered again at boot once `SITE_URL` is known. For about the first 2 s after boot it goes out as a quickly compressed 34.2 KB br copy, then as the 28.5 KB one, recompressed in the background at the build's levels. The 28.5 KB was measured in sitting 7 on kay 1.24.4; the 34.2 KB copy again here.
- Inlined pages rendered per request go out as gzip: kay compresses them around a stylesheet deflated once at start.

## Server
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Four rounds alternating both servers; figures are the range over the rounds, or a single value where they agree. The first two overlapped another project's dependency bump, so two more were run; all four are kept, as the background load above spread every round.

| Endpoint | Metric | SvelteKit | kay | Unit |
|---|---|---|---|---|
| Home page | Requests per second | 648 to 770 | 28,062 to 36,742 | req/s |
| Home page | CPU per request | 1.63 to 1.87 | 0.028 to 0.036 | ms |
| Home page | TTFB p50, 1 connection | 1.23 to 1.60 | 0.05 to 0.06 | ms |
| Home page, uncompressed (sitting 9) | CPU per request | 1.02 | 0.11 | ms |
| Contact form island (`/?kay_island=0`) | Requests per second | | 7,894 to 9,176 | req/s |
| Contact form island | CPU per request, body sent | | 0.20 to 0.23 ms, 1.1 KB br | |
| Partner page | Requests per second | 4,042 to 4,188 | 3,481 to 4,068 | req/s |
| Legal notice | Requests per second | 4,578 to 5,115 | 4,067 to 4,543 | req/s |
| 404 page | Requests per second | 4,944 to 5,169 | 3,541 to 4,587 | req/s |
| Short pages (partner, legal, 404) | CPU per request | 0.21 to 0.28 | 0.26 to 0.34 | ms |
| Hero image, WebP | Requests per second | 37,581 to 40,481 | 53,343 to 54,200 | req/s |
| Hero image, AVIF | Requests per second | 38,664 to 44,660 | 58,892 to 60,002 | req/s |
| Health check | Requests per second | 50,938 to 60,764 | 64,423 to 73,790 | req/s |
| Cold start to first 200 | Median of 15 spawns | 20.6 to 22.7 | 24.0 to 26.1 | ms |
| RSS after start | | 39 | 51 to 54 | MiB |
| RSS peak, home page load | | 128 to 144 | 80 to 84 | MiB |

- **Home page:** kay serves it from memory, as any prerendered page, so it serves at 38 to 51 times SvelteKit's rate in the same round, for a 47th to a 61st of its CPU per request. Only the contact form is rendered per visitor, fetched by the browser about a screen before it scrolls into view: page and form together cost about 0.22 to 0.26 ms of CPU against SvelteKit's 1.63 to 1.87 ms.
- **Short pages** are still rendered per request and carry the inlined stylesheet: they serve at 0.81 to 1.01 times SvelteKit's rate in the same round (0.69 for the 404 page in the most loaded one), for 1.1 to 1.3 times its CPU per request. Sitting 9, on a quieter machine, had 0.89 to 1.09.
- **Health check:** kay's answers on `/_kay/health`, SvelteKit's on `/healthz`.
- On images, SvelteKit serves static files, while kay serves resized variants through an image route, here at 1.3 to 1.5 times SvelteKit's rate.

## Build and deploy
Tool: hyperfine. Cold runs cleared caches (`.svelte-kit` and `node_modules/.cache`, or `.kay`): 3 runs. Warm runs kept the caches: 1 warmup and 5 runs. Figures are medians. A first pass overlapped another project's dependency bump and was run again; the rerun is given.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Build, cold caches (`vite build` / `kay build --compile`) | 3.83 | 2.85 | s |
| Build, warm caches | 1.68 | 1.10 | s |
| Server code, Bun runtime left out | 14.5 (`build/` + production `node_modules`) | 19.2 (executable minus an empty program compiled the same way, 91.1 MB) | MB |
| Docker image | 229 (oven/bun:canary) | 185 (debian slim + one executable) | MB |
| Docker image, gzipped (`docker save \| gzip -1`) | 112 | 87 | MB |

- kay's build includes prerendering the home page.
- **Bun 1.4.4 builds kay more slowly (sitting 8):** the same tree built warm in 0.85 s on Bun 1.4.2 and 1.09 s on 1.4.4, about 28% slower; kay 1.24.4 took 0.83 s on 1.4.2 (sitting 7).
- **kay's server code:** the client build (3.2 MB), `public/` (4.0 MB), the prerendered page (0.3 MB) and the AVIF encoder's WebAssembly (3.5 MB), the rest about 8 MB of code and bytecode. The kay executable with the Bun runtime is 110.3 MB. SvelteKit's server code was not measured again.
- **Correction:** sittings 6 and 7 gave kay's server code as 8.9 and 9.6 MB. Those subtracted an empty program compiled on Bun 1.4.3 (91.0 MB) from an executable carrying Bun 1.4.2, whose empty program weighs 81.3 MB. Like for like, sitting 7's was 19.3 MB.

## Lines of code
Tool: cloc 2.10 on `git archive` of each commit, without `static/`, `public/` and `bun.lock`. `.kay` files were counted with C-style comments, which is how they're written. Comments and blank lines are excluded.

| Area | SvelteKit | kay | Unit |
|---|---|---|---|
| Application (src/, plus SvelteKit's adapter/) | 2,087 | 1,531 | lines |
| Components (.svelte / .kay) | 1,032 (22 files) | 883 (25 files) | lines |
| TypeScript and JavaScript | 616 | 244 | lines |
| CSS | 410 | 404 | lines |
| Tests | 714 | 842 | lines |
| Config and tooling | 236 | 170 | lines |
| Total | 3,037 | 2,543 | lines |

Counted at kay 1.31.0's commit (`56e5d18`). Since sitting 9: the header listens for Escape through `listen(window, 'keydown', ...)` (kay 1.31.0) rather than adding and removing the listener by hand, the contact mail reads its recipient from kayjs-mail 0.3, and an `AGENTS.md` joined the config. The contact form names its fields with `field="..."` (kay 1.30.0), which writes `required`, `minlength`, `maxlength` and `type="email"` from the action's schema.

## Dev server
`vite dev` (SvelteKit `c860ae5`) against `kay dev` (kay 1.37.3, commit `d468a60`), each run from a scratch copy of its commit on its own port, two rounds alternating the two. Browser: headless Chromium, 1280x800, unthrottled over loopback, the site's own CSP enforced. Figures are medians, with the range in brackets.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Startup to first 200, caches cleared (`.svelte-kit` and `node_modules/.vite`, or `.kay`) | 1,023 (846 to 1,200) | 1,040 (1,039 to 1,040) | ms |
| Startup to first 200, warm (10 launches) | 468 (412 to 817) | 555 (542 to 599) | ms |
| Startup to the home page's first 200, warm | 1,440 (1,361 to 1,925) | 571 (558 to 616) | ms |
| First load of the home page, fresh server and browser (load event) | 1,654 (1,631 to 1,676) | 97 (94 to 100) | ms |
| Requests for it | 166 | 19 to 20 | requests |
| First load of the partner page (load event) | 705 (692 to 718) | 51 (51 to 52) | ms |
| Requests for it | 84 | 14 to 15 | requests |
| Template edit to screen (14 edits) | 37 (32 to 52) | 257 (255 to 264) | ms |
| Style edit to screen | 38 (34 to 51) | 96 (88 to 104) | ms |
| Server code edit to screen | never by itself; 87 (81 to 166) from a manual reload | 258 (255 to 261) | ms |
| Page state kept through the edit (template / style / server) | 14 / 14 / 0 of 14 | 14 / 14 / 14 of 14 | edits |
| Memory at rest, PSS (RSS) of the process tree | 415 (443), 1 process | 251 (379), 4 processes | MiB |
| Memory after 21 edits, PSS (RSS) | 511 (540) | 333 (463) | MiB |

- **Edits:** the partner page is open with a marker set on `window` and scrolled 300 px. One edit a kind in turn, 7 rounds, each timed from the file write to the moment the page shows it, checked after every DOM mutation and every task. The template edit changes a link's text, the style edit a rule appended to `app.css`, the server code edit a value the page's server code returns (a `--- server` fence in kay, `+page.server.ts` in SvelteKit), only in the copies.
- **SvelteKit's server code edits:** Vite reloads nothing when `+page.server.ts` changes, so after 10 s the page was reloaded by hand and the time from that reload is given; the marker is lost each time. Two template edits of 14 also lost the scroll position.
- **kay's edits:** a page edit restarts the server (147 to 199 ms by kay's log, kept warm by a spare process), then the page swaps in what changed. A stylesheet edit is swapped in without a restart (49 to 62 ms by kay's log). The marker and the scroll position survived every edit.
- **Memory:** kay runs `kay dev`, the server, the spare and the client builder it keeps as four processes, whose RSS counts shared pages several times, so PSS is the fair figure.
- **First load:** Vite serves each module on its own (166 requests for the home page); kay serves a bundled client (19 to 20).
- **Harness fix:** a first pass bypassed the CSP in the browser, under which kay up to 1.34.0 opened one more live-reload connection per edit and stalled after six (kayjs#275, fixed in 1.35.0). With the site's CSP, as a developer's browser has it, kay is unaffected; the figures above come from that.

## Earlier sittings
Kept for what the shipped config no longer shows; compare them within their own sitting only.
- **kay dev on kay 1.32.0 (`d3c09e6`, earlier the same day):** startup to first 200 in 666 ms with cold caches and 382 warm, edits shown in about 360 ms each since a stylesheet edit restarted the server too, 167 MiB PSS at rest in 3 processes and 213 after 21 edits; SvelteKit measured 1,273 cold and 447 warm in that sitting.
- **Linked styles, server (sitting 4, kay 1.16.6, `cd24483`, every page rendered per request):** linked short pages served at 1.8 to 2.2 times SvelteKit's rate (8.3k to 9.2k req/s), about twice the inlined rate, as inlined pages splice the stylesheet on the main thread while linked ones compress on the thread pool. The home page rendered per request served at 2.0 times SvelteKit inlined (1,487 req/s) and 2.4 times linked (1,772).
- **Server island modes (sitting 5, kay 1.17.1, uncommitted):** with the contact form marked `server` instead of `server="defer"`, the page is prerendered and the form rendered per request and spliced in, sent as gzip with `Cache-Control: private, no-store`: 4.0k to 5.0k req/s, 5 to 8 times SvelteKit, at 0.37 ms of CPU. With no mark, the whole page rendered per request served at 1.3k to 1.4k req/s.
- **Earlier releases, inlined short pages:** kay 1.16.0 served them at 1.8k to 2.2k req/s for 1.1 to 1.3 ms of CPU each, kay 1.16.3 at 2.1k to 2.2k req/s for 0.49 to 0.54 ms, kay 1.16.5 at 4.0k to 4.6k req/s for 0.31 to 0.35 ms, each in its own sitting.
- **kay 1.17.4 (sitting 6, `92090dd`):** before kay 1.18.0 grew the runtime script, the partner page weighed 94 KB in 7 requests and painted its largest element at 736 ms on a phone, against SvelteKit's 1,204 ms.
- **kay 1.24.4 on Bun 1.4.2 (sitting 7, `018dc38`):** home page 31.9k req/s at 0.030 ms of CPU, RSS 60 MiB at rest, cold build 2.48 s and warm 0.83 s.
- **kay 1.28.0 (sitting 8, `53b3fd4`, Bun `1.4.4-canary.1+71d0d4399`):** every figure within noise of sitting 9's; the runtime script was 14.4 KB brotli and the partner page's JavaScript 15.8 KB.
- **kay 1.30.0 (sitting 9, `ed1ec8f`, quieter machine):** every figure within noise of sitting 10's; home page 37.5k to 37.7k req/s at 0.027 to 0.028 ms of CPU, short pages 0.89 to 1.09 times SvelteKit's rate.

## Left out or to treat with care
- Absolute server numbers: loopback on one desktop. Quote the ratios.
- Comparisons of paint figures across sittings, and older kay versions' figures (1.10.x to 1.12.0).
- The SvelteKit desktop home page whole-page weight moved between sittings (655 KB in one, 432 KB in another, lazy images loading differently). Only the phone weights are stable.
- Memory: kay holds 1.3 times SvelteKit's RSS at rest; its peak under home page load is lower, since that page is served from memory. The bytecode accounts for about 3 MiB of the resting gap; the rest was not traced.
- Cold start: SvelteKit's moved from 20.5 to 31 ms across sittings 4 to 10, so read the 3 ms gap as noise.
- The Docker images compile and install inside Docker with the image's own Bun, which was not checked, so they only compare sizes.
