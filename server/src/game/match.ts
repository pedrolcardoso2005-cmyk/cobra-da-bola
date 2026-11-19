import type { MatchSettings, MatchState } from "@cobra/shared";

export function createInitialMatch(opts: {
  id: string;
  code: string;
  hostUserId: string;
  settings: MatchSettings;
}): MatchState {
  return {
    id: opts.id,
    code: opts.code,
    hostUserId: opts.hostUserId,
    createdAt: Date.now(),
    phase: "lobby",
    settings: opts.settings,
    participantCount: 0,
    players: [],
    teams: null,
    phase1: null,
    career: null,
    careerResults: [],
    bracketRound: null,
    semifinal: null,
    semifinalActiveIndex: null,
    final: null,
    timer: null,
    lastAnswer: null,
    presenterCue: { type: "idle" },
    history: [],
    winnerUserId: null,
    runnerUpUserId: null,
    paused: false,
  };
}
