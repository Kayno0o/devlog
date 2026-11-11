---
title: "My desktop now wears my apps' look"
description: "Chamfer themes my KDE desktop and ten terminal apps on the design system of my self-hosted apps: near-black, hairline frames, and colour only for a state."
date: 2026-11-10
tags: [design, linux]
draft: true
social:
  x: "I reworked my desktop theme to follow the design system of my self-hosted apps: the same near-black ground, the same hairline frames, the same font. One rule stayed: the chrome is grey, and a colour only appears for what it means."
  bluesky: "I reworked my desktop theme to follow the design system of my self-hosted apps: the same near-black ground, the same hairline frames, the same font. One rule stayed: the chrome is grey, and a colour only appears for what it means."
  mastodon: "I reworked Chamfer, my KDE and terminal theme, to follow the design system of my self-hosted apps: the same near-black ground, boxes a step up framed by a 1 px hairline, Space Grotesk, no glow or shadow. One rule stayed from the old theme, after the FAA's flight display conventions: the chrome is grey, and amber and red only appear for a real state. One generator writes it for KDE, kitty, fish, nvim, lazygit and more. #KDE #Linux #Design"
  reddit:
    title: "My KDE theme now follows the design system of my self-hosted web apps, and colour still only means state"
    body: "Chamfer is my KDE and terminal theme, written by one Bun script. I reworked it to follow the design system my self-hosted web apps share: a near-black ground, boxes a step up framed by a 1 px hairline, Space Grotesk, no glow or shadow. One rule stayed from before, after the FAA's guidance for flight displays: grey chrome, an accent for what is selected, and amber and red only for a real state. The post covers the tokens, the rule, the panel widgets, the generator, and what it still does not cover."
    subreddits: []
---

Chamfer is the theme of my KDE desktop and the terminal apps I live in. I reworked it to follow the design system of [my self-hosted apps](/posts/orbit-apps), so going from a terminal to one of them no longer looks like changing machines: the same near-black ground, the same hairline frames, the same font. One rule from the old Chamfer stayed: the chrome is grey, and a colour appears only for what it means.

<Note title="Screenshot to come: the desktop beside an orbit app">

A focused and an unfocused window with their cut corners, the panel and its widgets, a terminal with a prompt and a lazygit diff, next to one of the apps in the browser.

</Note>

## The desktop takes the apps' tokens

My apps share one stylesheet. The page and its header sit on one ground, `#090a10`, and boxes sit a step up, `#11131a` and `#191c25`. Fill alone barely shows that close to black, so every box is framed by a 1 px hairline, the text colour at 11%. Nothing has a glow or a shadow, and each app picks only its accent.

Chamfer now writes those values into KDE's colour scheme, the window decoration, the Plasma theme and every terminal app, and uses the apps' font, Space Grotesk, for the interface. The terminal keeps JetBrains Mono, the apps' monospace font.

## Grey is chrome, colour is a state

The colour rule comes from the FAA's guidance for electronic flight displays, AC 25-11B, and it survived the rework. Magenta, which the FAA uses for targets, is replaced by cyan.

- **White**: current data, such as window text and the prompt's path.
- **Light grey**: labels, dividers, anything inactive, such as unfocused tabs and the prompt character.
- **The accent**: selected, such as the focused window's outline, the active pane and nvim's mode chip.
- **Cyan**: a target, such as the git branch, links and lazygit's rebase base.
- **Green**: normal or done, such as staged files.
- **Amber**: caution, such as modified files, commits to push and a lamp with something to do.
- **Red**: act now, such as a failed command, a conflict or a failed unit.

Syntax is the one exception. On fish's command line and in nvim, VS Code, bat and lazygit's diffs, colour tells tokens apart, so the syntax keeps all eight hues.

## Load is work, not a fault

The panel has four widgets drawn like instruments. The engine widget shows CPU, GPU, memory and VRAM as tapes, and CPU and GPU stay white however busy they are: their temperatures carry the limits, amber from 80 °C and red from 90 °C. Memory turns amber from 80% and red from 90%. VRAM has no limit at all, since games fill it on purpose.

An annunciator holds four lamps for the machine's doctor, health, sync and pending reboot, dark when there is nothing to do. The Claude usage bars turn amber from 70% and red from 90%, with a cyan mark for where the pace says I should be. The network widget shows `VPN` in cyan and turns amber when traffic leaves an autoconnect VPN or there is no route.

## Frames are still cut at 45°

The apps round their corners by 2 to 4 px. Chamfer keeps what it is named after: every frame has its top-left and bottom-right corners cut at 45°. The rest is as flat as the apps: 1 px lines on the pixel grid, no glow, no shadow, no gradient, and no animation, since the generator sets KDE's animation speed to zero.

A window has a 5 px frame, a 28 px title bar and its two far corners cut by 5 px. Title-bar buttons are 21 by 19 with 9 by 9 glyphs, see-through until hovered, and close fills red. Popups and tooltips take the same cut frame. The panel stays square, because Plasma cuts it where it meets the screen edge. Even nvim's floating windows draw their corners with `╱`.

## One generator writes every app's theme

`just chamfer-theme` runs a Bun script that writes a KDE colour scheme, a window decoration, a cursor theme at four sizes, a global theme and the Plasma theme, then the files read by kitty, fish, starship, nvim, lazygit, lazysql, bat, VS Code, yazi and Spotify, and applies them.

None of the output is committed or edited by hand: to change the theme, I change the generator and run it again. The dotfiles commit plain Catppuccin configs instead, which the generated files sit on top of, so a machine without the theme still gets a dark one.

## The generator has no tests of its own

Tests pin the palette, but the generator itself, writing SVG, TOML, JSON, XML and INI files, has none, so a broken target shows up on screen, not in a check. And not everything goes through it: Herdr, the terminal app I moved to after tmux, has a theme I wrote by hand, so its agent states use their own colours. The theme lives in my dotfiles, which are private.
