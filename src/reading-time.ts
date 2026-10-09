import { readFileSync } from 'node:fs'

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/
const TAG = /<[^>]+>/g
const SPACE = /\s+/
const WORDS_PER_MINUTE = 230

// Minutes a post's Markdown takes to read, its frontmatter and component tags left out.
export function readingMinutes(file: string): number {
  const text = readFileSync(file, 'utf8').replace(FRONTMATTER, '').replace(TAG, ' ')
  const words = text.split(SPACE).filter(word => word !== '').length

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
