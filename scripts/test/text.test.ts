import { FLAVORS } from "@sm-steel/neon-kit";
import { describe, expect, it } from "vitest";
import { bodyText, placeArt } from "../cards/text.ts";

const p = FLAVORS.mocha;

describe("bodyText", () => {
	it("draws one <text> per line", () => {
		const svg = bodyText(["first", "second"], p);
		expect(svg.match(/<text /g)).toHaveLength(2);
		expect(svg).toContain(">first</text>");
	});

	it("underlines the link phrase in the accent colour", () => {
		const svg = bodyText(
			["Apparently (see: impostor syndrome) a senior dev."],
			p,
			"impostor syndrome",
		);
		expect(svg).toContain(
			`<tspan fill="${p.accent}" text-decoration="underline">impostor syndrome</tspan>`,
		);
		expect(svg).toContain(">Apparently (see: <tspan");
		expect(svg).toContain("</tspan>) a senior dev.</text>");
	});

	it("escapes text around the link", () => {
		const svg = bodyText(["a <b> & link"], p, "link");
		expect(svg).toContain("a &lt;b&gt; &amp; <tspan");
	});
});

describe("placeArt", () => {
	const art = { width: 100, height: 100, svg: "<g/>" };
	// whoami card: content box 868 × 44, outer frame 900 × 98
	const t = placeArt(868, 44, art);
	const top = 16 + 22; // content offset inside the frame: pad + title row
	it("fits the art to the frame's inner height, from the top inset to the bottom edge", () => {
		expect(top + t.y).toBe(6);
		expect(top + t.y + art.height * t.scale).toBeCloseTo(98 - 1, 3);
	});
	it("puts it flush right inside the frame", () => {
		expect(16 + t.x + art.width * t.scale).toBeCloseTo(900 - 22, 3);
	});
	it("leaves the text's longest line clear", () => {
		const longest = "Apparently (see: impostor syndrome) a senior full-stack developer";
		expect(longest.length * 16 * 0.62).toBeLessThan(t.x - 16);
	});
});
