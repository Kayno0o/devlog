import type { LanguageRegistration } from 'shiki'
import { createHighlighter } from 'shiki'
import kayGrammar from './kay.tmLanguage.json'

// Copied from kayjs's editors/vscode/syntaxes, which the published package does not ship.
const kay: LanguageRegistration = { ...kayGrammar, name: 'kay', embeddedLangs: ['typescript'] }

const highlighter = await createHighlighter({
  themes: ['catppuccin-latte', 'catppuccin-mocha'],
  langs: [kay, 'typescript', 'javascript', 'json', 'yaml', 'bash', 'css', 'html', 'diff', 'dockerfile', 'nginx'],
})

const languages = new Set(highlighter.getLoadedLanguages())

// Runs at build time only; light-dark() lets the page's color-scheme pick the theme with no script.
export function highlight(code: string, language: string | undefined): string {
  const lang = language !== undefined && languages.has(language) ? language : 'text'

  return highlighter.codeToHtml(code, { lang, themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' }, defaultColor: 'light-dark()' })
}
