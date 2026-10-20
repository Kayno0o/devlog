---
title: "Two Astro sites, moved to kay"
description: "Two small business sites ported from Astro to kay and measured as they deploy: server load, paints, images, builds and memory, what kay loses included."
date: 2026-10-20
tags: [kay, benchmarks]
draft: true
---

The [kay post](/posts/introducing-kay) measures kay on a products page and on a coding agent's build. A products page only goes so far, so here are two small business sites moved to kay from Astro: a cattery and a house painter. Each was built and served as it deploys, Astro's standalone server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli, on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

<Stats
  items={[
    {"value": "-33 to -37%", "label": "lines of code"},
    {"value": "2.0 to 3.1x", "label": "faster cold start"},
    {"value": "-11 to -74%", "label": "HTML and CSS per page"}
  ]}
/>

<BarChart
  title="Requests per second, a content page"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay, painter", "value": 37009},
    {"label": "kay, cattery", "value": 36921},
    {"label": "Astro, cattery", "value": 12829},
    {"label": "Astro, painter", "value": 11049}
  ]}
  bench="astro"
  source="32 clients through nginx for 5 s"
/>

kay serves those pages prerendered and already compressed, so nginx spends about 24 µs on each instead of 470 to 540, and both sit near the load client's own ceiling of about 40,000 a second. Both sites load their contact form as a deferred server island, so every page but the cattery's home is prerendered. That home page, rendered on each request, serves at about Astro's rate for a third of its CPU, nginx's included, as kay compresses it itself.

<BarChart
  title="Server memory after load"
  unit="MB"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay, painter", "value": 77},
    {"label": "Astro, painter", "value": 89},
    {"label": "kay, cattery", "value": 118},
    {"label": "Astro, cattery", "value": 210}
  ]}
  bench="astro"
  source="PSS after the load runs"
/>

<BarChart
  title="Deployed size"
  unit="MB"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay, painter", "value": 110},
    {"label": "kay, cattery", "value": 121},
    {"label": "Astro, cattery", "value": 231},
    {"label": "Astro, painter", "value": 301}
  ]}
  bench="astro"
  source="dist and production node_modules against one executable"
/>

- **Lighter images**, served as AVIF at the width drawn: 52 against 143 KB and 37 against 161 KB per page on desktop, 114 against 143 KB and 106 against 185 KB on a phone.
- **Faster paints.** kay inlines each page's styles, leaving no stylesheet to wait for: on a phone the first paint lands at 0.66 and 0.69 s instead of 1.51 and 1.30 s, the largest at 1.69 and 0.84 s instead of 2.45 and 1.31 s.

<BarChart
  title="JS shipped per page, brotli"
  unit="KB"
  better="lower"
  rows={[
    {"label": "Astro, painter", "value": 0.4},
    {"label": "Astro, cattery", "value": 5.2},
    {"label": "kay, cattery", "value": 12.3},
    {"label": "kay, painter", "value": 12.5}
  ]}
  bench="astro"
  source="average over every page"
/>

- **More JavaScript.** The painter's site shipped only a few plain scripts on Astro, inlined in its pages.
- **A heavier painter site on phones.** A phone downloads 147 KB per page against 87 KB, mostly fonts (107 against 35 KB) and that script.
- **Slower builds.** A clean `kay build` encodes an AVIF and a WebP copy of every image, which `astro build` does not: 6.9 against 2.2 s on the cattery and 3.7 against 2.0 s on the painter, the cattery's build peaking at 2.0 GB against 1.0.

<Note title="How it was measured">

kay 1.54.2 on Bun 1.4.3, headless Chromium 151 and nginx 1.30.5 set up as in production, both sides in one sitting. Paints are medians of 5 cold loads per page under Lighthouse's throttling; load is 32 clients for 5 s per URL; builds are the median of 3 clean runs. The sites' code is private, so the record is [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), every figure with its conditions.

</Note>
