/** Moderate, comfortable reading pace for the word-by-word question
 * reveal -- shared by server (freezing the authoritative word count the
 * instant someone buzzes) and client (animating the live reveal from the
 * same anchor) so neither side can drift out of sync with the other. */
export const REVEAL_WORD_MS = 200;

/** Normalizes free-text answers for comparison: lower-case, strip accents,
 * collapse whitespace, drop punctuation. Used for open-answer judging hints
 * only — the presenter always makes the final call. */
export function normalizeAnswer(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function answersMatch(submitted: string, correct: string, accepted: string[] = []): boolean {
  const norm = normalizeAnswer(submitted);
  if (!norm) return false;
  const candidates = [correct, ...accepted].map(normalizeAnswer);
  return candidates.includes(norm);
}

export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
