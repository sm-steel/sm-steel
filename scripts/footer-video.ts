// Turns the Grok footer video into assets/footer.avif: one forward pass whose end
// glitches into its start, so the loop's jump from the last frame back to the first
// happens inside the glitch instead of in plain sight.
//
//   node scripts/footer-video.ts <video.mp4>      (or: mise run footer -- <video.mp4>)
//
// Frame order: clean frames GLITCH..n-GLITCH-1, then the last GLITCH frames glitching
// in, then the first GLITCH frames settling back; looping returns to clean frame GLITCH.
// Needs ffmpeg (pinned in mise.toml). Then run `mise run cards` to rebuild the card.
import { execFileSync, spawn } from "node:child_process";
import { join } from "node:path";
import { glitchFrame } from "./cards/glitch.ts";

const WIDTH = 736;
const FPS = 24;
const GLITCH = 4;
const RISE = [0.15, 0.4, 0.8, 1];
const FALL = [1, 0.7, 0.35, 0.1];

const input = process.argv[2];
if (!input) throw new Error("usage: node scripts/footer-video.ts <video.mp4>");
const output = join(import.meta.dirname, "..", "assets", "footer.avif");

const [srcW, srcH] = execFileSync("ffprobe", [
	"-v", "error", "-select_streams", "v:0",
	"-show_entries", "stream=width,height", "-of", "csv=p=0", input,
])
	.toString()
	.trim()
	.split(",")
	.map(Number);
const height = Math.round((WIDTH * (srcH ?? 1)) / (srcW ?? 1) / 2) * 2;
const size = WIDTH * height * 3;

const raw = execFileSync(
	"ffmpeg",
	["-v", "error", "-i", input, "-vf", `fps=${FPS},scale=${WIDTH}:${height}:flags=lanczos`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
	{ maxBuffer: 1 << 30 },
);
const frames = Array.from({ length: Math.floor(raw.length / size) }, (_, i) =>
	raw.subarray(i * size, (i + 1) * size),
);
const n = frames.length;
if (n < 4 * GLITCH) throw new Error(`video too short: ${n} frames`);

const sequence: Buffer[] = [
	...frames.slice(GLITCH, n - GLITCH),
	...frames.slice(n - GLITCH).map((f, i) => glitchFrame(f, WIDTH, height, RISE[i] ?? 1, 100 + i)),
	...frames.slice(0, GLITCH).map((f, i) => glitchFrame(f, WIDTH, height, FALL[i] ?? 0, 200 + i)),
];

const enc = spawn("ffmpeg", [
	"-v", "error", "-y",
	"-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${WIDTH}x${height}`, "-r", String(FPS), "-i", "-",
	"-vf", "format=yuv420p",
	"-c:v", "libaom-av1", "-crf", "30", "-b:v", "0", "-cpu-used", "6", "-row-mt", "1",
	"-loop", "0", "-f", "avif", output,
], { stdio: ["pipe", "inherit", "inherit"] });
for (const f of sequence) if (!enc.stdin.write(f)) await new Promise((r) => enc.stdin.once("drain", r));
enc.stdin.end();
const code = await new Promise((r) => enc.on("close", r));
if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
console.log(`wrote assets/footer.avif: ${n} frames, ${GLITCH * 2} glitched around the loop point`);
