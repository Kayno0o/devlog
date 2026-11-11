---
title: "A desktop themed like a cockpit: colour means state"
description: "Chamfer themes my KDE desktop and ten terminal apps from one generator. In its Cockpit palette the chrome is grey, and anything coloured wants attention."
date: 2026-11-10
tags: [design, linux]
draft: true
social:
  x: "My desktop theme has one rule: a colour means something or it isn't there. The chrome is grey, amethyst is selected, cyan is a target, amber and red only appear for a real state. One generator writes it for KDE and ten terminal apps."
  bluesky: "My desktop theme has one rule: a colour means something or it isn't there. The chrome is grey, amethyst is selected, cyan is a target, and amber and red only appear for a real state. One generator writes it for KDE and ten terminal apps."
  mastodon: "My KDE desktop theme follows the colour conventions of the FAA's guidance for flight displays: the chrome is grey, amethyst is selected, cyan is a target, and amber and red only appear for a real state, or they stop being noticed. Window corners cut at 45°, Airbus's B612 as the UI font, and one generator writing it for KDE, kitty, fish, nvim, lazygit and more. #KDE #Linux #Design"
  reddit:
    title: "A KDE theme where colour only means state, after the FAA's flight display conventions"
    body: "Chamfer is my KDE and terminal theme, generated from OKLCH palettes by one Bun script. Its Cockpit palette follows the colour conventions of the FAA's guidance for electronic flight displays: grey chrome, an accent for what is selected, cyan for a target, and amber and red only for a real state. Syntax highlighting is exempt and keeps eight hues. The post covers the rules, the panel widgets, the generator and what it writes, and what is still not covered by it."
    subreddits: []
---

Chamfer is the theme of my KDE desktop and the terminal apps I live in. Its Cockpit palette has one rule: a new element takes the colour of what it means, not the colour that looks good. The chrome is grey, and anything coloured is selected, a target, or a state that wants attention. Amber and red only ever appear for a real state, or they stop being noticed.

<Stats
  items={[
    {"value": "7", "label": "colours in Cockpit, each with one meaning"},
    {"value": "6", "label": "palettes, each a few OKLCH numbers"},
    {"value": "10", "label": "apps themed besides KDE, from kitty to VS Code"}
  ]}
/>

<Note title="Screenshot to come: the Cockpit desktop">

A focused and an unfocused window with their cut corners, the panel and its widgets, a terminal with a prompt and a lazygit diff.

</Note>

## Grey is chrome, colour is a state

Cockpit follows the colour conventions of the FAA's guidance for electronic flight displays, AC 25-11B. Magenta, which the FAA uses for targets, is replaced by cyan so it cannot be mistaken for the purple accent.

- **White**, `#e5e8eb`: current data, such as window text and the prompt's path.
- **Light grey**, `#727577`: labels, dividers, anything inactive, such as unfocused tabs and the prompt character.
- **Amethyst**, `#b67ef9`: selected, such as the focused window's outline, the active pane and nvim's mode chip.
- **Cyan**, `#67def2`: a target, such as the git branch, links and lazygit's rebase base.
- **Green**, `#79c15f`: normal or done, such as staged files.
- **Amber**, `#de9d16`: caution, such as modified files, commits to push and a lamp with something to do.
- **Red**, `#fb817f`: act now, such as a failed command, a conflict or a failed unit.

Syntax is the one exception. On fish's command line and in nvim, VS Code, bat and lazygit's diffs, colour tells tokens apart, so every palette keeps all eight hues there.

## Load is work, not a fault

The panel has four widgets drawn like instruments. The engine widget shows CPU, GPU, memory and VRAM as tapes, and CPU and GPU stay white however busy they are: their temperatures carry the limits, amber from 80 °C and red from 90 °C. Memory turns amber from 80% and red from 90%. VRAM has no limit at all, since games fill it on purpose.

An annunciator holds four lamps for the machine's doctor, health, sync and pending reboot, dark when there is nothing to do. The Claude usage bars turn amber from 70% and red from 90%, with a cyan mark for where the pace says I should be. The network widget shows `VPN` in cyan and turns amber when traffic leaves an autoconnect VPN or there is no route.

## Frames are cut at 45°

Every frame has its top-left and bottom-right corners cut at 45°, the shape the theme is named after. The rest is flat: 1 px lines on the pixel grid, no glow, no shadow, no gradient, and no animation, since the generator sets KDE's animation speed to zero.

A window has a 5 px frame, a 28 px title bar and its two far corners cut by 5 px. Title-bar buttons are 21 by 19 with 9 by 9 glyphs, see-through until hovered, and close fills red. Popups and tooltips take the same cut frame. The panel stays square, because Plasma cuts it where it meets the screen edge. Even nvim's floating windows draw their corners with `╱`.

The UI font is B612, the typeface Airbus had made for cockpit screens, which keeps 0 and O, 1, l and I, 5 and S, 8 and B apart. Instrument labels are uppercase and letter-spaced, numbers are tabular.

## A palette is a few numbers

Each palette is a call that names a tint for the greys, an accent and a second accent, all in OKLCH:

```ts
cockpit: palette({ name: 'Cockpit', tint: [250, 0.005], accent: [0.7, 0.18, 303], accent2: [0.84, 0.11, 210], hues: [0.74, 0.15], ladder: BLACK_LADDER, neutral: true, font: 'B612' }),
```

The greys sit on a ladder of ten OKLCH lightnesses, so every palette spaces them the same way. Cockpit's ladder starts on true black for an OLED screen, the five others on a near-black charcoal. The eight syntax hues share one lightness and chroma, so none shouts over the others. `neutral: true` is what makes Cockpit's chrome grey; the other five tint their title bars and prompt with the accent.

## One generator writes every app's theme

`just chamfer-theme cockpit` runs a Bun script that writes, for each of the six palettes, a KDE colour scheme, a window decoration, a cursor theme at four sizes and a global theme, so any of them can be picked from KDE's settings. For the palette chosen, it also writes the Plasma theme and the files read by kitty, fish, starship, nvim, lazygit, lazysql, bat, VS Code, yazi and Spotify, then applies them.

None of the output is committed or edited by hand: to change the theme, I change the generator and run it again. The dotfiles commit plain Catppuccin configs instead, which the generated files sit on top of, so a machine without the theme still gets a dark one.

## The generator has no tests of its own

Six tests pin the palettes: Cockpit on true black with grey chrome and B612, both ladders getting lighter step by step, lazygit's greyed-out authors. The generator itself, 1,074 lines writing SVG, TOML, JSON, XML and INI files, has none, so a broken target shows up on screen, not in a check. And not everything goes through it: Herdr, the terminal app I moved to after tmux, has a theme I wrote by hand, so its agent states use their own colours. The theme lives in my dotfiles, which are private.
