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

/** Optimal-string-alignment distance (Levenshtein + adjacent transposition
 * as a single edit, so a swapped pair of letters costs 1, not 2). Used only
 * to tolerate small typos in free-text answers -- never to judge whether
 * two different words/names happen to be "close". */
function editDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const d: number[][] = Array.from({ length: al + 1 }, () => new Array<number>(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // delecao
        d[i][j - 1] + 1, // insercao
        d[i - 1][j - 1] + cost, // substituicao
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposicao de letras adjacentes
      }
    }
  }
  return d[al][bl];
}

/** How many small typos (letra faltando/trocada/repetida) to tolerate for a
 * normalized answer of this length. Deliberately conservative: nomes curtos
 * (ate 4 letras, onde um unico erro pode virar outro jogador de verdade --
 * ex. "Pele" vs "Pepe") exigem correspondencia exata; so respostas mais
 * longas, onde um erro isolado nao tem como virar um nome diferente
 * valido, ganham tolerancia. */
function typoThreshold(length: number): number {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  return 2;
}

export function answersMatch(submitted: string, correct: string, accepted: string[] = []): boolean {
  const norm = normalizeAnswer(submitted);
  if (!norm) return false;
  const candidates = [correct, ...accepted].map(normalizeAnswer).filter(Boolean);
  if (candidates.includes(norm)) return true;
  return candidates.some((candidate) => {
    const threshold = typoThreshold(Math.max(norm.length, candidate.length));
    if (threshold === 0) return false;
    return editDistance(norm, candidate) <= threshold;
  });
}

export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
