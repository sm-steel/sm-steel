// Size of an (animated) AVIF image. sharp can't open AVIF sequences, but every AVIF
// carries an `ispe` (image spatial extents) box: 4 bytes version/flags, then the
// width and height as big-endian uint32s.

export function avifSize(buf: Buffer): { width: number; height: number } {
	const at = buf.indexOf("ispe", 0, "latin1");
	if (at < 0 || at + 16 > buf.length) throw new Error("no ispe box: not an AVIF?");
	return { width: buf.readUInt32BE(at + 8), height: buf.readUInt32BE(at + 12) };
}
