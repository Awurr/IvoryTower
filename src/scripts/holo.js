// Drives the holographic shimmer (.holo / .holo-text / post headings in global.css).
// Rebuilds ONE linear-gradient every frame with its color stops shifted by a
// phase value. Do not replace this with repeating gradients, tiled backgrounds
// or sliding background-position: all of those produce a visible seam.
//
// The gradient is sized to the whole document and each element is positioned
// onto its own slice of it, so separate elements still read as windows onto one
// shared sheet. This is anchored to the page rather than the viewport on purpose:
// `background-attachment: fixed` forces main-thread scrolling, which made the
// shimmer text visibly lag behind the rest of the page.
//
// Plain JS (not TS) because BaseLayout inlines it at the end of <body>: an
// inline script runs before the first paint, so the page never flashes the
// unscaled CSS fallback gradient the way a deferred module script did.

(() => {
	const COLORS = ['#ffb3d1', '#ffe28a', '#3dff9a', '#7fd8ff', '#c9a8ff'];
	const SEG = 360; // px between color stops (bigger = smoother, broader bands)
	const ANGLE = 100; // gradient angle in degrees
	const SCROLL_SPEED = 0.9; // how much scrolling moves the shimmer
	const DRIFT_SPEED = 0.03; // idle drift, px per ms
	const HOLO_SELECTOR = '.holo, .holo-text, .prose :is(h1, h2, h3, h4, h5, h6)';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const root = document.documentElement;
	const n = COLORS.length;
	const period = SEG * n;
	const rad = (ANGLE * Math.PI) / 180;

	/** @type {HTMLElement[]} */
	let els = [];
	let docW = 0;
	let docH = 0;
	let dirty = true;

	/** @param {HTMLElement} el */
	function clear(el) {
		el.style.removeProperty('background-image');
		el.style.removeProperty('background-size');
		el.style.removeProperty('background-position');
		el.style.removeProperty('--sheen-shift');
	}

	// Place every shimmer element on its slice of the document-sized gradient.
	function measure() {
		const next = [...document.querySelectorAll(HOLO_SELECTOR)];
		for (const el of els) if (!next.includes(el)) clear(el); // e.g. a tab that went holo -> plain
		els = next;
		docW = root.clientWidth;
		docH = root.scrollHeight;
		for (const el of els) {
			const r = el.getBoundingClientRect();
			el.style.backgroundSize = `${docW}px ${docH}px`;
			el.style.backgroundPosition = `${-(r.left + scrollX)}px ${-(r.top + scrollY)}px`;
		}
	}

	/** @param {number} phase */
	function buildGradient(phase) {
		// Length of the gradient line across the document at this angle
		const L = Math.abs(docW * Math.sin(rad)) + Math.abs(docH * Math.cos(rad));
		const p = ((phase % period) + period) % period;
		const offset = p % SEG;
		const base = Math.floor(p / SEG);
		const stops = [];
		for (let i = -1; i * SEG <= L + SEG * 2; i++) {
			const color = COLORS[(((i - base) % n) + n) % n];
			stops.push(`${color} ${(i * SEG + offset).toFixed(1)}px`);
		}
		return `linear-gradient(${ANGLE}deg, ${stops.join(', ')})`;
	}

	// Re-measure whenever layout may have moved things
	const invalidate = () => (dirty = true);
	new ResizeObserver(invalidate).observe(document.body);
	new MutationObserver(invalidate).observe(document.body, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: ['class', 'hidden'],
	});
	addEventListener('resize', invalidate);
	addEventListener('load', invalidate);
	document.fonts.ready.then(invalidate);

	// Random starting point in the color cycle, so each load looks a little different
	const startPhase = Math.random() * period;
	const start = performance.now();

	// Set per element rather than as a variable on <html>: a root custom property
	// changing every frame makes the browser restyle the entire page.
	/** @param {number} now */
	function frame(now) {
		if (dirty) {
			measure();
			dirty = false;
		}
		const drift = reduceMotion.matches ? 0 : (now - start) * DRIFT_SPEED;
		const phase = startPhase + scrollY * SCROLL_SPEED + drift;
		const bg = buildGradient(phase);
		const sheen = String(((phase * 0.4) % 300) - 100);
		for (const el of els) {
			el.style.backgroundImage = bg;
			if (el.classList.contains('holo')) el.style.setProperty('--sheen-shift', sheen);
		}
		requestAnimationFrame(frame);
	}
	// Paint the first frame synchronously (before the browser's first paint), then animate
	frame(performance.now());
})();
