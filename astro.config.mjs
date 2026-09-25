// @ts-check

import { readdirSync, readFileSync } from 'node:fs';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

// Posts with `category: hidden` stay out of the sitemap. Mirrors HIDDEN_CATEGORY
// in src/lib/posts.ts (the config can't read content collections, so it checks
// each post's frontmatter directly).
const BLOG_DIR = './src/content/blog';
const hiddenPaths = readdirSync(BLOG_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .filter((file) => {
        const frontmatter = readFileSync(`${BLOG_DIR}/${file}`, 'utf8').split(/^---\s*$/m)[1] ?? '';
        return /^category:\s*['"]?hidden['"]?\s*$/m.test(frontmatter);
    })
    .map((file) => `/blog/${file.replace(/\.mdx?$/, '').toLowerCase()}/`);

// https://astro.build/config
export default defineConfig({
    site: 'https://awurr.com',
    integrations: [
      mdx(),
      sitemap({ filter: (page) => !hiddenPaths.some((path) => page.endsWith(path)) }),
      react(),
      // Keystatic's editor (/keystatic) needs server routes, so only load it for
      // `npm run dev`. Production builds stay fully static, with no editor online.
      ...(process.env.NODE_ENV === 'production' ? [] : [keystatic()]),
    ],
});