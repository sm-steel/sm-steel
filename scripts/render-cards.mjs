// Renders the "about me" bio cards as real styled images (rounded corners, card
// backgrounds, borders) since GitHub strips <style> attributes from README HTML.
// Run once, commit the resulting PNGs — content is static prose, not live data.
//
//   node render-cards.mjs
//
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const FONTS_DIR = "C:/Windows/Fonts";
const regular = readFileSync(`${FONTS_DIR}/consola.ttf`);
const bold = readFileSync(`${FONTS_DIR}/consolab.ttf`);

const palettes = {
  dark: {
    name: "dark",
    base: "#1e1e2e",
    surface: "#313244",
    border: "#45475a",
    text: "#cdd6f4",
    subtext: "#a6adc8",
    accent: "#cba6f7",
  },
  light: {
    name: "light",
    base: "#eff1f5",
    surface: "#e6e9ef",
    border: "#ccd0da",
    text: "#4c4f69",
    subtext: "#6c6f85",
    accent: "#8839ef",
  },
};

const cards = [
  {
    title: "Code & Sound",
    body: "I write code by day and disappear into FL Studio by night, making tracks for the imaginary soundtrack of my own life.",
  },
  {
    title: "Anime as Therapy",
    body: "I watch anime through the lens of cognitive behavioral therapy. Current favorites: Frieren: Beyond Journey's End and Fullmetal Alchemist: Brotherhood.",
  },
  {
    title: "Cooking",
    body: "Watch a bunch of guides, then combine them. Borscht simmers for 8 hours during a manic phase, then it's instant noodles for months. Still computing the perfect al dente in O(1).",
  },
  {
    title: "League of Legends",
    body: "My longest toxic relationship. ADC/jungle. Manically leveling accounts for 13 years running.",
  },
  {
    title: "Path of Exile",
    body: "Playing for 10+ years and still not sure why. I optimize builds in PoB instead of optimizing my life.",
    wide: true,
  },
];

const WIDTH = 900;

function card({ title, body, wide }, p) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: wide ? WIDTH - 32 : (WIDTH - 32 - 16) / 2,
        padding: "20px 24px",
        borderRadius: 14,
        backgroundColor: p.surface,
        border: `1px solid ${p.border}`,
        gap: 8,
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: 20, fontWeight: 700, color: p.accent },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: 16, color: p.text, lineHeight: 1.5 },
            children: body,
          },
        },
      ],
    },
  };
}

function layout(p) {
  const [c0, c1, c2, c3, c4] = cards;
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: WIDTH,
        padding: 16,
        gap: 16,
        backgroundColor: p.base,
        fontFamily: "Consolas",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", gap: 16 },
            children: [card(c0, p), card(c1, p)],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", gap: 16 },
            children: [card(c2, p), card(c3, p)],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row" },
            children: [card(c4, p)],
          },
        },
      ],
    },
  };
}

mkdirSync("assets", { recursive: true });

for (const p of Object.values(palettes)) {
  const svg = await satori(layout(p), {
    width: WIDTH,
    fonts: [
      { name: "Consolas", data: regular, weight: 400, style: "normal" },
      { name: "Consolas", data: bold, weight: 700, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH * 2 } })
    .render()
    .asPng();
  writeFileSync(`assets/cards-${p.name}.png`, png);
  console.log(`wrote assets/cards-${p.name}.png`);
}
