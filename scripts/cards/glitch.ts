// A digital glitch for a single raw RGB video frame, in the neon-kit style: a red/cyan
// channel split plus horizontal tear bands, some tinted with the kit's glitch colours.
// `intensity` 0 leaves the frame untouched; 1 is the peak of the glitch.
import { FLAVORS } from "@sm-steel/neon-kit";

/** Small seeded PRNG (mulberry32), so a frame glitches the same way every render. */
function rng(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const rgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
const TINTS = [rgb(FLAVORS.mocha.glitchA), rgb(FLAVORS.mocha.glitchB)];

export function glitchFrame(
	src: Buffer,
	width: number,
	height: number,
	intensity: number,
	seed: number,
): Buffer {
	if (intensity <= 0) return Buffer.from(src);
	const rand = rng(seed);
	const clampX = (x: number) => Math.min(width - 1, Math.max(0, x));
	const out = Buffer.alloc(src.length);

	// channel split: red pulled from the right, blue from the left
	const dx = 1 + Math.round(intensity * width * 0.012);
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 3;
			out[i] = src[(y * width + clampX(x + dx)) * 3] ?? 0;
			out[i + 1] = src[i + 1] ?? 0;
			out[i + 2] = src[(y * width + clampX(x - dx)) * 3 + 2] ?? 0;
		}

	// tear bands: rows shifted sideways (wrapping), every other one tinted
	const bands = 2 + Math.round(6 * intensity);
	for (let b = 0; b < bands; b++) {
		const y0 = Math.floor(rand() * height);
		const bh = Math.max(1, Math.round((0.01 + 0.05 * rand()) * height));
		const shift = Math.round((rand() * 2 - 1) * intensity * width * 0.08);
		const tint = b % 2 === 0 ? TINTS[b % 4 === 0 ? 0 : 1] : undefined;
		for (let y = y0; y < Math.min(height, y0 + bh); y++) {
			const row = Buffer.from(out.subarray(y * width * 3, (y + 1) * width * 3));
			for (let x = 0; x < width; x++) {
				const from = (((x - shift) % width) + width) % width;
				for (let c = 0; c < 3; c++) {
					let v = row[from * 3 + c] ?? 0;
					if (tint) v = Math.round(v + (tint[c] - v) * 0.3 * intensity);
					out[(y * width + x) * 3 + c] = v;
				}
			}
		}
	}
	return out;
}
