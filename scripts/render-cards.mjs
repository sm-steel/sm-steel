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

// A standalone section title — transparent background, sits directly on the page,
// same font/weight as the card titles above.
function titleLayout(text, p) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        padding: "4px 2px",
        fontSize: 26,
        fontWeight: 700,
        color: p.accent,
        fontFamily: "Consolas",
      },
      children: text,
    },
  };
}

// A single wide card whose body is multiple paragraphs (for the Stack section).
function textCardLayout(title, paragraphs, p) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: WIDTH - 32,
        padding: "20px 24px",
        borderRadius: 14,
        backgroundColor: p.surface,
        border: `1px solid ${p.border}`,
        gap: 10,
        fontFamily: "Consolas",
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: 20, fontWeight: 700, color: p.accent },
            children: title,
          },
        },
        ...paragraphs.map((body) => ({
          type: "div",
          props: {
            style: { fontSize: 16, color: p.text, lineHeight: 1.5 },
            children: body,
          },
        })),
      ],
    },
  };
}

const stackParagraphs = [
  `Years in IT took me from writing scripts to designing distributed systems. My hands still remember VisualBasic 6 and ActionScript, and every kind of pain that hides behind the words "legacy code."`,
  `Core stack: PHP · JavaScript/TypeScript · Python — with the ecosystem knowledge to back it, not just the buzzwords. If the question is "which side of the frontend are you on," the answer is React. An informed answer, promise.`,
  `Also comfortable in Java, C/C++, PL/SQL, SQL, PowerShell/Bash, CI/CD, Docker, message queues, clustering, load balancing, and enough CAP/PACELC theorem to argue about it at parties nobody invited me to.`,
];

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
  writeFileSync(`assets/cards-${p.name}.png`, await renderPng(layout(p), WIDTH));
  console.log(`wrote assets/cards-${p.name}.png`);

  writeFileSync(
    `assets/title-about-${p.name}.png`,
    await renderPng(titleLayout("A little about me, self-aware:", p), 700),
  );
  console.log(`wrote assets/title-about-${p.name}.png`);

  writeFileSync(
    `assets/title-links-${p.name}.png`,
    await renderPng(titleLayout("Links", p), 200),
  );
  console.log(`wrote assets/title-links-${p.name}.png`);

  writeFileSync(
    `assets/card-stack-${p.name}.png`,
    await renderPng(textCardLayout("Stack", stackParagraphs, p), WIDTH),
  );
  console.log(`wrote assets/card-stack-${p.name}.png`);
}
