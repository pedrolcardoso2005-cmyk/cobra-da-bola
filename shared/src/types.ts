// Domain types shared between server and web. The server is the sole
// authority over this state; clients only ever receive it, never compute it.

export type TeamKey = "A" | "B";

export type AnswerSeconds = 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60;

export const ANSWER_SECONDS_OPTIONS: AnswerSeconds[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export type Difficulty = "facil" | "moderado" | "medio" | "dificil" | "impossivel";

export type QuestionCategory =
  | "futebol_brasileiro"
  | "futebol_europeu"
  | "futebol_sulamericano"
  | "libertadores"
  | "champions_league"
  | "copa_do_mundo"
  | "selecoes"
  | "clubes"
  | "jogadores"
  | "historia_do_futebol"
  | "competicoes_nacionais"
  | "competicoes_internacionais"
  | "futebol_saudita"
  | "concacaf"
  | "aleatorio";

export type QuestionFormat =
  | "aberta"
  | "verdadeiro_falso"
  | "sequencia"
  | "multipla_escolha";

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  format: QuestionFormat;
  prompt: string;
  /** Only present for multipla_escolha */
  choices?: string[];
  /** Canonical correct answer. For verdadeiro_falso: "verdadeiro" | "falso". */
  correctAnswer: string;
  /** Alternate accepted spellings/forms, lower-cased, accent-stripped. */
  acceptedAnswers?: string[];
  createdByUserId?: string;
  /** Short note on the fact, shown only to the presenter alongside the answer key. */
  explanation?: string;
  /** URL of the official/reliable source the fact was checked against. */
  sourceUrl?: string;
  /** Season/date the fact refers to, for statistics that change over time. */
  seasonRef?: string;
}

export interface CareerQuestion {
  id: string;
  /** Clubs revealed progressively, in order. */
  clubs: string[];
  playerName: string;
  acceptedAnswers?: string[];
}

export type PlayerButtonState =
  | "blocked" // aguarde, apresentador ainda nao liberou
  | "armed" // liberado, pode apertar
  | "buzzed_self" // este jogador apertou primeiro
  | "buzzed_other" // outro apertou primeiro
  | "eliminated"
  | "qualified"
  | "spectating"; // nao e a vez dele no rodizio / nao esta nesta etapa

export type MatchPhase =
  | "lobby"
  | "phase1"
  | "career"
  | "semifinal"
  | "final"
  | "champion";

export type MatchKind = "casual" | "ranked";

export interface PlayerRef {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  connected: boolean;
  teamId: TeamKey | null;
  eliminated: boolean;
  qualified: boolean;
  /** Position achieved in the career stage this match, if any (1-based). */
  careerRank: number | null;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface TeamState {
  id: TeamKey;
  color: "lima" | "orange";
  score: number;
  playerIds: string[];
  /** Index into playerIds for whose turn is next in the rotation. */
  rotationIndex: number;
}

export interface BuzzState {
  /** Question currently open for buzzing, null if none active. */
  questionOpenedAt: number | null;
  armed: boolean;
  firstPlayerId: string | null;
  buzzOrder: string[];
  /** Player ids who buzzed too late / are locked out for this question. */
  lockedOut: string[];
}

export interface AnswerResult {
  playerId: string;
  submittedAnswer: string | null;
  correct: boolean;
  timedOut: boolean;
  pointsAwardedTo: TeamKey | "player" | "opponent" | "career" | null;
}

export interface TimerState {
  seconds: AnswerSeconds;
  endsAt: number | null;
  /** Only the active responder receives this; broadcast to others as null. */
  remainingForActivePlayer: number | null;
}

export interface CareerRoundState {
  careerQuestionId: string | null;
  revealedClubCount: number;
  eligiblePlayerIds: string[];
  /** players excluded from *this* career round only, after a wrong guess. */
  excludedThisRound: string[];
  buzz: BuzzState;
}

export interface BracketMatchup {
  id: string;
  label: string; // "Semifinal 1", "Final", etc.
  playerAId: string;
  playerBId: string;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
}

export interface HistoryEntry {
  id: string;
  at: number;
  type: string;
  message: string;
  actorUserId: string | null;
  /** Serialized patch for undo support (presenter "desfazer ultima acao"). */
  undo?: Record<string, unknown>;
}

export interface MatchSettings {
  answerSeconds: AnswerSeconds;
  categories: QuestionCategory[];
  difficulties: Difficulty[];
  kind: MatchKind;
  /** Exact number of players the room needs; the match starts
   * automatically (server-authoritative, no host action required) the
   * moment this many players have joined the lobby. */
  targetCount: number;
}

export interface MatchState {
  id: string;
  code: string;
  hostUserId: string;
  createdAt: number;
  phase: MatchPhase;
  settings: MatchSettings;
  participantCount: number;
  players: PlayerRef[];
  teams: TeamState[] | null; // null when format has no teams (n=2 or n=3 career-only)
  phase1: {
    buzz: BuzzState;
    currentQuestionId: string | null;
    usedQuestionIds: string[];
    targetScore: 10;
  } | null;
  career: CareerRoundState | null;
  careerResults: { playerId: string; rank: number }[];
  /** Buzzer-question round shared by semifinal and final 1v1 matchups
   * (same mechanic as Phase 1, just without team rotation). */
  bracketRound: { currentQuestionId: string | null; usedQuestionIds: string[]; buzz: BuzzState } | null;
  semifinal: BracketMatchup[] | null;
  semifinalActiveIndex: number | null;
  final: BracketMatchup | null;
  timer: TimerState | null;
  lastAnswer: AnswerResult | null;
  presenterCue: PresenterCue;
  history: HistoryEntry[];
  winnerUserId: string | null;
  runnerUpUserId: string | null;
  paused: boolean;
}

export type PresenterCue =
  | { type: "idle" }
  | { type: "presenting_question"; text: string }
  | { type: "countdown"; n: 3 | 2 | 1 }
  | { type: "correct"; playerId: string }
  | { type: "wrong"; playerId: string }
  | { type: "qualified"; playerId: string }
  | { type: "eliminated"; playerId: string }
  | { type: "semifinal_start" }
  | { type: "final_start" }
  | { type: "champion"; playerId: string };

/** View of MatchState sent to a given player: hides correct answers and
 * other players' timers, per the rules. */
export interface PlayerView {
  match: Omit<MatchState, "phase1" | "career"> & {
    phase1: Omit<MatchState["phase1"], "currentQuestionId"> & { currentQuestionId: string | null } | null;
  };
  self: PlayerRef;
  currentQuestion: PublicQuestion | null;
  myButtonState: PlayerButtonState;
  canSubmitAnswer: boolean;
  myTimerSecondsLeft: number | null;
}

export interface PublicQuestion {
  id: string;
  prompt: string;
  format: QuestionFormat;
  choices?: string[];
  category: QuestionCategory;
  difficulty: Difficulty;
}

export interface HostQuestionView extends PublicQuestion {
  correctAnswer: string;
  acceptedAnswers?: string[];
}
