import { describe, expect, it } from "vitest";
import { CARD } from "@sm-steel/neon-kit";
import { GRID, layoutCards } from "../cards/layout.ts";

const short = { title: "A", body: "one line" };
const long = {
	title: "B",
	body: "a much longer body that will certainly wrap onto several lines inside a half-width card of this grid layout",
};
const wide = { title: "W", body: "full width", wide: true };

describe("layoutCards", () => {
	it("pairs cards two per row and gives wide cards a full row", () => {
		const g = layoutCards([short, long, wide]);
		const [a, b, w] = g.cells;
		const half = (GRID.width - GRID.gap) / 2;
		expect(a).toMatchObject({ x: 0, y: 0, outerWidth: half });
		expect(b).toMatchObject({ x: half + GRID.gap, y: 0, outerWidth: half });
		expect(w).toMatchObject({ x: 0, outerWidth: GRID.width });
		expect(w?.width).toBe(GRID.width - 2 * CARD.pad);
	});

	it("makes cards in the same row equally tall", () => {
		const g = layoutCards([short, long]);
		expect(g.cells[0]?.height).toBe(g.cells[1]?.height);
		expect(g.cells[1]?.lines.length).toBeGreaterThan(1);
	});

	it("stacks rows with the gap and reports the total height", () => {
		const g = layoutCards([short, long, wide]);
		const [a, , w] = g.cells;
		expect(w?.y).toBe((a?.outerHeight ?? 0) + GRID.gap);
		expect(g.height).toBe((w?.y ?? 0) + (w?.outerHeight ?? 0));
		expect(g.width).toBe(GRID.width);
	});

	it("wraps body text to the card width", () => {
		const g = layoutCards([long]);
		const max = Math.floor((g.cells[0]?.width ?? 0) / (GRID.bodySize * 0.62));
		for (const l of g.cells[0]?.lines ?? []) expect([...l].length).toBeLessThanOrEqual(max);
	});

	it("puts an odd last card alone at half width", () => {
		const g = layoutCards([short, long, short]);
		expect(g.cells[2]).toMatchObject({ x: 0, outerWidth: (GRID.width - GRID.gap) / 2 });
	});
});
