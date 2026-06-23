// Decides which YouTube playlists become published courses and their track.

export type Track = "CERTIFICATION" | "CODING" | "OTHER";

export interface Curation {
  track: Track;
  published: boolean;
  order: number;
}

const HIDE_PATTERNS = [
  /shorts/i,
  /giveaway/i,
  /livestream/i,
  /\bppt/i,
  /^misc$/i,
  /puzzles?\s*\(shorts\)/i,
];

const CODING_PATTERNS = [
  /leetcode/i,
  /\bdsa\b/i,
  /game theory/i,
  /\bprimes?\b/i,
  /c\/c\+\+/i,
  /c language/i,
  /liked questions/i,
];

const CERT_PATTERNS = [/\bnism\b/i, /certification/i, /investment adviser/i, /equity deriv/i];

export function classifyPlaylist(title: string, itemCount: number): Curation {
  const hidden = itemCount === 0 || HIDE_PATTERNS.some((re) => re.test(title));

  let track: Track = "OTHER";
  if (CERT_PATTERNS.some((re) => re.test(title))) track = "CERTIFICATION";
  else if (CODING_PATTERNS.some((re) => re.test(title))) track = "CODING";

  const order = track === "CERTIFICATION" ? 0 : track === "CODING" ? 100 : 200;

  return { track, published: !hidden && track !== "OTHER", order };
}
