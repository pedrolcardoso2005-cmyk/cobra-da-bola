import type {
  AnswerSeconds,
  Difficulty,
  HostQuestionView,
  MatchState,
  PlayerButtonState,
  PlayerView,
  PublicQuestion,
  QuestionCategory,
  TeamKey,
} from "./types.js";

/** Events a client (player / screen / host) sends to the server. */
export interface ClientToServerEvents {
  "room:join": (
    payload: { code: string; role: "player" | "screen" | "host" },
    ack: (res: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  "room:create": (
    payload: { answerSeconds: AnswerSeconds; categories: QuestionCategory[]; difficulties: Difficulty[] },
    ack: (res: { ok: true; code: string } | { ok: false; error: string }) => void,
  ) => void;
  "room:setTeams": (payload: { assignments: Record<string, TeamKey>; mode: "manual" | "random" }) => void;
  "room:start": () => void;
  "room:pause": () => void;
  "room:resume": () => void;

  "host:releaseQuestion": (payload: { questionId?: string }) => void;
  "host:armButtons": () => void;
  "host:revealNextClub": () => void;
  "host:judge": (payload: { playerId: string; correct: boolean }) => void;
  "host:endCareerRound": () => void;
  "host:advance": () => void;
  "host:adjustScore": (payload: { teamOrPlayerId: string; delta: number }) => void;
  "host:undo": () => void;
  "host:endMatch": () => void;

  "player:buzz": (payload: { questionId: string; clientSentAt: number }) => void;
  "player:submitAnswer": (payload: { questionId: string; answer: string }) => void;

  "matchmaking:enter": (
    payload: { targetCount: number; answerSeconds: AnswerSeconds },
    ack: (res: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  "matchmaking:cancel": () => void;
}

/** Events the server pushes to clients. */
export interface ServerToClientEvents {
  "room:state": (payload: { match: MatchState }) => void;
  /** Public view of the current question/career clubs, safe for screen and players. */
  "room:question": (payload: { question: PublicQuestion | null; careerClubs: string[] | null }) => void;
  /** Host-only: the answer key for the current question/career, to judge against. */
  "host:answerKey": (payload: { question: HostQuestionView | null; careerPlayerName: string | null }) => void;
  "player:view": (payload: PlayerView) => void;
  "player:buttonState": (payload: { state: PlayerButtonState }) => void;
  "error": (payload: { message: string }) => void;
  "room:closed": (payload: { reason: string }) => void;

  "matchmaking:queued": (payload: { targetCount: number; waiting: number }) => void;
  "matchmaking:found": (payload: { code: string; isHost: boolean }) => void;
}

export const SOCKET_PATH = "/cobra/socket.io";
