---
title: "A review inbox for every commit Claude makes"
description: "Two Herdr mods file each commit Claude Code makes into a review inbox, one diff per ticket, and paste my notes back into the Claude that wrote the code."
date: 2026-11-10
tags: [llm, claude-code]
draft: true
social:
  x: "Claude Code commits after every task, in several terminals at once. A hook now files each commit into a review inbox, folds a ticket's commits into one diff, and one key pastes my line notes into the Claude that wrote the code. Approving stays mine."
  bluesky: "Claude Code commits after every task, in several terminals at once. A hook now files each commit into a review inbox, folds a ticket's commits into one diff, and one key pastes my line notes back into the Claude that wrote the code."
  mastodon: "Claude Code commits after every task, in several terminals at once. Two mods for Herdr, the terminal app I run them in, turn that into a review inbox: a hook files each commit, a ticket's commits fold into one net diff, my line notes go back to the Claude that made them, and a scenario replays the changed screens before and after. #ClaudeCode #CodeReview #DevTools"
  reddit:
    title: "A review inbox for Claude Code's commits: one diff per ticket, notes pasted back into the session that wrote them"
    body: "I run Claude Code in Herdr, a terminal app built for coding agents. Claude commits after every task, so I wrote two mods on top of it. A hook files each commit into a per-project inbox, recording which terminal made it. Commits that share a ticket fold into one net diff, fixups and rebased copies included. I leave notes on lines, and one key pastes them into the Claude that made the latest commit. A second mod replaces the changes panel with a commit graph. The post covers both, and what they cost."
    subreddits: []
---

Claude Code commits after every task, in several terminals at once, and every one of those commits is mine to review. Two mods now do the plumbing: each commit Claude makes lands in a review inbox, a ticket's commits read as one diff, and my notes go back to the Claude that wrote the code.

<Note title="Screenshot to come: the Review tab">

The inbox rail with tickets, the loose commits and the approved group, a ticket's net diff side by side, two notes anchored to lines.

</Note>

## Herdr already did what I was building

The mods run in [Herdr](https://herdr.dev), a terminal app made for coding agents. It is not mine. Its runtime, `hc`, runs programs in terminals that stay alive, and it knows which terminal holds an agent and whether that agent is blocked on me. The app adds spaces, tabs and panes on top, and a mod API: a folder with a `main.js` that draws a native view and calls `hc`.

I had been building the same base on tmux, about 1,100 lines of scripts. Herdr already did it, by default, so I deleted them: on Herdr I don't rebuild the base, I build over a good one that I can customise as far as I need.

## Every commit Claude makes lands in an inbox

A Claude Code hook reads the output of each shell command for the line git prints after a commit. It also catches commands that commit quietly, a rebase, a cherry-pick or a revert, and follows `cd` and `git -C` to find the repo. Each commit it finds goes into the project's inbox with the terminal it came from. The hook always exits 0, so a review can never block a commit.

Opening the Review tab also files the branch's unpushed commits from the last two weeks, which picks up the ones I made by hand.

## A ticket's commits read as one diff

A commit whose body names a ticket, `#42 - the ticket's title`, joins that ticket's item, and the item shows one net diff instead of its commits one by one. Fixups, amends and rebased or cherry-picked copies fold into it too. Commits with no ticket stay loose, and Claude can file them under one when I ask.

An approval stores the commits it covered, so a new commit on an approved ticket brings it back to the inbox.

## A note goes back to the Claude that wrote the code

I read with the keyboard: `r` marks a file read and moves on, `c` leaves a note on a line, `a` approves. `s` turns the open notes into one prompt and pastes it into the Claude that made the item's latest commit, if that terminal still runs it. That Claude fixes each point and marks its note handled, and I see the fix as a new commit in the same item.

Claude can also review a ticket itself and leave notes, but approving and rejecting stay mine, and its skill says so.

## Changed screens are shot before and after

For a ticket that changes a page, Claude writes a short Playwright scenario: a route, the steps to reach the state, a viewport. `review shoot` checks the stack out at the parent of the ticket's first commit, shoots, checks it out at the last commit, shoots again, and puts both images in the ticket's header. Each project has a preset for its login and its install and migration steps, run only when their files changed.

A failed step still takes its screenshot, since the image usually shows why. A run that fails because the stack did, rather than the scenario, is retried up to three times.

## The changes panel became a commit graph

The second mod replaces Herdr's changes panel with a graph of the focused pane's repo: one lane per branch, the uncommitted work as the top row, and the files and diff of whichever row I pick. A right-click on a commit, a branch or a tag offers what git would, from cherry-pick to reset. A ticket line in a commit body becomes a link to its Forgejo issue, and a ticket opens in the Review tab.

<Note title="Screenshot to come: the git graph">

The graph panel beside a Claude terminal, a few branches on their lanes, the right-click menu on a commit.

</Note>

## Claude's open questions sit in a panel

My Claude sessions ask their questions without waiting for the answer, as [the harness post](/posts/claude-code-harness) explains. Herdr's labels carry them out of each terminal, and a panel lists them as cards grouped by project, each with its recommended answer. Accept sends the recommendation to that Claude, a reply box sends anything else. A command Claude hands me shows with a copy button and a box to paste its output back.

<Note title="Screenshot to come: the questions panel">

Two projects' cards, one with its context unfolded, and a handed command with its copy button.

</Note>

## The inbox trusts git's output

The hook spots commits by reading what git printed, so a commit made by a tool that prints something else is missed until the Review tab opens and files the unpushed ones. A shoot does not roll back migrations, which is why it runs on a throwaway copy of the stack, never the one I work on. The git panel is a copy of Herdr's own changes panel, so a fix upstream does not reach it. And `bun run setup` has to run again after each pull.

## Try it

The mods are on [GitHub](https://github.com/Kayno0o/herdr-mods). They need Linux, [Herdr](https://herdr.dev), Claude Code, Bun and git:

```sh
git clone https://github.com/Kayno0o/herdr-mods.git
cd herdr-mods
bun install
bun run setup
```

`setup` installs both mods, the Ctrl+Shift+R key, the commit hook and the review skill, and downloads the Chromium the shoots use. The checkout stays where it is, since the mods point into it.
