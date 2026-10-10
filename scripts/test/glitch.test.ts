import { describe, expect, it } from "vitest";
import { glitchFrame } from "../cards/glitch.ts";

// 64 × 32 RGB gradient, so shifted pixels differ from the originals
const W = 64;
const H = 32;
const frame = () => {
	const b = Buffer.alloc(W * H * 3);
	for (let y = 0; y < H; y++)
		for (let x = 0; x < W; x++) {
			const i = (y * W + x) * 3;
			b[i] = x * 4;
			b[i + 1] = y * 8;
			b[i + 2] = 255 - x * 4;
		}
	return b;
};

describe("glitchFrame", () => {
	it("leaves the frame untouched at intensity 0", () => {
		expect(glitchFrame(frame(), W, H, 0, 1).equals(frame())).toBe(true);
	});
	it("tears and colour-splits the frame at full intensity", () => {
		const out = glitchFrame(frame(), W, H, 1, 1);
		let changed = 0;
		const src = frame();
		for (let i = 0; i < src.length; i++) if (out[i] !== src[i]) changed++;
		expect(changed / src.length).toBeGreaterThan(0.2);
	});
	it("is deterministic for a seed and differs between seeds", () => {
		const a = glitchFrame(frame(), W, H, 0.8, 7);
		expect(glitchFrame(frame(), W, H, 0.8, 7).equals(a)).toBe(true);
		expect(glitchFrame(frame(), W, H, 0.8, 8).equals(a)).toBe(false);
	});
	it("keeps the frame size", () => {
		expect(glitchFrame(frame(), W, H, 0.5, 3)).toHaveLength(W * H * 3);
	});
});
