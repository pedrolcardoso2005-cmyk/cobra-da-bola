// Loader for the permanent question bank. Each batch-NNN.ts file exports a
// flat array of BankQuestion entries with a stable `slug`; this loader
// inserts each one under that slug via insertBankQuestion, which silently
// skips it if that slug already exists. That makes running this at every
// server startup safe and idempotent -- batches already loaded in a
// previous session are never re-inserted or duplicated, and new batch
// files just get picked up the next time the server starts.
import { deleteQuestionsByIds, insertBankQuestion } from "../../db/questions.js";
import { batch001 } from "./batch-001.js";
import { batch002 } from "./batch-002.js";
import { batch003 } from "./batch-003.js";
import { batch004 } from "./batch-004.js";
import type { BankQuestion } from "./batch-001.js";

const batches: BankQuestion[][] = [batch001, batch002, batch003, batch004];

// Slugs that were loaded in an earlier version of a batch and later
// replaced (insertBankQuestion never updates an existing row, so a fixed
// question needs a new slug and the old row has to be removed here).
// Deleting a slug that isn't in the database is a no-op, so this stays
// idempotent. A slug listed here must never be reused by any batch.
export const RETIRED_SLUGS: readonly string[] = [
  // Lote 003, fora da calibragem (commit fb1fe41): regra basica no facil...
  "b3-f-11", "b3-f-12", "b3-f-18",
  // ...e artilheiros/tecnicos de Copa no impossivel.
  "b3-i-04", "b3-i-06", "b3-i-07", "b3-i-08", "b3-i-09",
  "b3-i-11", "b3-i-12", "b3-i-13", "b3-i-14", "b3-i-15",
];

export interface BankLoadResult {
  removed: number;
  inserted: number;
  skipped: number;
  total: number;
}

export function loadQuestionBank(): BankLoadResult {
  const retired = new Set(RETIRED_SLUGS);
  for (const batch of batches) {
    for (const entry of batch) {
      if (retired.has(entry.slug)) {
        throw new Error(`Slug aposentado reaproveitado no banco de perguntas: ${entry.slug}`);
      }
    }
  }
  const removed = deleteQuestionsByIds(RETIRED_SLUGS);
  if (removed > 0) {
    // eslint-disable-next-line no-console
    console.log(`Banco de perguntas: ${removed} perguntas aposentadas removidas.`);
  }

  let inserted = 0;
  let skipped = 0;
  const seenSlugs = new Set<string>();
  for (const batch of batches) {
    for (const entry of batch) {
      if (seenSlugs.has(entry.slug)) {
        throw new Error(`Slug duplicado no banco de perguntas: ${entry.slug}`);
      }
      seenSlugs.add(entry.slug);
      const { slug, ...q } = entry;
      const result = insertBankQuestion(slug, q);
      if (result === "inserted") inserted++;
      else skipped++;
    }
  }
  return { removed, inserted, skipped, total: seenSlugs.size };
}
