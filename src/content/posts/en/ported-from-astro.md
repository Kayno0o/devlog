---
title: "Already lean on Astro, three times faster on kay"
description: "I ported two small business sites from Astro to kay and measured them as they deploy: load, paints, images, memory, builds, and what got worse."
date: 2026-10-18T10:20:00Z
tags: [kay, benchmarks]
draft: false
social:
  x: "Two small business sites, moved from Astro to kay, my Bun framework, and measured as they deploy behind nginx. About 3x the requests per second on a content page, less memory, a smaller deploy, earlier paints. The costs: more JavaScript, and slower builds."
  bluesky: "Two small business sites moved from Astro to kay, my Bun framework: about 3x the requests per second on a content page, less memory, a smaller deploy, earlier paints. The costs: more JavaScript per page, and slower builds."
  mastodon: "Two small business sites, a cattery and a house painter, moved from Astro to kay, my Bun framework, and measured as they deploy behind nginx. About 3x the requests per second on a content page, less memory, a smaller deploy and earlier paints. The costs: more JavaScript per page, and builds up to three times slower, as kay encodes AVIF and WebP copies of every image. #Astro #Bun #WebDev"
  reddit:
    title: "Two Astro sites moved to my own Bun framework, measured as they deploy, losses included"
    body: "I build kay, a Bun web framework, and moved two small business sites to it from Astro, a cattery and a house painter, both measured behind nginx with HTTP/2, TLS and brotli. kay serves about 3x the requests per second on a content page, as it serves them prerendered and already compressed, with less memory, a smaller deploy and earlier paints on a phone. Where it loses: more JavaScript per page, a heavier painter site on phones, and slower builds, as it encodes AVIF and WebP copies of every image."
    subreddits: []
---

Two small business sites, a cattery and a house painter, ran on Astro, which already ships next to no JavaScript. Moved to [kay](/posts/introducing-kay), they serve more requests for less memory, paint sooner and deploy smaller, and they ship more JavaScript and build slower. Each was built and served as it deploys, Astro's standalone server under Bun against kay's one executable, both behind nginx with HTTP/2, TLS and brotli, on one desktop, a Ryzen 5 7600 with 12 threads on Linux.

<Stats
  items={[
    {"value": "-33 to -37%", "label": "lines of code"},
    {"value": "2.0 to 3.1x", "label": "faster cold start"},
    {"value": "-11 to -74%", "label": "HTML and CSS per page"}
  ]}
/>

## Pages serve faster, from less memory and a smaller deploy

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

kay serves those pages prerendered and already compressed, so nginx spends about 24 µs on each instead of 470 to 540, and both kay sites sit near the load client's own ceiling of about 40,000 a second. Both sites load their contact form as a deferred server island, so every page but the cattery's home is prerendered. That home page, rendered on each request, serves at about Astro's rate for a third of its CPU, nginx's included, as kay compresses it itself.

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

## Phones paint sooner, on lighter images and no stylesheet

kay serves images as AVIF at the width drawn:

<BarChart
  title="Images per page"
  unit="KB"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay, painter", "value": 36.5, "group": "desktop"},
    {"label": "kay, cattery", "value": 52.2, "group": "desktop"},
    {"label": "Astro, cattery", "value": 142.5, "group": "desktop"},
    {"label": "Astro, painter", "value": 160.8, "group": "desktop"},
    {"label": "kay, painter", "value": 105.5, "group": "phone"},
    {"label": "kay, cattery", "value": 113.9, "group": "phone"},
    {"label": "Astro, cattery", "value": 142.5, "group": "phone"},
    {"label": "Astro, painter", "value": 185.3, "group": "phone"}
  ]}
  bench="astro"
  source="average over every page, as served at 1280 px on a desktop and 390 px at 3x on a phone"
/>

It also inlines each page's styles, leaving no stylesheet to wait for:

<BarChart
  title="Paints on a phone"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay, cattery", "value": 660, "group": "first paint"},
    {"label": "kay, painter", "value": 687, "group": "first paint"},
    {"label": "Astro, painter", "value": 1301, "group": "first paint"},
    {"label": "Astro, cattery", "value": 1508, "group": "first paint"},
    {"label": "kay, painter", "value": 838, "group": "largest paint"},
    {"label": "Astro, painter", "value": 1306, "group": "largest paint"},
    {"label": "kay, cattery", "value": 1690, "group": "largest paint"},
    {"label": "Astro, cattery", "value": 2452, "group": "largest paint"}
  ]}
  bench="astro"
  source="Lighthouse's throttling, median of 5 cold loads per page"
/>

## Astro ships less JavaScript and builds faster

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

On Astro, the painter's site shipped only a few plain scripts, inlined in its pages. What a phone transfers per page of that site is 147 KB on kay against 87 KB on Astro, mostly fonts (107 against 35 KB) and kay's script.

A clean `kay build` encodes an AVIF and a WebP copy of every image, which `astro build` does not: 6.9 against 2.2 s on the cattery and 3.7 against 2.0 s on the painter, the cattery's build peaking at 2.0 GB of memory against 1.0.

<Note title="How it was measured">

kay 1.54.2 on Bun 1.4.3, headless Chromium 151 and nginx 1.30.5 set up as in production, both sides in one sitting. Paints are medians of 5 cold loads per page under Lighthouse's throttling; load is 32 clients for 5 s per URL; builds are the median of 3 clean runs. The sites' code is private, so the record is [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), every figure with its conditions.

</Note>

The other ports: [a SvelteKit site](/posts/ported-from-sveltekit) and [an Elysia and Solid app](/posts/ported-from-solid).
