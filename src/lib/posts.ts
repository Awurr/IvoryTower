import { type CollectionEntry, getCollection } from 'astro:content';

// The about post lives in the blog collection (so it's listed and written in
// MDX) but is served at /about instead of /blog/about.
export const ABOUT_ID = 'about';

// Posts with this category still get a page, but are left out of every listing
// (archive, home page, RSS), the sitemap, and search engines (noindex).
// astro.config.mjs mirrors this check for the sitemap.
export const HIDDEN_CATEGORY = 'hidden';

export function postUrl(post: CollectionEntry<'blog'>) {
	return post.id === ABOUT_ID ? '/about/' : `/blog/${post.id}/`;
}

export function isHidden(post: CollectionEntry<'blog'>) {
	return post.data.category === HIDDEN_CATEGORY;
}

/** Every post that should appear in listings, newest first */
export async function getListedPosts() {
	return (await getCollection('blog', (post) => !isHidden(post))).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}
