// Profile card text (moved verbatim from the old satori renderer).
import type { TextCard } from "./layout.ts";

export const whoamiCards: TextCard[] = [
  {
    title: "whoami",
    body: "Apparently (see: impostor syndrome) a senior full-stack developer\nwith bipolar disorder.",
    link: "impostor syndrome",
    wide: true,
  },
];

export const bioCards: TextCard[] = [
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

export const stackCards: TextCard[] = [
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
