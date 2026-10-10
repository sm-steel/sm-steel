import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { avifSize } from "../cards/avif.ts";

describe("avifSize", () => {
	it("reads width and height from the ispe box of an animated AVIF", async () => {
		const buf = await readFile(join(import.meta.dirname, "..", "..", "assets", "footer.avif"));
		expect(avifSize(buf)).toEqual({ width: 736, height: 416 });
	});
	it("throws on a file without an ispe box", () => {
		expect(() => avifSize(Buffer.from("not an avif"))).toThrow(/ispe/);
	});
});
