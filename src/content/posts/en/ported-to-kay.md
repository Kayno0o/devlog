---
title: "Three real sites, moved to kay"
description: "A SvelteKit site and two Astro sites ported to kay and measured as they deploy: server load, paints, images, builds, memory and the dev server, what kay loses included."
date: 2026-10-17
tags: [kay, benchmarks]
draft: true
---

The [kay post](/posts/introducing-kay) measures kay on a products page and on a coding agent's build. A products page only goes so far, so this post is three real sites moved to kay: one from SvelteKit, two from Astro, each measured against the version it replaced. Every bench here ran on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

## A real site, ported from SvelteKit

I ported a real site from SvelteKit to kay: a home page and content pages, about 3,000 lines over 22 Svelte components. Both versions were measured in one sitting, runs interleaved, over loopback: the ratios carry over, the absolute numbers are optimistic.

### What kay gains

<Stats items={[{"value": "-86%", "label": "server CPU per visitor"}, {"value": "-57%", "label": "requests in home page"}, {"value": "-19%", "label": "Docker image"}, {"value": "-17%", "label": "lines of code"}]} />

<BarChart title="First paint on a phone, content page" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 400}, {"label": "SvelteKit", "value": 744}]} bench="sveltekit" source="Lighthouse Pixel 7 preset (slow 4G, 4x CPU), median of 3 runs" />

<BarChart title="Client JavaScript, brotli" unit="KB" better="lower" rows={[{"label": "kay", "value": 35.9}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" source="every file the build writes" />

A page loads only the part its islands need: 16 KB on a content page.

The home page is prerendered, and its contact form, the one part that differs per visitor, is a deferred server island: the browser fetches it about a screen before it scrolls into view, while kay serves the page itself from memory.

<BarChart title="Requests per second, home page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 35722}, {"label": "SvelteKit", "value": 764}]} bench="sveltekit" source="oha, 64 connections for 10 s, 2 rounds, kay's slower round" />

Most of that gap is prerendering, not rendering speed: when kay rendered the whole page per request, as SvelteKit does, it served it at about twice SvelteKit's rate.

<BarChart title="Build, cold caches" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 2.97}, {"label": "SvelteKit", "value": 3.92}]} bench="sveltekit" source="hyperfine, median of 3 runs" />

Under load, kay peaks at 85 MiB of memory against SvelteKit's 131 to 134. The home page a phone downloads drops from 706 to 558 KB, mostly images: kay serves AVIF at the width drawn.

### What kay loses

<BarChart title="Server memory at rest" unit="MiB" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 38}, {"label": "kay", "value": 55}]} bench="sveltekit" source="RSS after start" />

- **The default is not the fast path.** The phone paint above needs `inlineStyles`, which is opt-in: with the stylesheet linked, as kay does by default, kay painted 85 to 140 ms behind SvelteKit. Inlining costs about 2 KB per page, and the stylesheet is no longer cached between pages.
- **Short pages with inlined styles.** Pages rendered per request carry the whole stylesheet, so kay serves them at 0.9 to 1.0 times SvelteKit's rate, for 1.1 to 1.2 times its CPU per request. With it linked, kay served them at 1.8 to 2.2 times SvelteKit's rate.

### In development

<BarChart title="First load of the home page, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 97}, {"label": "SvelteKit", "value": 1654}]} bench="sveltekit" source="headless Chromium, load event, median of 2 rounds" />

<BarChart title="Template edit to screen, dev server" unit="ms" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 37}, {"label": "kay", "value": 257}]} bench="sveltekit" source="file write to the page showing it, median of 14 edits" />

- **kay loads pages faster.** Both start in about a second with cold caches, but kay serves a bundled client, 19 requests for the home page against Vite's 166 modules, so the home page answers in 571 ms from a warm start against 1,440. Its processes hold 251 MiB against Vite's 415.
- **Vite applies edits sooner.** kay restarts its server on a template edit, so it shows in about 260 ms against Vite's 40; a style edit is swapped in without a restart, in 96 ms against 38. kay shows a server code edit in the same 260 ms with the page's state kept, which SvelteKit only shows after a manual reload.

<Note title="How it was measured">

kay 1.37.6 on Bun 1.4.4 canary, kay 1.37.3 for the dev server. Paints come from Playwright under Lighthouse's phone and desktop presets, median of 3 runs; builds from hyperfine, median of 3 cold runs; the server from oha, 10 s at 64 connections, two rounds. The site's code is private, so the record is [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), every figure with its conditions.

</Note>

## Two sites, ported from Astro

Two small business sites moved to kay from Astro: a cattery and a house painter. Each was built and served as it deploys, Astro's standalone server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli.

### What kay gains

<Stats items={[{"value": "-32 to -37%", "label": "lines of code"}, {"value": "2.2 to 3.5x", "label": "faster cold start"}, {"value": "-27 to -85%", "label": "CSS per page"}]} />

<BarChart title="Requests per second, a content page" unit="req/s" better="higher" digits={0} rows={[{"label": "kay, painter", "value": 39805}, {"label": "kay, cattery", "value": 39322}, {"label": "Astro, cattery", "value": 12648}, {"label": "Astro, painter", "value": 11798}]} bench="astro" source="32 clients through nginx for 5 s" />

kay serves those pages prerendered and already compressed, so nginx spends about 20 µs on each instead of 470 to 540, and both sit near the load client's own ceiling of about 40,000 a second. Both sites load their contact form as a deferred server island, so every page but the cattery's home is prerendered.

<BarChart title="Server memory after load" unit="MB" better="lower" digits={0} rows={[{"label": "Astro, cattery", "value": 281}, {"label": "kay, cattery", "value": 144}, {"label": "Astro, painter", "value": 125}, {"label": "kay, painter", "value": 95}]} bench="astro" source="RSS after the load runs" />

<BarChart title="Deployed size" unit="MB" better="lower" digits={0} rows={[{"label": "Astro, painter", "value": 301}, {"label": "Astro, cattery", "value": 231}, {"label": "kay, cattery", "value": 109}, {"label": "kay, painter", "value": 98}]} bench="astro" source="dist and production node_modules against one executable" />

- **Lighter images**, served as AVIF at the width drawn: 55 against 143 KB and 36 against 161 KB per page on desktop, 115 against 143 KB and 105 against 185 KB on a phone.
- **Faster paints on the cattery**: on a phone, the largest paint lands at 1.78 s instead of 2.73 s, and a phone downloads 201 KB per page instead of 256.

### What kay loses

<BarChart title="JS shipped per page, brotli" unit="KB" better="lower" rows={[{"label": "Astro, painter", "value": 0.4}, {"label": "Astro, cattery", "value": 5.2}, {"label": "kay, cattery", "value": 13.1}, {"label": "kay, painter", "value": 13.1}]} bench="astro" source="average over every page" />

- **More JavaScript.** The painter's site shipped 0.4 KB on Astro, a few plain scripts inlined in its pages, and ships 13.1 KB on kay, mostly the runtime its islands and in-place navigation need; the cattery's goes from 5.2 to 13.1 KB.
- **A heavier painter site on phones.** A phone downloads 170 KB per page against 126 KB, mostly fonts (107 against 35 KB) and that script. Its largest paint lands about 70 ms later on a phone and 35 ms later on desktop.
- **Slower builds.** A clean `kay build` encodes an AVIF and a WebP copy of every image at each width, and type-checks, which `astro build` does not: 11.3 against 1.9 s on the cattery and 7.1 against 1.6 s on the painter, the cattery's build peaking at 1.9 GB against 1.1.

<Note title="How it was measured">

kay 1.28.0 on Bun 1.4.4, headless Chromium 151 and nginx 1.30.5 set up as in production, both sides in one sitting. Paints are medians of 5 cold loads per page under Lighthouse's throttling; load is 32 clients for 5 s per URL; builds are the median of 3 clean runs. The sites' code is private, so the record is [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), every figure with its conditions.

</Note>
