import type { LanguageRegistration, ShikiTransformer } from 'shiki'
import kayGrammar from 'kay/kay.tmLanguage.json'
import { createHighlighter } from 'shiki'

const kay: LanguageRegistration = { ...kayGrammar, name: 'kay', embeddedLangs: ['typescript'] }

const highlighter = await createHighlighter({
  themes: ['catppuccin-latte', 'catppuccin-mocha'],
  langs: [kay, 'typescript', 'javascript', 'json', 'yaml', 'bash', 'css', 'html', 'diff', 'dockerfile', 'nginx'],
})

const languages = new Set(highlighter.getLoadedLanguages())

const labelled: ShikiTransformer = {
  pre(node) {
    if (this.options.lang !== 'text')
      node.properties['data-language'] = this.options.lang
  },
}

// Runs at build time only; light-dark() lets the page's color-scheme pick the theme with no script, and app.css labels a block from data-language.
export function highlight(code: string, language: string | undefined): string {
  const lang = language !== undefined && languages.has(language) ? language : 'text'

  return highlighter.codeToHtml(code, { lang, themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' }, defaultColor: 'light-dark()', transformers: [labelled] })
}
