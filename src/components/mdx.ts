// Components usable inside post content without an import. Pass to
// <Content components={mdxComponents} />, and register each one for the
// editor in keystatic.config.ts (fields.mdx → components).
import HoloArt from './HoloArt.astro';
import Quote from './Quote.astro';

export const mdxComponents = { HoloArt, Quote };
