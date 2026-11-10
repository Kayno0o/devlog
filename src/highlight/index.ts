import type { LanguageRegistration, ShikiTransformer, ThemeRegistration } from 'shiki'
import kayGrammar from 'kay/kay.tmLanguage.json'
import { createHighlighter } from 'shiki'

const kay: LanguageRegistration = { ...kayGrammar, name: 'kay', embeddedLangs: ['typescript'] }

// The light code blocks' surface, from app.css.
const surface = '#e4e9f1'

function luminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((at) => {
    const channel = Number.parseInt(hex.slice(at, at + 2), 16) / 255

    return channel <= 0.039_28 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

// Scaling every channel alike darkens a color and keeps its hue, until it reaches AA's 4.5 contrast on the code blocks' surface.
function readable(hex: string): string {
  const channels = [1, 3, 5].map(at => Number.parseInt(hex.slice(at, at + 2), 16))
  let darker = hex

  for (let scale = 1; (luminance(surface) + 0.05) / (luminance(darker) + 0.05) < 4.5; scale -= 0.01) {
    darker = `#${channels.map(channel => Math.round(channel * scale).toString(16).padStart(2, '0')).join('')}${hex.slice(7)}`
  }

  return darker
}

interface Palette {
  text: string
  comment: string
  keyword: string
  string: string
  tag: string
  fn: string
  type: string
}

// A few colors over the site's own: kay's amber for keywords, a cool blue for strings, the rest kept to the background.
function orbitTheme(name: string, type: 'light' | 'dark', colors: Palette): ThemeRegistration {
  return {
    name,
    type,
    colors: { 'editor.background': type === 'light' ? surface : '#10141e', 'editor.foreground': colors.text },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: colors.comment } },
      { scope: ['keyword', 'storage', 'keyword.operator.new', 'keyword.control'], settings: { foreground: colors.keyword } },
      { scope: ['string', 'string.template', 'punctuation.definition.string'], settings: { foreground: colors.string } },
      { scope: ['entity.name.tag', 'constant', 'constant.numeric', 'constant.language', 'support.constant'], settings: { foreground: colors.tag } },
      { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], settings: { foreground: colors.fn } },
      { scope: ['entity.name.type', 'support.type', 'support.class', 'entity.other.attribute-name', 'meta.attribute entity.other.attribute-name'], settings: { foreground: colors.type } },
      { scope: ['keyword.operator', 'punctuation'], settings: { foreground: colors.text } },
    ],
  }
}

const dark = orbitTheme('orbit-dark', 'dark', { text: '#dbe0ea', comment: '#7f889c', keyword: '#f5b83d', string: '#9fc2f2', tag: '#e8a6c8', fn: '#8fd3c7', type: '#f2d29b' })
// Each color is pulled down to AA on the light surface if it falls short.
const light = orbitTheme('orbit-light', 'light', Object.fromEntries(Object.entries({ text: '#141b2b', comment: '#566176', keyword: '#95580a', string: '#2b5a9a', tag: '#9a3a6c', fn: '#1f6f62', type: '#7a5a12' }).map(([key, hex]) => [key, readable(hex)])) as Record<keyof Palette, string>)

const highlighter = await createHighlighter({
  themes: [light, dark],
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

  return highlighter.codeToHtml(code, { lang, themes: { light: light.name!, dark: dark.name! }, defaultColor: 'light-dark()', transformers: [labelled] })
}
