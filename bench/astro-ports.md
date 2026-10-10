# Two sites, Astro against kay

Measured with kay's sites bench (`bun run bench:sites` in kayjs, the sites given by a local config), the sites left unnamed.

- AMD Ryzen 5 7600 6-Core Processor, 12 threads
- Bun 1.4.2, Chromium 151.0.7922.34 headless, nginx/1.30.5
- cattery: Astro at fd11fb0, kay 1.17.7 at c5484e2
- painter: Astro at 6b8c6e5, kay 1.17.7 at 1549cda
- Astro run on 2026-10-07; kay 1.17.7 rerun alone on 2026-10-10 (`KIND=kay`), the Astro side unchanged since. Both sites now serve their contact form as a deferred server island, so every page they list is prerendered but the cattery's home page. Sizes, lines and deploy carry across the two sittings; paints and throughput drift between sittings, so read their Astro and kay columns with that in mind.

cattery and painter as they last ran on Astro, then on kay, each built and served as it deploys: Astro's standalone server under Bun, kay's one executable, both behind an nginx set up as production's (HTTP/2 over TLS, brotli and gzip at level 6). kay is the version each site pins, not this checkout.

## What a page downloads

Average over every page: text as brotli at quality 11 sends it, images as served at each viewport (desktop 1280 px at 1x, phone 390 px at 3x), and the fonts the stylesheets can load for Latin text.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| HTML | 4.7 KB | 5.1 KB | 6.4 KB | 6.9 KB |
| CSS | 35.2 KB | 5.3 KB | 9.3 KB | 6.8 KB |
| JS | 5.2 KB | 10.3 KB | 0.4 KB | 10.4 KB |
| JS files | 1.0 | 2.0 | 0.0 | 5.0 |
| images, desktop | 142.5 KB | 55.2 KB | 160.8 KB | 36.4 KB |
| images, phone | 142.5 KB | 114.5 KB | 185.3 KB | 105.2 KB |
| fonts | 109.5 KB | 109.5 KB | 35.2 KB | 106.6 KB |

Inline `<script>` bodies count as JS, weighed as what they add to the page's brotli (kayjs #158): Astro inlines the painter's scripts in its pages, which an earlier count put under HTML. The Astro columns were corrected from the cached builds of the same commits; the cattery's home page is not prerendered, so its share is the average of its other pages'.

## In a browser

Every page loaded cold, 5 times in a fresh context, medians averaged over the pages, with Lighthouse's throttling: a phone on slow 4G with a 4x slower CPU, and a desktop on cable. Total blocking time counts long tasks from the first paint on.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| mobile first paint (ms) | 1497 | 1371 | 1285 | 1391 |
| mobile largest paint (ms) | 2734 | 1766 | 1292 | 1393 |
| mobile blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| mobile layout shift | 0.006 | 0.006 | 0.002 | 0.018 |
| mobile load (ms) | 3065 | 2710 | 2393 | 2722 |
| mobile transferred | 255.8 KB | 197.2 KB | 126.1 KB | 167.1 KB |
| mobile requests | 10.1 | 11.0 | 6.3 | 15.1 |
| desktop first paint (ms) | 172 | 166 | 165 | 180 |
| desktop largest paint (ms) | 351 | 265 | 210 | 246 |
| desktop blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| desktop layout shift | 0.007 | 0.001 | 0.001 | 0.001 |
| desktop load (ms) | 347 | 258 | 296 | 347 |
| desktop transferred | 266.6 KB | 137.9 KB | 207.6 KB | 227.1 KB |
| desktop requests | 11.1 | 10.7 | 7.6 | 16.4 |

## Server

Cold start is from spawning the server to its first 200 on the home page, median of 7. Under load, 32 clients request one URL through nginx for 5 s over keepalive HTTP/1.1, accepting brotli; CPU is per request, of the site's server and of nginx, which compresses what the server sent uncompressed. The client is Bun's fetch, which tops out near 40,000 requests a second.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| cold start | 110 ms | 30.3 ms | 52.1 ms | 31.8 ms |
| memory once started | 115 MB | 69 MB | 66 MB | 70 MB |
| memory after load (peak) | 283 MB (311 MB) | 142 MB (151 MB) | 134 MB (149 MB) | 104 MB (117 MB) |

|  | URL | req/s | p50 (ms) | p99 (ms) | server CPU (µs/req) | nginx CPU (µs/req) |
| --- | --- | --- | --- | --- | --- | --- |
| cattery astro | `/` | 2224 | 11.6 | 25.1 | 533 | 1421 |
| cattery astro | a content page | 12523 | 1.6 | 8.7 | 94 | 472 |
| cattery astro | `/_astro/index.CA4QUJZR.css` | 3254 | 6.1 | 43.6 | 173 | 2549 |
| cattery kay | `/` | 2997 | 8.9 | 23.8 | 360 | 1610 |
| cattery kay | a content page | 31202 | 0.9 | 2.9 | 28 | 24 |
| cattery kay | `/_kay/_layout-sjxtq4vb.css` | 52894 | 0.5 | 1.8 | 15 | 21 |
| painter astro | `/` | 6068 | 2.4 | 23.0 | 154 | 1118 |
| painter astro | a content page | 11376 | 1.4 | 10.1 | 96 | 541 |
| painter astro | `/_astro/default.fuv9R-in.css` | 7848 | 1.9 | 17.6 | 109 | 879 |
| painter kay | `/` | 34966 | 0.8 | 2.5 | 26 | 23 |
| painter kay | a content page | 34994 | 0.8 | 2.3 | 26 | 23 |
| painter kay | `/_kay/_layout-j8sny4hd.css` | 51715 | 0.5 | 1.8 | 15 | 20 |

kay 1.16.6, run earlier the same day, served the content pages at 39,000 requests a second and started in 23 to 29 ms. Whether the drop comes from kay 1.17 or from a machine busier with other runs was not separated, so compare kay with Astro here, not with that run.

## Build and code

Clean builds, median of 3. `kay build` runs `kay check` first, which `astro build` has no equivalent of. Since kay serves AVIF, a clean build encodes every image's AVIF and WebP variants (122 of each on the cattery), which is where its extra time and memory go. Lines are cloc's code lines of `src` and the config files.

|  | command | wall (s) | CPU (s) | peak memory |
| --- | --- | --- | --- | --- |
| cattery astro | `astro build` | 1.94 | 5.1 | 1099 MB |
| cattery kay | `kay build` | 11.06 | 48.9 | 1864 MB |
| cattery kay | `kay build --no-check` | 12.16 | 48.2 | 1923 MB |
| painter astro | `astro build` | 1.48 | 6.2 | 1222 MB |
| painter kay | `kay build` | 7.48 | 33.1 | 1140 MB |
| painter kay | `kay build --no-check` | 7.49 | 30.5 | 1106 MB |

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| lines of code | 1892 | 1286 | 1935 | 1223 |
| lines of tests | 0 | 364 | 0 | 178 |
| deployed | 231 MB (dist and production node_modules) | 109 MB (one executable) | 301 MB (dist and production node_modules) | 98 MB (one executable) |
