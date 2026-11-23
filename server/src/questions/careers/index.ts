// Loader for the permanent career bank (Desafio das Carreiras). Same idea
// as questions/bank/index.ts: each career has a stable slug derived from
// the player's name, and insertBankCareer skips it if it is already in the
// database, so this runs safely at every server start.
//
// Clubs are the player's main senior clubs, in career order (loans and
// very short spells are often left out).
import { insertBankCareer } from "../../db/questions.js";
import type { CareerTheme } from "@cobra/shared";
import { careers001 } from "./careers-001.js";
import { careers002 } from "./careers-002.js";
import { careers003 } from "./careers-003.js";
import { careers004 } from "./careers-004.js";
import { careers005 } from "./careers-005.js";

export interface BankCareer {
  playerName: string;
  theme: CareerTheme;
  clubs: string[];
  acceptedAnswers?: string[];
}

/** Compact constructor used by the careers-NNN.ts files. */
export function c(playerName: string, theme: CareerTheme, clubs: string[], acceptedAnswers?: string[]): BankCareer {
  return { playerName, theme, clubs, ...(acceptedAnswers ? { acceptedAnswers } : {}) };
}

export const ALL_BANK_CAREERS: BankCareer[] = [...careers001, ...careers002, ...careers003, ...careers004, ...careers005];

export function careerSlug(playerName: string): string {
  return (
    "car-" +
    playerName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

export function loadCareerBank(): { inserted: number; skipped: number; total: number } {
  const seen = new Set<string>();
  let inserted = 0;
  let skipped = 0;
  for (const entry of ALL_BANK_CAREERS) {
    const slug = careerSlug(entry.playerName);
    if (seen.has(slug)) throw new Error(`Jogador duplicado no banco de carreiras: ${entry.playerName}`);
    seen.add(slug);
    if (entry.clubs.length < 2) throw new Error(`Carreira com menos de 2 clubes: ${entry.playerName}`);
    const result = insertBankCareer(slug, entry);
    if (result === "inserted") inserted++;
    else skipped++;
  }
  return { inserted, skipped, total: seen.size };
}
