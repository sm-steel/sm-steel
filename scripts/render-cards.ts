// Renders the profile's neon cards into assets/ as animated SVGs (Mocha for dark,
// Latte for light): the bio and stack text cards, plus the banner and footer artwork.
// Static content, so run it by hand and commit the output:
//
//   node scripts/render-cards.ts      (or: mise run cards)
//
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
	card,
	cardGrid,
	esc,
	FLAVORS,
	FONT_STACK,
	type Palette,
} from "@sm-steel/neon-kit";
import sharp from "sharp";
import { bioCards, stackCards } from "./cards/content.ts";
import { GRID, layoutCards, type TextCard } from "./cards/layout.ts";

const ASSETS = join(import.meta.dirname, "..", "assets");
const THEMES: [string, Palette][] = [
	["dark", FLAVORS.mocha],
	["light", FLAVORS.latte],
];

/** Body text lines, drawn from the content box's top-left corner. */
function bodyText(lines: string[], p: Palette): string {
	return (
		`<g font-family="${FONT_STACK}" font-size="${GRID.bodySize}" fill="${p.text}">` +
		lines
			.map(
				(l, i) =>
					`<text x="0" y="${GRID.bodySize + i * GRID.lineHeight}">${esc(l)}</text>`,
			)
			.join("") +
		`</g>`
	);
}

function textGrid(
	name: string,
	label: string,
	cards: TextCard[],
	p: Palette,
): string {
	const g = layoutCards(cards);
	return cardGrid(
		{ width: g.width, height: g.height, label, font: { variant: "text" } },
		g.cells.map((c) => ({
			x: c.x,
			y: c.y,
			options: {
				width: c.width,
				height: c.height,
				palette: p,
				seed: `${name}:${c.card.title}`,
				label: c.card.title,
				title: c.card.title,
			},
			content: bodyText(c.lines, p),
		})),
	);
}

/** Artwork scaled to 2× the content width (sharp, JPEG q80) and framed as one card. */
async function artCard(name: string, file: string, p: Palette): Promise<string> {
	const width = GRID.width - 32;
	const meta = await sharp(file).metadata();
	const height = Math.round((width * (meta.height ?? 1)) / (meta.width ?? 1));
	const jpeg = await sharp(file)
		.resize({ width: width * 2 })
		.jpeg({ quality: 80, mozjpeg: true })
		.toBuffer();
	return card(
		{ width, height, palette: p, seed: `art:${name}`, label: `${name} artwork` },
		`<image width="${width}" height="${height}" href="data:image/jpeg;base64,${jpeg.toString("base64")}" preserveAspectRatio="xMidYMid slice"/>`,
	);
}

for (const [theme, p] of THEMES) {
	const out: [string, string][] = [
		[`bio-${theme}.svg`, textGrid("bio", "A little about me", bioCards, p)],
		[`stack-${theme}.svg`, textGrid("stack", "Stack", stackCards, p)],
		[
			`banner-${theme}.svg`,
			await artCard("banner", join(ASSETS, "banner.jpg"), p),
		],
		[
			`footer-${theme}.svg`,
			await artCard("footer", join(ASSETS, "footer.jpg"), p),
		],
	];
	for (const [file, svg] of out) {
		await writeFile(join(ASSETS, file), svg);
		console.log(`wrote assets/${file} (${Math.round(svg.length / 1024)} KB)`);
	}
}
