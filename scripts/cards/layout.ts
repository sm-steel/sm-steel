// Grid layout for the profile text cards: two cards per row (wide cards take a
// whole row), equal heights within a row, body text wrapped to the card width.
import { CARD, charsPerLine, wrapLines } from "@sm-steel/neon-kit";
import type { Art } from "./text.ts";

export interface TextCard {
	title: string;
	body: string;
	wide?: boolean;
	/** A phrase in `body` drawn as a link (the README wraps the card in <a>). */
	link?: string;
	/** Vector art drawn flush right, fitted to the frame height. */
	art?: Art;
}

export const GRID = {
	width: 900,
	gap: 16,
	bodySize: 16,
	lineHeight: 24,
} as const;

export interface LaidOutCard {
	card: TextCard;
	/** Outer frame position and size inside the grid. */
	x: number;
	y: number;
	outerWidth: number;
	outerHeight: number;
	/** Content box size passed to card(). */
	width: number;
	height: number;
	lines: string[];
}

/** Height of `n` body lines: baseline spacing plus room for the last line's descenders. */
const textHeight = (n: number) =>
	(n - 1) * GRID.lineHeight + GRID.bodySize + 4;

export function layoutCards(cards: TextCard[]): {
	width: number;
	height: number;
	cells: LaidOutCard[];
} {
	const half = (GRID.width - GRID.gap) / 2;
	const rows: TextCard[][] = [];
	for (const c of cards) {
		const last = rows.at(-1);
		if (!c.wide && last?.length === 1 && !last[0]?.wide) last.push(c);
		else rows.push([c]);
	}

	const cells: LaidOutCard[] = [];
	let y = 0;
	for (const row of rows) {
		const outerWidth = row[0]?.wide ? GRID.width : half;
		const width = outerWidth - 2 * CARD.pad;
		// "\n" in a body forces a line break; each part wraps on its own
		const wrapped = row.map((c) =>
			c.body
				.split("\n")
				.flatMap((part) =>
					wrapLines(part, charsPerLine(width, GRID.bodySize)),
				),
		);
		const height = Math.max(...wrapped.map((l) => textHeight(l.length)));
		const outerHeight = height + 2 * CARD.pad + CARD.titleRow;
		row.forEach((card, i) => {
			cells.push({
				card,
				x: i * (half + GRID.gap),
				y,
				outerWidth,
				outerHeight,
				width,
				height,
				lines: wrapped[i] ?? [],
			});
		});
		y += outerHeight + GRID.gap;
	}
	return { width: GRID.width, height: y - GRID.gap, cells };
}
