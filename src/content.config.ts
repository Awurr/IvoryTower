import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
			heroImage: z.optional(image()),
			// Two-layer pixel art (see HeroArt.astro): gray layer under a holo layer
			heroArt: z.optional(z.object({ gray: image(), holo: image() })),
			// Shown as bracket tags on post cards and in "Browse by topic"
			tags: z.array(z.string()).default([]),
			// One per post; each category gets its own filter tab on /blog
			category: z.string().optional(),
		}),
});

export const collections = { blog };
