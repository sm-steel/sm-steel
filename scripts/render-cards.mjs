// Renders the bio/stack cards as real styled images (rounded corners, card
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

const bioCards = [
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

const stackCards = [
  {
    title: "Legacy Scars",
    body: `Years in IT took me from writing scripts to designing distributed systems. My hands still remember VisualBasic 6 and ActionScript, and every kind of pain that hides behind the words "legacy code."`,
  },
  {
    title: "Core Stack",
    body: `PHP · JavaScript/TypeScript · Python — with the ecosystem knowledge to back it, not just the buzzwords. If the question is "which side of the frontend are you on," the answer is React. An informed answer, promise.`,
  },
  {
    title: "Also Fluent In",
    body: "Java, C/C++, PL/SQL, SQL, PowerShell/Bash, CI/CD, Docker, message queues, clustering, load balancing, and enough CAP/PACELC theorem to argue about it at parties nobody invited me to.",
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

// Lays out a list of cards two per row, with a trailing odd card spanning full width.
function grid(cardList, p) {
  const rows = [];
  for (let i = 0; i < cardList.length; i += 2) {
    rows.push(cardList.slice(i, i + 2));
  }
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
      children: rows.map((row) => ({
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "row", gap: 16 },
          children: row.map((c) => card(c, p)),
        },
      })),
    },
  };
}

mkdirSync("assets", { recursive: true });

const fonts = [
  { name: "Consolas", data: regular, weight: 400, style: "normal" },
  { name: "Consolas", data: bold, weight: 700, style: "normal" },
];

async function renderPng(node, width) {
  const svg = await satori(node, { width, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: width * 2 } })
    .render()
    .asPng();
}

for (const p of Object.values(palettes)) {
  writeFileSync(`assets/cards-${p.name}.png`, await renderPng(grid(bioCards, p), WIDTH));
  console.log(`wrote assets/cards-${p.name}.png`);

  writeFileSync(`assets/stack-${p.name}.png`, await renderPng(grid(stackCards, p), WIDTH));
  console.log(`wrote assets/stack-${p.name}.png`);
}
