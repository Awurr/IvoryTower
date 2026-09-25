import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Image paths may be written relative to the post ('../../assets/x.png') or, as
// Keystatic's file pickers save them, relative to the project root
// ('src/assets/x.png'). Posts live two folders below src/, so convert the latter.
const fromProjectRoot = (value: unknown) =>
	typeof value === 'string' && value.startsWith('src/') ? `../../${value.slice(4)}` : value;

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			// Shown under the title on the post page only
			subtitle: z.string().optional(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// Social-preview image; also shown as the hero when there's no heroArt
			heroImage: z.preprocess(fromProjectRoot, image().optional()),
			// Two-layer pixel art (see HeroArt.astro): gray layer under a holo layer
			// Keystatic writes `heroArt: {}` when both pickers are empty; treat any
			// half-filled value as "no art" so the post falls back to heroImage
			heroArt: z.preprocess(
				(value) =>
					value && typeof value === 'object' && 'gray' in value && 'holo' in value
						? { gray: fromProjectRoot(value.gray), holo: fromProjectRoot(value.holo) }
						: undefined,
				z.object({ gray: image(), holo: image() }).optional(),
			),
			// Shown as bracket tags on post cards and in "Browse by topic"
			tags: z.array(z.string()).default([]),
			// One per post; each category gets its own filter tab on /blog
			category: z.string().optional(),
		}),
});

export const collections = { blog };
