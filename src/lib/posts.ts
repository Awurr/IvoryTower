import type { CollectionEntry } from 'astro:content';

// The about post lives in the blog collection (so it's listed and written in
// MDX) but is served at /about instead of /blog/about.
export const ABOUT_ID = 'about';

export function postUrl(post: CollectionEntry<'blog'>) {
	return post.id === ABOUT_ID ? '/about/' : `/blog/${post.id}/`;
}
