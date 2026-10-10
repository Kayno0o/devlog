# devlog

A minimalist devlog built with [kay](https://github.com/Kayno0o/kayjs) as a static site: no server, no JavaScript shipped, light and dark themes from the reader's system setting, in English and in French under `/fr`.

## Writing a post

Add a Markdown file to `src/content/posts/en/`, and its French translation under the same name in `src/content/posts/fr/`; the file name is the slug, served at `/posts/<slug>` and `/fr/posts/<slug>`. A post with no French copy shows in English on the French site.

```md
---
title: The post's title
description: One sentence, shown on the home page and in the feed.
date: 2026-10-09
tags: [kay, benchmarks]
draft: true
---
```

A draft shows in `bun run dev` only, never in the build or the feed. An optional `updated: <date>` shows beside the date once a post is revised. Code blocks are highlighted at build time by Shiki, `kay` fences included.

Components usable in a post, each tag on its own line, attributes as JSON in braces:

```md
<BarChart title="Server rendering" unit="renders/s" better="higher" highlight="kay" digits={0} rows={[{"label": "kay", "value": 4788}, {"label": "Svelte", "value": 3853}]} source="where the numbers come from" />

<Stats items={[{"value": "8.7 KB", "label": "JS shipped, gzip"}]} />

<Note title="Heads up">

Markdown inside, after a blank line.

</Note>
```

Markdown tables render as they are, for numbers that read better side by side than as bars.

The pages' own texts live in `src/messages/en.ts` and `src/messages/fr.ts`; `kay check` holds the French file to the English one's keys.

## Commands

```sh
bun install
bun run dev     # http://localhost:3000, drafts included
bun run check   # kay check
bun run test
bun run lint
bun run build   # static site into dist/, which the host nginx serves
```

## Running it

`bun run build` writes the site to `dist/`, with precompressed `.gz` copies, which the host nginx serves directly from its read-only mount of the workspace, so a build is live at once. The site takes `try_files $uri $uri.html $uri/index.html =404`, `gzip_static on`, `error_page 404 /404.html`, and an immutable cache on `/_kay/`. `SITE_URL` (default `https://log.kaynooo.fr`) sets the origin the feed, sitemap and canonical links use.
