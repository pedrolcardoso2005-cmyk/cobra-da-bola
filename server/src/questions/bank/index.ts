// Loader for the permanent question bank. Each batch-NNN.ts file exports a
// flat array of BankQuestion entries with a stable `slug`; this loader
// inserts each one under that slug via insertBankQuestion, which silently
// skips it if that slug already exists. That makes running this at every
// server startup safe and idempotent -- batches already loaded in a
// previous session are never re-inserted or duplicated, and new batch
// files just get picked up the next time the server starts.
import { insertBankQuestion } from "../../db/questions.js";
import { batch001 } from "./batch-001.js";
import { batch002 } from "./batch-002.js";
import type { BankQuestion } from "./batch-001.js";

const batches: BankQuestion[][] = [batch001, batch002];

export interface BankLoadResult {
  inserted: number;
  skipped: number;
  total: number;
}

export function loadQuestionBank(): BankLoadResult {
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
  return { inserted, skipped, total: seenSlugs.size };
}
