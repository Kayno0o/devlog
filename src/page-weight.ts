import type { KayExtension } from 'kay/server'
import { brotliCompressSync } from 'node:zlib'

const slot = '<span data-page-weight></span>'
const tag = /<(img|script|link)\b[^>]*>/g
const src = /\bsrc="([^"]+)"/
const href = /\bhref="([^"]+)"/
const rel = /\brel="([^"]+)"/
const type = /\btype="([^"]+)"/
const compressed = /\.(?:css|m?js|svg|json|xml|txt|html)$/
// what a browser fetches on a first visit; touch icons, the manifest and feeds wait for the visitor to ask
const fetchedRels = new Set(['stylesheet', 'modulepreload'])
const javascriptTypes = new Set(['module', 'text/javascript'])
const htmlLang = /<html\s[^>]*lang="([^"]+)"/
// The line in the page's language, English for any other: an extension sees the page's HTML, not its request.
const english = { label: 'This page: ', unit: ' KB', noJavascript: ', no JavaScript' }
const lines = new Map([['en', english], ['fr', { label: 'Cette page\u00A0: ', unit: '\u00A0Ko', noJavascript: ', sans JavaScript' }]])

function linkedUrls(html: string): { urls: Set<string>, javascript: boolean } {
  const urls = new Set<string>()
  const icons: string[] = []
  let svgIcon: string | undefined
  let javascript = false

  for (const [element, name] of html.matchAll(tag)) {
    if (name === 'link') {
      const url = href.exec(element)?.[1]
      const relation = rel.exec(element)?.[1] ?? ''

      if (url !== undefined && relation === 'icon') {
        icons.push(url)
        svgIcon ??= type.exec(element)?.[1] === 'image/svg+xml' ? url : undefined
      }
      else if (url !== undefined && fetchedRels.has(relation)) {
        urls.add(url)
      }

      continue
    }

    if (name === 'script') {
      const scriptType = type.exec(element)?.[1]

      javascript ||= scriptType === undefined || javascriptTypes.has(scriptType)
    }

    const url = src.exec(element)?.[1]

    if (url !== undefined) {
      urls.add(url)
    }
  }

  // a browser drawing SVG icons fetches the SVG one alone; the others are for browsers that do not
  for (const icon of svgIcon === undefined ? icons : [svgIcon]) {
    urls.add(icon)
  }

  return { urls, javascript }
}

// Text goes out brotli, as kay and nginx compress it; an image or an icon goes out as it is.
async function servedSize(path: string): Promise<number> {
  const bytes = await Bun.file(path).bytes()

  return compressed.test(path) ? brotliCompressSync(bytes).length : bytes.length
}

function line(bytes: number, javascript: boolean, lang: string): string {
  const text = lines.get(lang) ?? english
  const size = `${(bytes / 1024).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${text.unit}`

  return `<span data-page-weight>${text.label}${size}${javascript ? '' : text.noJavascript}.</span>`
}

// Fills the footer's slot with what a first visit downloads as served: the page and every file it fetches, each once.
export const pageWeight: KayExtension = {
  name: 'page-weight',
  async transformPage({ html, file }) {
    if (!html.includes(slot)) {
      return html
    }

    const { urls, javascript } = linkedUrls(html)
    const lang = htmlLang.exec(html)?.[1] ?? 'en'
    const paths = await Promise.all([...urls].map(async url => file(url)))
    const sizes = await Promise.all(paths.filter(path => path !== undefined).map(async path => servedSize(path)))
    const linked = sizes.reduce((sum, size) => sum + size, 0)
    // measured once more with the line in place, which it adds a few bytes to
    const estimate = html.replace(slot, () => line(brotliCompressSync(html).length + linked, javascript, lang))

    return html.replace(slot, () => line(brotliCompressSync(estimate).length + linked, javascript, lang))
  },
}
