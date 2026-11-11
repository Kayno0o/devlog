---
title: "53 CLIs that all fail the same way, on purpose"
description: "arc, dl, gloss, pick, probe and proc each do one job with a safe default, and one small kit makes all 53 of my CLIs parse, help and fail the same way."
date: 2026-11-10
tags: [cli, bun]
draft: true
social:
  x: "53 small CLIs, one kit: every bin exits 0 when clean, 1 on a finding, 2 when it could not check, and a test holds each command to that table. -n is always a count, -t always a timeout, and --help loads none of the commands."
  bluesky: "53 small CLIs, one kit: every bin exits 0 when clean, 1 on a finding, 2 when it could not check, and a test holds each command to that table. -n is always a count, -t always a timeout, and --help loads none of the commands."
  mastodon: "I write small CLIs on Bun, 53 bins so far, all on one kit: every bin exits 0 when clean, 1 on a finding, 2 when it could not check, and a test walks every command to hold it to that table. -n is always a count, -t a timeout, output changes for a terminal, a pipe or an agent. The post covers six I built for myself: arc, dl, gloss, pick, probe and proc. #Bun #CLI #TypeScript"
  reddit:
    title: "One kit behind 53 small Bun CLIs: shared exit codes, flags and output modes"
    body: "I build small CLIs on Bun. They all sit on one kit, so every bin parses, helps and fails the same way: one exit-code table that a test holds every command to, flags that mean the same thing everywhere, and output that changes for a terminal, a CI log, a pipe or a coding agent. The post covers six bins made for people rather than agents (an archiver that verifies before deleting, a downloader that checks before running, a man-page explainer, a fuzzy picker, an HTTP probe and a /proc inspector) and what the kit costs."
    subreddits: []
---

Most of my command-line tools were written for Claude Code, and [that post](/posts/agent-clis) covers them. Six were written for me, typed by hand in a terminal. All of them, 53 bins across 27 packages, sit on one small kit, so they parse, help and fail the same way.

<Stats
  items={[
    {"value": "53", "label": "bins on one kit, published on npm as @kaynooo/cli-*"},
    {"value": "0, 1, 2", "label": "the exit codes every bin shares: clean, a finding, could not check"},
    {"value": "229", "label": "test files, one of them walking every command of every bin"}
  ]}
/>

## Each bin does one job, with the safe default

- **arc** packs a folder into a `.tar.zst` and deletes the folder only once the archive checks out: the zstd checksum, the entry count, then `tar --compare` on every file, owners and extended attributes included. Any failure before that leaves the folder as it was. `arc unpack` refuses to overwrite anything.
- **dl** downloads into a folder of its own and checks the sha256. A mismatch deletes the file, and an HTML error page served with a 200 counts as a failure. `dl --exec` runs a script exactly as it was read, after listing its risky lines (`sudo`, `rm -r`, edits to shell profiles), and only when a checksum pins it or `--yes` says so.
- **gloss** explains a command line from the local man pages. It reads no network and runs nothing it explains.
- **pick** is a fuzzy picker: lines on stdin, the chosen one on stdout. It draws on stderr and reads keys from `/dev/tty`, so a pipe carries only the choice.
- **probe** shows a site's HTTP version, redirect chain, timings, certificate and headers in one call. `--dns` compares the system resolver with three public ones and the zone's own nameservers, and it warns when a certificate has under 14 days left.
- **proc** reads a process from `/proc`, with its environment hidden unless asked and secrets masked even then. `ports 3000` says who listens on a port, and `ports 3000 --kill` refuses pid 1, another user's process, its own ancestors, and a container's port, where it prints the `docker stop` to run instead.

```
$ gloss 'tar -xzvf site.tgz -C /srv'
tar  an archiving utility
  -x        Extract files from an archive. Arguments are optional. When given, they specify names of
            the archive members to be extracted.
  -z        Filter the archive through gzip(1).
  -v        Verbosely list files processed. ...
  -f        Use archive file or device ARCHIVE. ...
  site.tgz  the ARCHIVE for -f
  -C        Change to DIR before performing any operations. ...
  /srv      the DIR for -C
```

## Every bin exits by the same table

A script calling one of these never has to read its docs to know what an exit code means. 0 is clean: it did what was asked, or found nothing wrong. 1 is a finding, nothing found, or an operation that ran and failed. 2 is a usage error, or a check that could not run, a timeout or an unreachable registry, so "could not check" is never reported as clean.

The exceptions are few and each one is written in its command's help: a bin wrapping another command exits with that command's code, a cancelled picker exits 130 like Ctrl+C would, and `probe` exits 1 only when the site could not be reached at all, since that is its finding.

A test walks every command of every bin through the completion protocol, then checks three things: its help states its exit codes, only codes from the table, and it answers `--help` with 0 and an unknown option with 2.

## A flag means the same thing in every bin

`-n` is always a count, whether of rows, lines or slots. `-t` is always how long to wait, as a duration: `30s`, `5m`, `1h`. A listing cuts to its default and says `N more, rerun with --full`; `--json` is never cut unless `-n` asks. `--dry-run` shows what would change without changing it, and a renamed flag keeps its old spelling as a hidden alias, so an old command line keeps working.

## The output depends on who reads it

The kit sorts every run into a terminal, a CI log, a pipe or a coding agent. Only a terminal gets colour, glyphs, links and spinners. A pipe or a CI log gets plain lines that stay greppable, `error: demo greet: give a name` then a `hint:` line. An agent, which pays for every token it reads, gets tab-separated tables and one-line JSON, and help without its examples.

Prompts follow the same rule: off a terminal, a prompt fails at once with exit 2 instead of waiting for a line that will never come.

## Every bin draws with the same marks

One theme holds the colours and glyphs every bin draws with. A status line starts with one of four marks, a green ✓, a dimmed ›, a yellow ▲ or a red ✗, and a status word gets one of five badges, the same in every bin:

```
✓ success   ✗ failure   ● running   ○ waiting   - skipped
```

The default colours are ANSI names, not fixed values, so the terminal's own palette decides what green is, and the bins follow [my desktop theme](/posts/chamfer-theme) without knowing it exists. The kit ships four presets: the default, high contrast, `mono` with bold and dim only, and `ascii` for a terminal without the glyphs. A `theme.json` in my config folder or in a project restyles every bin at once. It is JSON only and at most 64 KiB, so a project's theme file can never run anything.

No theme changes what is printed off a terminal, where the marks read `ok:`, `note:`, `warning:` and `error:`.

## --help loads no command

Each command imports its module only when it runs, so `--help`, completion and a typo answer without loading any of them. Every bin also prints its own completion script for fish, bash and zsh, and the kit's usage log keeps the names of the flags I use, never their values.

## The kit is one more thing to release

The kit is bundled into each bin at build, so a fix to it reaches a bin only when that bin is released again. And the bins run on Bun only.

## Try it

Each bin installs on its own:

```sh
bun install -g @kaynooo/cli-arc @kaynooo/cli-dl @kaynooo/cli-gloss
```

The rest are in [docs/bins.md](https://github.com/Kayno0o/cli/blob/main/docs/bins.md), and the kit is `@kaynooo/cli-kit` if you want your own CLIs to behave the same way.
