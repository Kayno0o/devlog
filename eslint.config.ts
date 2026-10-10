import { defineConfig } from '@kaynooo/eslint'

// the benchmark starters are third-party scaffolds linted, if ever, by their own config, and the bookshelf is an agent's built site
export default defineConfig({ strict: true, kay: true }, { ignores: ['bench/llm/starters/**', 'public/llm-bench/bookshelf/**'] })
