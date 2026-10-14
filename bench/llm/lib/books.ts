import { basename, join } from 'node:path'
import { Glob } from 'bun'

export interface Book {
  slug: string
  title: string
  author: string
  year: number
  rating: number
  tags: string[]
  body: string
}

const frontmatterAndBody = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

export const booksDir = join(import.meta.dir, '../content/books')

/** Reads the spec's book fixtures, sorted by title as the books page lists them. */
export async function loadBooks(dir = booksDir): Promise<Book[]> {
  const books: Book[] = []

  for await (const file of new Glob('*.md').scan(dir)) {
    const text = await Bun.file(join(dir, file)).text()
    const match = frontmatterAndBody.exec(text)

    if (!match) {
      throw new Error(`${file} has no frontmatter`)
    }

    const [, frontmatter = '', body = ''] = match
    const data = Bun.YAML.parse(frontmatter) as Omit<Book, 'slug' | 'body'>

    books.push({ ...data, slug: basename(file, '.md'), body: body.trim() })
  }

  return books.toSorted(byTitle)
}

export function byTitle(a: Book, b: Book): number {
  if (a.title === b.title)
    return 0

  return a.title < b.title ? -1 : 1
}

/** The home page's "Top rated" order: rating first, then title. */
export function topRated(books: Book[], count = 3): Book[] {
  return books.toSorted((a, b) => b.rating - a.rating || byTitle(a, b)).slice(0, count)
}

export function allTags(books: Book[]): string[] {
  return [...new Set(books.flatMap(book => book.tags))].toSorted()
}
