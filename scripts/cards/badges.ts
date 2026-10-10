// Link badges as small neon cards: three equal badges that fill one 900px row in the
// README (each its own image, so each stays its own link).
import {
	CARD,
	CURSOR_CSS,
	cardGrid,
	cursorRect,
	esc,
	FLAVORS,
	FONT_STACK,
	type Palette,
	r3,
} from "@sm-steel/neon-kit";

export type Theme = "dark" | "light";

export interface Badge {
	name: string;
	label: string;
	value: string;
	href: string;
	/** Badge colour per theme (Catppuccin Mocha / Latte). */
	color: (p: Palette, theme: Theme) => string;
}

// Catppuccin green isn't part of the kit palette.
const GREEN: Record<Theme, string> = { dark: "#a6e3a1", light: "#40a02b" };

export const BADGES: Badge[] = [
	{
		name: "github",
		label: "GitHub",
		value: "sm-steel",
		href: "https://github.com/sm-steel",
		color: (p) => p.accent,
	},
	{
		name: "blog",
		label: "Blog",
		value: "CRON-ically Unstable",
		href: "https://t.me/cronically_unstable",
		color: (p) => p.levels[0],
	},
	{
		name: "site",
		label: "Site",
		value: "smsteel.ru",
		href: "https://smsteel.ru",
		color: (_, theme) => GREEN[theme],
	},
];

/**
 * Each badge image is a 300px `slot`, so 3 slots tile the README's 900px row exactly
 * (no page whitespace between them). The 290px frame (258 content + 2×16 padding) sits
 * flush left / centred / flush right in its slot, leaving 15px `gap`s between badges.
 * `cursor` is the blinking block's width; it sits 2px after the text.
 */
export const BADGE = {
	slot: 300,
	width: 258,
	height: 14,
	gap: 15,
	fontSize: 11,
	cursor: 5,
} as const;

export const badgeText = (b: Badge) =>
	`// ${b.label} :: ${b.value}`.toUpperCase();

/** Monospace width of the badge text (0.62em glyphs + 1.2px letter-spacing). */
export const badgeTextWidth = (b: Badge) =>
	[...badgeText(b)].length * (BADGE.fontSize * 0.62 + 1.2);

/** `index` (0-2) is the badge's position in the row. */
export function badgeSvg(b: Badge, theme: Theme, index = 0): string {
	const base = theme === "light" ? FLAVORS.latte : FLAVORS.mocha;
	const color = b.color(base, theme);
	const p = { ...base, accent: color }; // brackets take the badge's colour
	const cx = r3((BADGE.width - BADGE.cursor) / 2);
	const frame = BADGE.width + 2 * CARD.pad;
	const options = {
		width: BADGE.width,
		height: BADGE.height,
		palette: p,
		seed: `badge:${b.name}`,
		label: `${b.label}: ${b.value}`,
		beam: false,
	};
	const content =
		// text + cursor are centred together, so the text shifts left by half the cursor
		`<style>${CURSOR_CSS}</style>` +
			`<text x="${cx}" y="11" text-anchor="middle" font-family="${FONT_STACK}" font-size="${BADGE.fontSize}" letter-spacing="1.2" fill="${p.text}">` +
			`<tspan fill="${color}">//</tspan> ${esc(b.label.toUpperCase())} :: ` +
			`<tspan fill="${color}">${esc(b.value.toUpperCase())}</tspan></text>` +
		cursorRect(r3(cx + badgeTextWidth(b) / 2 + 2), 11, p);
	return cardGrid(
		{
			width: BADGE.slot,
			height: BADGE.height + 2 * CARD.pad,
			label: options.label,
			font: { variant: "hud" },
		},
		[{ x: (index * (BADGE.slot - frame)) / 2, y: 0, options, content }],
	);
}
