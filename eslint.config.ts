import { defineConfig } from '@kaynooo/eslint'

// the benchmark starters are third-party scaffolds linted, if ever, by their own config
export default defineConfig({ strict: true, kay: true }, { ignores: ['bench/llm/starters/**'] })
