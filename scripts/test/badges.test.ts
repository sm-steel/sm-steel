import { CARD, FLAVORS, hudCharWidth } from "@sm-steel/neon-kit";
import { describe, expect, it } from "vitest";
import { BADGE, BADGES, badgeSvg, badgeText } from "../cards/badges.ts";

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

	it("renders three equal-size badges that fill a 900px row with the gaps", () => {
		const sizes = BADGES.map((b) => size(badgeSvg(b, "dark")));
		expect(new Set(sizes.map((s) => s?.join("x"))).size).toBe(1);
		expect(sizes[0]?.[0]).toBe(BADGE.width + 2 * CARD.pad);
		expect(3 * (BADGE.width + 2 * CARD.pad) + 2 * BADGE.gap).toBe(900);
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

	it("switches to Latte for light and skips glitch and beam", () => {
		const github = BADGES[0];
		if (!github) throw new Error("no badge");
		const light = badgeSvg(github, "light");
		expect(light).toContain(FLAVORS.latte.background);
		expect(light).not.toContain("nk-gk");
		expect(light).not.toContain('class="nk-bm"');
	});
});
