import { collection, config, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

// Local-only editor for blog posts: run `npm run dev` and open /keystatic.
// Saves plain .mdx files into src/content/blog, which Astro reads as usual.
//
// Every frontmatter key in src/content.config.ts must have a field here:
// Keystatic rewrites the whole frontmatter on save, so unknown keys would be lost.

// Picks an existing file in src/assets/art or any subfolder; stored as a
// root-relative path such as 'src/assets/art/Test.Gray.png' (content.config.ts
// converts it for Astro).
const artLayer = (label: string, layer: 'Gray' | 'Holo', isRequired = false) =>
	fields.pathReference({
		label,
		pattern: `src/assets/art/**/*.${layer}.png`,
		validation: { isRequired },
	});

export default config({
	storage: { kind: 'local' },
	collections: {
		posts: collection({
			label: 'Posts',
			slugField: 'title',
			path: 'src/content/blog/*',
			format: { contentField: 'content' },
			entryLayout: 'content',
			columns: ['title', 'pubDate', 'category'],
			schema: {
				title: fields.slug({
					name: { label: 'Title' },
					slug: {
						label: 'URL slug',
						description:
							'The file name and URL. Keep "about" for the About page — it is served at /about.',
					},
				}),
				subtitle: fields.text({
					label: 'Subtitle',
					description: 'Shown under the title on the post page only.',
				}),
				description: fields.text({
					label: 'Description',
					description: 'Used on cards, the archive, RSS and link previews.',
					multiline: true,
					validation: { isRequired: true },
				}),
				pubDate: fields.date({
					label: 'Publish date',
					defaultValue: { kind: 'today' },
					validation: { isRequired: true },
				}),
				updatedDate: fields.date({ label: 'Last updated' }),
				category: fields.text({
					label: 'Category',
					description:
						'One per post; each gets its own tab on /blog. Use "hidden" to keep a post out of every listing.',
				}),
				tags: fields.array(fields.text({ label: 'Tag' }), {
					label: 'Tags',
					itemLabel: (props) => props.value || 'Tag',
				}),
				heroArt: fields.object(
					{
						gray: artLayer('Gray layer', 'Gray'),
						holo: artLayer('Holo layer', 'Holo'),
					},
					{
						label: 'Hero art',
						description: 'Pick both layers from src/assets/art. Leave both empty for no art.',
					},
				),
				heroImage: fields.pathReference({
					label: 'Hero image (social previews)',
					description:
						'Used for link previews, and as the hero when there is no hero art. Save images directly in src/assets/ to see them here.',
					// Top level of src/assets only, so the art layers don't clutter the list
					pattern: 'src/assets/*.{jpg,jpeg,png,webp}',
				}),
				content: fields.mdx({
					label: 'Content',
					options: {
						// Toolbar image button: uploads go to src/assets/images/blog/<slug>/ and
						// the post links them relative to its own file, so Astro optimizes them
						image: {
							directory: 'src/assets/images/blog',
							publicPath: '../../assets/images/blog/',
						},
					},
					// Blocks available from the editor's insert menu. Each must also be in
					// src/components/mdx.ts so the site can render it.
					components: {
						HoloArt: block({
							label: 'Holo art',
							description: 'Two-layer pixel art from src/assets/art, with the shimmer.',
							schema: {
								gray: artLayer('Gray layer', 'Gray', true),
								holo: artLayer('Holo layer', 'Holo', true),
								scale: fields.select({
									label: 'Max scale',
									description: 'Drops to a smaller whole number if it would not fit.',
									options: [
										{ label: '3x (pixels match the border lines)', value: '3' },
										{ label: '2x', value: '2' },
										{ label: '1x', value: '1' },
									],
									defaultValue: '3',
								}),
								caption: fields.text({ label: 'Caption' }),
							},
						}),
						Quote: wrapper({
							label: 'Quote',
							description: 'A quote with an attribution line underneath.',
							schema: {
								attribution: fields.text({
									label: 'Attribution',
									description: 'Who said it, e.g. "Rob Pike". Leave empty for none.',
								}),
							},
						}),
					},
				}),
			},
		}),
	},
});
