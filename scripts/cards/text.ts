// Body text of the profile text cards, drawn from the content box's top-left corner.
import { CARD, esc, FONT_STACK, type Palette } from "@sm-steel/neon-kit";
import { GRID } from "./layout.ts";

/** One line, with `link` (if it's on this line) underlined in the accent colour. */
function line(text: string, p: Palette, link?: string): string {
	const at = link ? text.indexOf(link) : -1;
	if (!link || at < 0) return esc(text);
	return (
		esc(text.slice(0, at)) +
		`<tspan fill="${p.accent}" text-decoration="underline">${esc(link)}</tspan>` +
		esc(text.slice(at + link.length))
	);
}

/**
 * `link` only styles the phrase: an <img> SVG can't hold a clickable link, so the
 * README wraps the whole card in <a>.
 */
export function bodyText(lines: string[], p: Palette, link?: string): string {
	return (
		`<g font-family="${FONT_STACK}" font-size="${GRID.bodySize}" fill="${p.text}">` +
		lines
			.map(
				(l, i) =>
					`<text x="0" y="${GRID.bodySize + i * GRID.lineHeight}">${line(l, p, link)}</text>`,
			)
			.join("") +
		`</g>`
	);
}

/** Vector art drawn on a `width` × `height` canvas. */
export interface Art {
	width: number;
	height: number;
	svg: string;
}

/**
 * Where art goes in a text card, in content-box coordinates: flush right, scaled to
 * span the frame from 6px under its top edge down to its bottom edge (cut off there,
 * like a portrait bust). `width` and `height` are the card's content box.
 */
export function placeArt(
	width: number,
	height: number,
	art: Art,
): { x: number; y: number; scale: number } {
	const top = CARD.pad + CARD.titleRow;
	const outer = height + top + CARD.pad;
	const scale = (outer - 1 - 6) / art.height;
	return {
		x: width + CARD.pad - 22 - art.width * scale,
		y: 6 - top,
		scale,
	};
}
