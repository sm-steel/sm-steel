// Link badges as small neon cards: three equal badges that fill one 900px row in the
// README (each its own image, so each stays its own link).
import { card, esc, FLAVORS, FONT_STACK, type Palette } from "@sm-steel/neon-kit";

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

/** 3 × (258 + 2×16 padding) + 2 × 15 gap = 900. */
export const BADGE = { width: 258, height: 14, gap: 15, fontSize: 11 } as const;

export const badgeText = (b: Badge) =>
	`// ${b.label} :: ${b.value}`.toUpperCase();

export function badgeSvg(b: Badge, theme: Theme): string {
	const base = theme === "light" ? FLAVORS.latte : FLAVORS.mocha;
	const color = b.color(base, theme);
	const p = { ...base, accent: color }; // brackets take the badge's colour
	return card(
		{
			width: BADGE.width,
			height: BADGE.height,
			palette: p,
			seed: `badge:${b.name}`,
			label: `${b.label}: ${b.value}`,
			font: { variant: "hud" },
			glitch: false,
			beam: false,
		},
		`<text x="${BADGE.width / 2}" y="11" text-anchor="middle" font-family="${FONT_STACK}" font-size="${BADGE.fontSize}" letter-spacing="1.2" fill="${p.text}">` +
			`<tspan fill="${color}">//</tspan> ${esc(b.label.toUpperCase())} :: ` +
			`<tspan fill="${color}">${esc(b.value.toUpperCase())}</tspan></text>`,
	);
}
