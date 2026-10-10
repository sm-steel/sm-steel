// Renders the profile's neon cards into assets/ as animated SVGs (Mocha for dark,
// Latte for light): the whoami, bio and stack text cards, plus the footer artwork.
// Static content, so run it by hand and commit the output:
//
//   node scripts/render-cards.ts      (or: mise run cards)
//
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { card, cardGrid, FLAVORS, type Palette, r3 } from "@sm-steel/neon-kit";
import sharp from "sharp";
import { BADGES, badgeSvg, type Theme } from "./cards/badges.ts";
import { bioCards, stackCards, whoamiCards } from "./cards/content.ts";
import { GRID, layoutCards, type TextCard } from "./cards/layout.ts";
import { type Art, bodyText, placeArt } from "./cards/text.ts";

const ASSETS = join(import.meta.dirname, "..", "assets");
const THEMES: [Theme, Palette][] = [
	["dark", FLAVORS.mocha],
	["light", FLAVORS.latte],
];

/** A card's art, flush right and fitted to the frame height (see placeArt). */
function artSvg(c: TextCard, width: number, height: number): string {
	if (!c.art) return "";
	const t = placeArt(width, height, c.art);
	return `<g transform="translate(${r3(t.x)} ${r3(t.y)}) scale(${r3(t.scale)})">${c.art.svg}</g>`;
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
			content: bodyText(c.lines, p, c.card.link) + artSvg(c.card, c.width, c.height),
		})),
	);
}

/** A transparent image as card art (PNG keeps the alpha channel). */
async function imageArt(file: string): Promise<Art> {
	const png = await sharp(file).png({ compressionLevel: 9 }).toBuffer();
	const meta = await sharp(png).metadata();
	const width = meta.width ?? 0;
	const height = meta.height ?? 0;
	return {
		width,
		height,
		svg: `<image width="${width}" height="${height}" href="data:image/png;base64,${png.toString("base64")}"/>`,
	};
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

const whoami: TextCard[] = whoamiCards.map((c) => ({ ...c }));
const first = whoami[0];
if (first) first.art = await imageArt(join(ASSETS, "whoami-frieren.gif"));

for (const [theme, p] of THEMES) {
	const out: [string, string][] = [
		[`whoami-${theme}.svg`, textGrid("whoami", "whoami", whoami, p)],
		[`bio-${theme}.svg`, textGrid("bio", "A little about me", bioCards, p)],
		[`stack-${theme}.svg`, textGrid("stack", "Stack", stackCards, p)],
		[
			`footer-${theme}.svg`,
			await artCard("footer", join(ASSETS, "footer.jpg"), p),
		],
		...BADGES.map((b, i): [string, string] => [
			`badge-${b.name}-${theme}.svg`,
			badgeSvg(b, theme, i),
		]),
	];
	for (const [file, svg] of out) {
		await writeFile(join(ASSETS, file), svg);
		console.log(`wrote assets/${file} (${Math.round(svg.length / 1024)} KB)`);
	}
}
