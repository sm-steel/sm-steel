import { CARD, FLAVORS, hudCharWidth } from "@sm-steel/neon-kit";
import { describe, expect, it } from "vitest";
import {
	BADGE,
	BADGES,
	badgeSvg,
	badgeText,
	badgeTextWidth,
} from "../cards/badges.ts";

const size = (svg: string) =>
	svg.match(/width="([\d.]+)" height="([\d.]+)"/)?.slice(1).map(Number);

describe("badges", () => {
	it("keeps today's three links", () => {
		expect(BADGES.map((b) => [b.name, b.href])).toEqual([
			["github", "https://github.com/sm-steel"],
			["blog", "https://t.me/cronically_unstable"],
			["site", "https://smsteel.ru"],
		]);
	});

	it("renders three equal 300px slots that tile a 900px row exactly", () => {
		const sizes = BADGES.map((b, i) => size(badgeSvg(b, "dark", i)));
		expect(new Set(sizes.map((s) => s?.join("x"))).size).toBe(1);
		expect(sizes[0]?.[0]).toBe(BADGE.slot);
		expect(3 * BADGE.slot).toBe(900);
	});

	it("puts the frame flush with the row's outer edges and 15px gaps between", () => {
		const frame = BADGE.width + 2 * CARD.pad;
		const xs = BADGES.map((b, i) =>
			Number(badgeSvg(b, "dark", i).match(/<svg x="([\d.]+)"/)?.[1]),
		);
		const starts = xs.map((x, i) => i * BADGE.slot + x);
		expect(starts[0]).toBe(0); // left edge flush
		expect((starts[2] ?? 0) + frame).toBe(900); // right edge flush
		expect((starts[1] ?? 0) - ((starts[0] ?? 0) + frame)).toBe(BADGE.gap);
		expect((starts[2] ?? 0) - ((starts[1] ?? 0) + frame)).toBe(BADGE.gap);
	});

	it("fits every label in the content width at the badge font size", () => {
		for (const b of BADGES) {
			const chars = [...badgeText(b)].length;
			const width = chars * (BADGE.fontSize * 0.62 + 1.2);
			expect(width).toBeLessThanOrEqual(BADGE.width);
		}
		// sanity: our metric matches the kit's HUD metric at 10px
		expect(10 * 0.62 + 1.2).toBe(hudCharWidth());
	});

	it("uses the badge's colour for // and the value, and for its brackets", () => {
		const blog = BADGES.find((b) => b.name === "blog");
		if (!blog) throw new Error("no blog badge");
		const svg = badgeSvg(blog, "dark");
		const blue = FLAVORS.mocha.levels[0];
		expect(svg).toContain(`<tspan fill="${blue}">//</tspan>`);
		expect(svg).toContain(`<tspan fill="${blue}">CRON-ICALLY UNSTABLE</tspan>`);
		expect(svg).toMatch(new RegExp(`<path d="[^"]+" fill="none" stroke="${blue}"`));
	});

	it("switches to Latte for light, glitches (staggered) but has no beam", () => {
		const github = BADGES[0];
		if (!github) throw new Error("no badge");
		const light = badgeSvg(github, "light");
		expect(light).toContain(FLAVORS.latte.background);
		expect(light).toMatch(/class="nk\d*-gk0"/); // cardGrid namespaces the card
		expect(light).not.toMatch(/class="nk\d*-bm"/);
		const tear = (svg: string) =>
			svg.match(/@keyframes nk\d*-gk0\{[^}]*\}/)?.[0];
		const tears = BADGES.map((b) => tear(badgeSvg(b, "dark")));
		expect(new Set(tears).size).toBe(3);
	});

	it("blinks a cursor right after the value, inside the badge", () => {
		for (const b of BADGES) {
			const svg = badgeSvg(b, "dark");
			expect(svg).toContain(".nk-cur{animation:nk-blink");
			const x = Number(svg.match(/class="nk-cur" x="([\d.]+)"/)?.[1]);
			const textRight = BADGE.width / 2 + badgeTextWidth(b) / 2 - BADGE.cursor / 2;
			expect(x).toBeGreaterThan(textRight);
			expect(x + BADGE.cursor).toBeLessThanOrEqual(BADGE.width);
		}
	});
});
