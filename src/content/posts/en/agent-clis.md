---
title: "Claude printed my secrets, so I built it safer CLIs"
description: "Claude Code printed my secrets, broke a stash and overloaded my machine. Each is now a rule a hook enforces, and a command that does the job safely."
date: 2026-11-10
tags: [llm, cli]
draft: true
social:
  x: "Claude Code printed my .env into the session, broke my uncommitted work with a git stash, and ran enough tests at once to get them OOM-killed. Each is now a rule a hook enforces, and the refusal names the command of mine to run instead."
  bluesky: "Claude Code printed my .env into the session, broke my uncommitted work with a git stash, and ran enough tests at once to get them OOM-killed. Each one is now a rule a hook enforces, and every refusal names the command to run instead."
  mastodon: "Claude Code printed my .env into the session, broke my uncommitted work with a git stash, and ran enough tests at once to get them OOM-killed. Each one is now a rule: a hook reads every shell command before it runs, refuses the ones that break a rule, and names a small CLI of mine that does the job safely. Masked secrets, a temporary worktree instead of a stash, machine-wide slots for heavy jobs. #ClaudeCode #Bun #CLI"
  reddit:
    title: "The rules and CLIs I built after Claude Code leaked my secrets and broke a git stash"
    body: "I build these CLIs for my own Claude Code sessions. Four mistakes started them: secrets printed into the session, a git stash that broke my uncommitted changes, parallel test runs timing out or getting OOM-killed, and issue and CI handling I wanted done better. A hook now reads each command before it runs, refuses the ones that break a rule, and names the command to run instead. The post also measures how much output the bins save, which on a terse toolchain is nothing."
    subreddits: []
---

Claude Code runs my shell commands all day, often in several sessions at once. Three times it did something I had to clean up after: it printed my secrets into the session, a `git stash` broke files I was still changing, and test runs started in parallel timed out or got killed for memory. The fourth one was less a mistake than a habit: issues and CI handled through raw API calls, when they deserved a real workflow.

Each one is now a rule. A hook reads every command before it runs, refuses the ones that break a rule, and names a command of mine that does the job safely. There are 26 packages of these small CLIs now, published on npm as `@kaynooo/cli-*`.

## Every refusal names the command to run instead

`guard` reads a command the way a shell would, quotes, heredocs and `sudo` wrappers included, and checks it against its rules: remote machines, git, destructive commands, commit messages, SQL writes, env files, package managers and in-place edits. As a Claude Code hook, it denies the call and gives Claude the route in the same message.

```
$ guard check 'ssh my-server uptime'
remote: Remote servers are off limits (no SSH, no deploys, no remote commands). Hand the user the exact command to run themselves.
```

## Secrets stay masked, even in piped output

The first rule came from my `.env` file printed into the session, where every later message carried it along. The `env` rule now refuses any command that reads, edits or prints an env file or the whole environment, and the hook refuses Claude's own Read, Edit and Write tools on one.

What Claude gets instead is `ev`. `ev list` shows every key with its value masked, `ev set` takes the value on stdin so it never appears in the command, and `ev cp` copies a key from one file to another without printing it. For everything else there is `redact`, which masks known token formats, URL passwords and the values of the folder's own env files in any output piped through it: `docker compose config | redact`. Run as `git diff --cached | redact --check`, it lists where a secret sits before it gets committed.

## A temporary worktree replaced git stash

The second rule came from a stash and its pop that left my uncommitted changes broken. I got them back by rewriting them by hand. The refusal now says why, and what to do instead:

```
$ guard check 'git stash'
git: Never `git stash`: a pop with nothing saved applies someone else's old stash. To prove a test fails without your change, `proof --keep <test> -- <cmd>` runs it at HEAD in a temporary worktree and again here; `base -- <cmd>` runs any command at HEAD (`--ref <rev>` another commit), the working tree untouched. To set edits aside before a cherry-pick, a rebase or a checkout, commit them with `gc` first, or do the other work in `git worktree add`.
```

`proof` answers the question the refusal starts with: it exits 0 only when the command fails at HEAD and passes in the working tree. My files never move.

## Heavy jobs wait for a slot

The third came from load. Several sessions each running a test suite, a type checker or a browser at once made tests time out, or get killed for memory. `slot -- <cmd>` waits for one of the machine's slots, half its CPU count by default, shared by every session, worktree and shell. A slot is freed the moment its holder ends, even on a SIGKILL, because the kernel drops it with the process. `--lock <name>` also holds a named lock, for what must never run twice at once, such as a shared test database.

Claude doesn't have to remember any of this: a hook sends test runners, browsers and type checkers through `slot` by itself, and `check` takes a slot on its own.

## Issues and CI got a workflow of their own

The fourth wasn't an accident. `ft` wraps my Forgejo's issues and CI into the steps Claude actually takes. `ft ci` waits for the runs of a commit and prints each failed test's output. A task with several steps gets its checklist in an issue, `ft tick` ticks a box as each step lands, and `ft fixed` refuses to close the issue while a box is left. After a compaction, or in a new session, the work resumes from the boxes still open. `ft take` claims an issue for one session, so two sessions don't pick the same one.

## The other bins save output only on a noisy toolchain

I expected the bins that shape output to save a lot of tokens. On this blog's own repo, with a type error, a lint error and a failing test planted, half of them save nothing:

<Stats
  items={[
    {"value": "-47%", "label": "characters for the repo's state, gst against git status and git log"},
    {"value": "-62%", "label": "characters for one function, peek against reading its whole file"},
    {"value": "+13%", "label": "characters for typecheck, lint and test, check against the three scripts"},
    {"value": "0%", "label": "characters for a failed build, out against the build script"}
  ]}
/>

kay's checker and linter and `bun test` already print only what failed; Bun does that when Claude Code runs it. `check` then only adds the path of each full log, and `out` finds nothing to fold. On this repo their gain is one call instead of three and the full logs kept on disk, not tokens. On a noisier toolchain, a PHP test suite or a Vue type checker, the folding is where they pay.

<Note title="How it was measured">

One run of each command from Claude Code on 10 November 2026, on a copy of this repo with kay 1.94.0 and Bun 1.4.4, stdout and stderr counted together in characters. gst 0.16.1, peek 0.15.1, check 0.20.1, out 0.14.5. The planted failures, the commands and the counts are in [bench/agent-clis.md](https://github.com/Kayno0o/devlog/blob/main/bench/agent-clis.md).

</Note>

## A refused command lands on me

The rules cost me something too. Whatever the guard refuses comes back to me: while researching this post, Claude's SSH clone of my own forge got refused, and the work waited until it found the public API instead. A masked value also means Claude can't tell me a key is wrong, only that it is set, so I check it myself. And the CLIs run on Bun only.

## Try it

`doctor` installs the CLIs you pick and the Claude Code hooks plugin, then checks the install:

```sh
bun install -g @kaynooo/cli-doctor
doctor --install
```

The code is on [GitHub](https://github.com/Kayno0o/cli), and every bin is described in [docs/bins.md](https://github.com/Kayno0o/cli/blob/main/docs/bins.md).
