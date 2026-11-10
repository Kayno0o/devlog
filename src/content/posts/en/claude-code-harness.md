---
title: "Rules Claude Code gets at the moment they apply"
description: "How I keep Claude Code on my conventions after a compaction: a short CLAUDE.md, hooks handing over memories as calls need them, questions kept on screen."
date: 2026-11-10
tags: [llm, claude-code]
draft: true
social:
  x: "Claude Code kept forgetting my conventions after a compaction. Now a hook hands it the rule as it makes the call the rule is about: the commit rules on git commit, the forge rules on an ft call. The list is cleared on each compaction, so every rule comes back."
  bluesky: "Claude Code kept forgetting my conventions after a compaction. Now a hook hands it the rule as it makes the call the rule is about: the commit rules on git commit, the forge rules on an ft call. The list is cleared on each compaction, so every rule comes back on its own."
  mastodon: "Claude Code kept forgetting my conventions after a compaction, and its questions got lost in the scrollback. So my CLAUDE.md is 32 lines pointing at memories, hooks hand each memory over when a tool call needs it, and questions stay above the prompt with a recommended answer until I answer them. 13 small mods, about 4,400 lines of hooks. #ClaudeCode #LLM #DevTools"
  reddit:
    title: "Handing Claude Code each rule at the moment a tool call needs it, instead of one long CLAUDE.md"
    body: "I use Claude Code all day, and two things kept going wrong: it forgot my conventions after a compaction, and its questions got lost in the scrollback. My CLAUDE.md is now 32 lines that point at memories. Hooks hand a memory over when a call needs it (the commit rules on git commit, the SQL rules on a SQL client), once per conversation, and again after each compaction. Questions are asked without blocking and stay above the prompt until answered. The post walks through the 13 mods and what each costs."
    subreddits: []
---

Two things kept going wrong when I worked with Claude Code. After a compaction, it forgot conventions it had followed all morning. And when it asked me something, the question scrolled away under its next twenty tool calls, so I answered late or never.

What fixed them was moving the rules out of the prompt and into hooks: a rule now arrives at the moment Claude makes the call it is about, and a question stays on screen until I answer it.

<Stats
  items={[
    {"value": "32", "label": "lines in my CLAUDE.md, most of them pointers to memories"},
    {"value": "22", "label": "triggers that hand a memory over as a tool call needs it"},
    {"value": "13", "label": "mods hooked into Claude Code, about 4,400 lines"}
  ]}
/>

## CLAUDE.md is an index, not the rulebook

My `CLAUDE.md` has four sections, communication, working, git and safety, and most lines are a rule in a sentence plus the path of the memory that holds its detail:

```md
- **Commits**: `global/commit-message-style`. Commit after every task that changes code, without asking. Never push unless I say so.
```

The memories live in lyra, my notes app, which Claude reaches through an MCP server. At the start of a session, a hook fetches lyra's index and puts it in the prompt: one line per memory, with its path, its type and a one-line description. Claude sees what exists without reading any of it.

## A rule arrives with the call it is about

The index alone did not fix compactions: Claude still had to decide to read a memory, and after a compaction it did not know what it had forgotten. So a hook watches every tool call and matches it against 22 triggers. A `git commit` brings the commit message rules, a SQL client brings the SQL rules, a write to a Markdown page brings the prose rules.

A trigger fires either before or after the call. Before, the call is refused once with the memory in the refusal, and Claude runs it again once it follows the rule. After, the call runs and the memory is attached to its result, to check what was just done:

```
The rule this call falls under, to check what was just done against it:

## Memory/global/workflow/issues-with-tea
...
```

Each memory is handed over once per conversation, and a memory Claude read on its own counts too. A compaction clears that list, which is the whole point: whatever the summary dropped comes back the next time a call needs it.

The same mod ends a turn early when it should not end. If Claude edited code and ran no check, the turn is sent back with the repo's validation rule. If the files it edited are still uncommitted, it is sent back again.

## Questions stay above the prompt until answered

The second fix is a tool, `ask`. Claude asks with a recommended answer for each question, and the call returns at once, so it keeps working on whatever does not depend on the answers. The questions stay drawn above the prompt until I answer them, in any words: a small model matches my reply to the questions it answers, and Claude gets them back numbered. A command only I can run, a push or a login, gets the same treatment through `hand`, with the full command ready to copy.

They survive a compaction too: the summary keeps them, and the next prompt hands every open question and action back. And when Claude ends a turn without listing what is still open, the list is appended after its answer.

## A skill is tested on a subagent before I keep it

Skills and agents answer no mistake of Claude's. They hold a workflow in place, so a plan, a debugging session or a review goes the same way every time.

A skill is a page of instructions Claude loads when a task matches its description: writing a plan, debugging a failure, asking for a review. I have 19, and one of them is about writing the others. It treats a skill as code under test.

Before the skill exists, a subagent gets the task with nothing to guide it, and Claude notes where it goes wrong and the excuse it gives for it. The skill is written against those failures only, then the same scenario runs again with the skill loaded. A loophole the second run finds gets closed and tested again. A rule no agent was seen breaking does not go in.

## Searches and reviews go to agents that change nothing

An agent is a subagent with its own instructions, tools and model. I have two, both on Sonnet, both without an edit tool and told to leave the working tree alone.

- **explorer** answers one question about a codebase: where something lives, which files touch it. It returns its conclusion, a `path:line` for each fact, and only the excerpts the caller is about to edit. The files it read on the way never enter the main session's context.
- **code-reviewer** is handed the requirements word for word and the commits made for them. It returns a verdict for each requirement, whatever the diff holds that nobody asked for, and its issues by severity. It reports and never fixes: the session that wrote the code applies the findings in a follow-up commit, which a low-effort variant of the reviewer checks against those findings alone.

## Smaller mods fix smaller habits

- **guards** also refuses commands I never want run: anything on a remote server, a push I did not ask for, `git stash`. The command-line side of that, and the incidents behind it, are in [the CLIs I built for Claude](/posts/agent-clis).
- **agent-cap** caps the subagents running at once, `/agent-cap 5`, and refuses a fork once the context passes half the compaction threshold.
- **git-facts** adds the branch and the last commit to my prompt, only when they changed since the last one.
- **commit-titles** appends the title of each commit Claude made to its answer, so I see what landed without asking.
- **prompt-fold** folds a pasted log over 150 lines through `out` before Claude reads it.
- After four read-only calls in a row, a nudge suggests handing the search to the explorer.

## Every rule costs a round trip

A rule handed over before a call costs one refused call and a retry. A turn sent back for a missing check costs a full check, even after a one-line change. Matching my replies to open questions calls a small model on each prompt that might answer one. A skill costs its subagent runs before it has taught anything. And the hooks themselves are code to maintain: the guards mod alone is about 2,000 lines, 900 of them a shell parser, so a rule reads a command the way bash would rather than by grepping it.

The mods live in my dotfiles, which are private. The command-line tools they lean on are public, in [the CLI post](/posts/agent-clis).
