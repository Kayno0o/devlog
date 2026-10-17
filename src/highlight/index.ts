import type { LanguageRegistration, ShikiTransformer, ThemeRegistration } from 'shiki'
import kayGrammar from 'kay/kay.tmLanguage.json'
import { bundledThemes, createHighlighter } from 'shiki'

const kay: LanguageRegistration = { ...kayGrammar, name: 'kay', embeddedLangs: ['typescript'] }

const mantle = '#e6e9ef'

function luminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((at) => {
    const channel = Number.parseInt(hex.slice(at, at + 2), 16) / 255

    return channel <= 0.039_28 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

// Scaling every channel alike darkens a color and keeps its hue, until it reaches AA's 4.5 contrast on the code blocks' mantle.
function readable(hex: string): string {
  const channels = [1, 3, 5].map(at => Number.parseInt(hex.slice(at, at + 2), 16))
  let darker = hex

  for (let scale = 1; (luminance(mantle) + 0.05) / (luminance(darker) + 0.05) < 4.5; scale -= 0.01) {
    darker = `#${channels.map(channel => Math.round(channel * scale).toString(16).padStart(2, '0')).join('')}${hex.slice(7)}`
  }

  return darker
}

// Most of Latte's accents fall under AA's contrast on its own mantle: yellow is 2.15.
const latte = (await bundledThemes['catppuccin-latte']()).default
const readableLatte: ThemeRegistration = {
  ...latte,
  name: 'catppuccin-latte-readable',
  tokenColors: (latte.tokenColors ?? []).map(rule => rule.settings.foreground === undefined ? rule : { ...rule, settings: { ...rule.settings, foreground: readable(rule.settings.foreground) } }),
}

const highlighter = await createHighlighter({
  themes: [readableLatte, 'catppuccin-mocha'],
  langs: [kay, 'typescript', 'tsx', 'javascript', 'svelte', 'astro', 'vue', 'json', 'yaml', 'bash', 'css', 'html', 'diff', 'dockerfile', 'nginx'],
})

const languages = new Set(highlighter.getLoadedLanguages())

// Runs at build time only; light-dark() lets the page's color-scheme pick the theme with no script, and app.css labels a block from data-language.
export function highlight(code: string, language: string | undefined): string {
  const lang = language !== undefined && languages.has(language) ? language : 'text'
  // Inside the function: kay caches compiled posts by its source, so a change here recompiles them.
  const labelled: ShikiTransformer = {
    pre(node) {
      if (lang !== 'text')
        node.properties['data-language'] = lang
    },
  }

  return highlighter.codeToHtml(code, { lang, themes: { light: readableLatte.name!, dark: 'catppuccin-mocha' }, defaultColor: 'light-dark()', transformers: [labelled] })
}
