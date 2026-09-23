// Drives the holographic shimmer (.holo / .holo-text in global.css).
// Rebuilds ONE linear-gradient every frame with its color stops shifted by a
// phase value. Do not replace this with repeating gradients, tiled backgrounds
// or sliding background-position: all of those produce a visible seam.

const COLORS = ['#ffb3d1', '#ffe28a', '#3dff9a', '#7fd8ff', '#c9a8ff'];
const SEG = 360; // px between color stops (bigger = smoother, broader bands)
const ANGLE = 100; // gradient angle in degrees
const SCROLL_SPEED = 0.9; // how much scrolling moves the shimmer
const DRIFT_SPEED = 0.03; // idle drift, px per ms

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const n = COLORS.length;
const period = SEG * n;
const rad = (ANGLE * Math.PI) / 180;

function buildGradient(phase: number) {
	// Length of the gradient line across the viewport at this angle
	const L = Math.abs(innerWidth * Math.sin(rad)) + Math.abs(innerHeight * Math.cos(rad));
	const p = ((phase % period) + period) % period;
	const offset = p % SEG;
	const base = Math.floor(p / SEG);
	const stops: string[] = [];
	for (let i = -1; i * SEG <= L + SEG * 2; i++) {
		const color = COLORS[(((i - base) % n) + n) % n];
		stops.push(`${color} ${(i * SEG + offset).toFixed(1)}px`);
	}
	return `linear-gradient(${ANGLE}deg, ${stops.join(', ')})`;
}

const start = performance.now();
function frame(now: number) {
	const drift = reduceMotion.matches ? 0 : (now - start) * DRIFT_SPEED;
	const phase = scrollY * SCROLL_SPEED + drift;
	root.style.setProperty('--holo-bg', buildGradient(phase));
	root.style.setProperty('--sheen-shift', String(((phase * 0.4) % 300) - 100));
	requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
